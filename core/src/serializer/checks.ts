export function isObjectWith(...properties: string[]) {
  return (input: unknown): input is Record<string, unknown> =>
    input !== undefined &&
    input !== null &&
    typeof input === "object" &&
    properties.every((it) => it in input);
}

export function hasType(type: string) {
  const hasType = isObjectWith("type");
  return (input: unknown): input is Record<string, unknown> => {
    return hasType(input) && input.type === type;
  };
}
