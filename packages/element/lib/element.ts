import { dasherize } from "@gigachad/support";
import { decode, encode } from "./encoding";
import { Signal, signal } from "@preact/signals-core";
import internal from "stream";

export interface PropertyInfo<TypeHint = unknown> {
  type: TypeHint;
}

const defaultPropertyInfo: PropertyInfo = {
  type: String,
};

export abstract class ChadElement extends HTMLElement {
  static properties: Map<PropertyKey, PropertyInfo>;
  static attributesToProperties: Map<string, PropertyKey>;
  static propertiesToAttributes: Map<PropertyKey, string>;

  private propertyStore: Map<PropertyKey, Signal<unknown>> = new Map();

  connected() {}

  private connectedCallback() {
    this.connected();
  }

  private attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    this.setPropertyFromAttribute(name, oldValue, newValue);
  }

  static get observedAttributes() {
    return this.attributesToProperties.keys();
  }

  static addProp(key: PropertyKey, options = defaultPropertyInfo): PropertyDescriptor {
    this.properties ||= new Map();
    this.attributesToProperties ||= new Map();
    this.propertiesToAttributes ||= new Map();

    this.properties.set(key, options);

    const attr = dasherize(String(key));

    this.attributesToProperties.set(attr, key);
    this.propertiesToAttributes.set(key, attr);

    return {
      get(this: ChadElement) {
        return this.propertyStore.get(key)?.value;
      },
      set(this: ChadElement, value: unknown) {
        let internalSignal = this.propertyStore.get(key);

        if (!internalSignal) {
          internalSignal = signal(null);

          this.propertyStore.set(key, internalSignal);
        }

        const oldValue = internalSignal.value;

        internalSignal.value = value;

        this.updatePropertyType(key, value);
        this.setAttributeFromProperty(key, oldValue, value);
      },
      configurable: true,
      enumerable: true,
    };
  }

  private setAttributeFromProperty(key: PropertyKey, oldValue: unknown, newValue: unknown) {
    if (oldValue === newValue) return;

    const ctor = this.constructor as typeof ChadElement;
    const attribute = ctor.propertiesToAttributes.get(key);

    if (!attribute) return;

    if (newValue === null || newValue === undefined) {
      this.removeAttribute(attribute);
    } else {
      this.updatePropertyType(key, newValue);
      this.setAttribute(attribute, encode(newValue));
    }
  }

  private setPropertyFromAttribute(attribute: string, oldValue: string, newValue: string) {
    if (oldValue === newValue) return;

    const ctor = this.constructor as typeof ChadElement;
    const key = ctor.attributesToProperties.get(attribute);

    if (!key) return;

    if (newValue === null || newValue === undefined) {
      this.propertyStore.delete(key);
    } else {
      const type = ctor.properties.get(key)?.type;

      if (!type) return;

      let internalSignal = this.propertyStore.get(key);

      const value = decode(newValue, type);

      if (!internalSignal) {
        internalSignal = signal(value);

        this.propertyStore.set(key, internalSignal);
        return;
      }

      internalSignal.value = value;
    }
  }

  private updatePropertyType(key: PropertyKey, value: any) {
    const ctor = this.constructor as typeof ChadElement;

    ctor.properties.set(key, { type: value.constructor });
  }
}
