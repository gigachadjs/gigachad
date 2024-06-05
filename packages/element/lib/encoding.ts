export function encode(value: any) {
  const type = value.constructor;

  if (type === String) {
    return value as string;
  }

  if (type === Boolean || type === Number) {
    return (value as any).toString();
  }

  return JSON.stringify(value);
}

export function decode(value: string, type: unknown) {
  if (type === String) {
    return value;
  }

  if (type === Boolean) {
    return !(value == "0" || value == "false");
  }

  if (type === Number) {
    return Number(value.replace(/_/g, ""));
  }

  if (type === Array) {
    return JSON.parse(value);
  }

  const obj = JSON.parse(value);
  const descriptors = Object.getOwnPropertyDescriptors(obj);

  return Object.create((type as any).prototype, descriptors);
}
