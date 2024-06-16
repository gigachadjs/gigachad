import { chadElementConstructor, TargetDescriptor } from "@/element";

export function target(classObject: Object, key: PropertyKey) {
  defineTarget(classObject, key, { multiple: false });
}

export function targets(classObject: Object, key: PropertyKey) {
  defineTarget(classObject, key, { multiple: true });
}

function defineTarget(classObject: Object, key: PropertyKey, targetDescriptor: TargetDescriptor) {
  const descriptor = chadElementConstructor(classObject).addTarget(key, targetDescriptor);

  Object.defineProperty(classObject, key, descriptor);
}
