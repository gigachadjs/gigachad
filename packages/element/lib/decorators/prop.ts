import { ChadElement, chadElementConstructor } from "@/element";

export function prop(classObject: Object, key: PropertyKey) {
  const descriptor = chadElementConstructor(classObject).addProp(key);

  Object.defineProperty(classObject, key, descriptor);
}
