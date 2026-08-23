export function isObjectWith(property: string) {
  return (input: unknown): input is Record<string, unknown> =>
    input !== undefined &&
    input !== null &&
    typeof input === "object" &&
    property in input;
}

export function hasType(type: string) {
  const hasType = isObjectWith("type");
  return (input: unknown): input is Record<string, unknown> => {
    return hasType(input) && input.type === type;
  };
}
