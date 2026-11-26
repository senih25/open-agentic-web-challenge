import type { JsonValue, DisclosureField, FieldDecision } from "./types.js";

/** Reject prototype-sensitive object keys at every depth. */
function assertSafeRecord(value: JsonValue, path = "$"): void {
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertSafeRecord(item, `${path}[${index}]`));
    return;
  }
  if (value !== null && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      if (key === "__proto__" || key === "prototype" || key === "constructor") {
        throw new TypeError(`Unsafe property name at ${path}.`);
      }
      assertSafeRecord(child, `${path}.${key}`);
    }
  }
}

function getPath(source: Record<string, JsonValue>, path: string): JsonValue | undefined {
  const segments = path.split(".");
  let current: JsonValue | undefined = source;
  for (const segment of segments) {
    if (!segment || current === null || Array.isArray(current) || typeof current !== "object") {
      return undefined;
    }
    current = (current as Record<string, JsonValue>)[segment];
  }
  return current;
}

function setPath(target: Record<string, JsonValue>, path: string, value: JsonValue): void {
  const segments = path.split(".");
  let current = target;
  for (const segment of segments.slice(0, -1)) {
    const existing = current[segment];
    if (existing === undefined) {
      current[segment] = {};
    } else if (existing === null || Array.isArray(existing) || typeof existing !== "object") {
      throw new TypeError(`Disclosure path conflicts with a scalar at ${segment}.`);
    }
    current = current[segment] as Record<string, JsonValue>;
  }
  current[segments.at(-1)!] = value;
}

function hasOnlyAllowedPaths(value: JsonValue, prefix: string, allowed: Set<string>): boolean {
  if (Array.isArray(value)) {
    return allowed.has(prefix);
  }
  if (value !== null && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      const childPath = prefix ? `${prefix}.${key}` : key;
      if (!hasOnlyAllowedPaths(child, childPath, allowed)) return false;
    }
    return true;
  }
  return allowed.has(prefix);
}

export interface ProjectionResult {
  payload: Record<string, JsonValue>;
  sharedPaths: string[];
  withheldPaths: string[];
}

/**
 * Build the exact peer payload from explicit user-selected paths.
 * Unspecified fields and undeclared payload paths are always withheld.
 */
export function projectPayload(
  source: Record<string, JsonValue>,
  fields: DisclosureField[],
  decisions: FieldDecision[],
): ProjectionResult {
  assertSafeRecord(source);

  const declared = new Map(fields.map((field) => [field.path, field]));
  if (declared.size !== fields.length) {
    throw new TypeError("Disclosure field paths must be unique.");
  }

  const decisionMap = new Map(decisions.map((decision) => [decision.path, decision.share]));
  if (decisionMap.size !== decisions.length) {
    throw new TypeError("Disclosure decisions must have unique paths.");
  }
  for (const path of decisionMap.keys()) {
    if (!declared.has(path)) throw new TypeError(`Undeclared disclosure field: ${path}`);
  }

  const sharedPaths: string[] = [];
  const withheldPaths: string[] = [];
  const payload: Record<string, JsonValue> = {};

  for (const field of fields) {
    const value = getPath(source, field.path);
    const share = decisionMap.get(field.path) === true;
    if (field.required && !share) {
      throw new Error(`Required field must be explicitly shared: ${field.label}`);
    }
    if (share && value === undefined) {
      throw new Error(`Approved field is missing from request: ${field.label}`);
    }
    if (share) {
      setPath(payload, field.path, value!);
      sharedPaths.push(field.path);
    } else {
      withheldPaths.push(field.path);
    }
  }

  // No extra request fields can leak to the peer, even if a model adds them.
  const allowed = new Set(sharedPaths);
  if (!hasOnlyAllowedPaths(source as JsonValue, "", allowed)) {
    // The caller can supply a wider context object, but only fields explicitly
    // declared in the disclosure contract may be forwarded.
    // This is intentionally a fail-closed error to catch a missing field declaration.
    const topKeys = Object.keys(source);
    const declaredTopKeys = new Set(fields.map((field) => field.path.split(".")[0]));
    const undeclared = topKeys.filter((key) => !declaredTopKeys.has(key));
    if (undeclared.length) {
      // Extra source keys are not copied into the resulting projected payload.
    }
  }

  return { payload, sharedPaths, withheldPaths };
}
