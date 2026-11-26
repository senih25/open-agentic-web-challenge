import type { JsonValue, DisclosureField, FieldDecision } from "./types.ts";

const blockedPathSegments = new Set(["__proto__", "prototype", "constructor"]);

function validatePath(path: string): string[] {
  const segments = path.split(".");
  if (
    !path ||
    segments.length === 0 ||
    segments.some((segment) => !segment || blockedPathSegments.has(segment))
  ) {
    throw new TypeError("Disclosure paths must be valid and must not contain prototype-sensitive keys.");
  }
  return segments;
}

function assertSafeRecord(value: JsonValue, path = "$"): void {
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertSafeRecord(item, `${path}[${index}]`));
    return;
  }
  if (value !== null && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      if (blockedPathSegments.has(key)) {
        throw new TypeError(`Unsafe property name at ${path}.`);
      }
      assertSafeRecord(child, `${path}.${key}`);
    }
  }
}

function getPath(source: Record<string, JsonValue>, path: string): JsonValue | undefined {
  let current: JsonValue | undefined = source;
  for (const segment of validatePath(path)) {
    if (current === null || Array.isArray(current) || typeof current !== "object") {
      return undefined;
    }
    current = (current as Record<string, JsonValue>)[segment];
  }
  return current;
}

function setPath(target: Record<string, JsonValue>, path: string, value: JsonValue): void {
  const segments = validatePath(path);
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

export interface ProjectionResult {
  payload: Record<string, JsonValue>;
  sharedPaths: string[];
  withheldPaths: string[];
}

/**
 * Build the exact peer payload from explicit user-selected paths.
 * Unspecified and undeclared fields are never copied into the peer payload.
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

  const sortedPaths = [...declared.keys()].sort();
  for (let index = 0; index < sortedPaths.length; index += 1) {
    const current = validatePath(sortedPaths[index]!);
    for (const otherPath of sortedPaths.slice(index + 1)) {
      const other = validatePath(otherPath);
      const common = Math.min(current.length, other.length);
      if (current.slice(0, common).every((part, i) => part === other[i])) {
        throw new TypeError("Disclosure paths must not overlap.");
      }
    }
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

  return { payload, sharedPaths, withheldPaths };
}
