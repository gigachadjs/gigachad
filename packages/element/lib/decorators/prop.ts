import { ChadElement, PropertyInfo } from "../element";

export function prop(options?: PropertyInfo) {
  return (classObject: Object, key: PropertyKey) => {
    const descriptor = (classObject.constructor as typeof ChadElement).addProp(key);

    Object.defineProperty(classObject, key, descriptor);
  };
}
