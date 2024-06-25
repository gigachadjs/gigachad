import { effect, Signal, signal } from "@preact/signals-core";
import { decode, encode } from "./encoding";
import { ChadElement, chadElementConstructor } from "./element";

type Constructor<T> = {
  new (...args: any[]): T;
};

let attrTypeMap: Map<string, Constructor<any>> = new Map();
let attrSignalMap: Map<string, Signal<unknown>> = new Map();
let initialAttrValuesFromDOM: Map<string, any> = new Map();

export function setupAttributes(this: ChadElement) {
  chadElementConstructor(this).attributeConstructorMap ||= attrTypeMap;

  this.attributeSignalMap = attrSignalMap;

  for (const [key, signal] of this.attributeSignalMap) {
    effect(() => this.setAttribute(key, encode(signal.value)));

    if (this.hasOwnProperty(key)) return;

    Object.defineProperty(this, key, {
      get(this: ChadElement) {
        return signal.value;
      },
      set(this: ChadElement, value: unknown) {
        signal.value = value;
      },
    });
  }
}

export function startCollectingAttrs() {
  attrTypeMap = new Map();
  attrSignalMap = new Map();
}

export function endCollectingAttrs() {
  startCollectingAttrs();
}

export function setInitialAttrValuesFromDOM(this: ChadElement) {
  if (this.attributes.length <= 0) {
    resetInitialAttrValuesFromDOM();
    return;
  }

  for (let i = 0; i < this.attributes.length; i++) {
    const attribute = this.attributes[i];

    initialAttrValuesFromDOM.set(attribute.name, attribute.value);
  }
}

export function resetInitialAttrValuesFromDOM() {
  initialAttrValuesFromDOM = new Map();
}

export function useAttr<T>(name: string, defaultValue: T, typeOverride?: Constructor<any>) {
  if (!typeOverride && (defaultValue === null || defaultValue === undefined)) {
    throw "Using a null default value with no typeOverride for a prop is not allowed.";
  }

  const type = typeOverride || (defaultValue as any).constructor;

  attrTypeMap.set(name, type);

  const initialValue = initialAttrValuesFromDOM.get(name);

  let outSignal;

  if (initialValue) {
    outSignal = signal(decode(initialValue, type));
  } else {
    outSignal = signal(defaultValue);
  }

  attrSignalMap.set(name, outSignal);

  return outSignal;
}
