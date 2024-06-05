import { dasherizeFromCamelCase } from "@gigachad/support";
import { decode, encode } from "./encoding";

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

  private propertyStore: Map<PropertyKey, unknown> = new Map();

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

    const attr = dasherizeFromCamelCase(String(key));

    this.attributesToProperties.set(attr, key);
    this.propertiesToAttributes.set(key, attr);

    return {
      get(this: ChadElement) {
        return this.propertyStore.get(key);
      },
      set(this: ChadElement, value: unknown) {
        console.log("yo");

        const oldValue = this.propertyStore.get(key);

        this.propertyStore.set(key, value);

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
      this.propertyStore.set(key, null);
    } else {
      const type = ctor.properties.get(key)?.type;

      if (!type) return;

      this.propertyStore.set(key, decode(newValue, type));
    }
  }

  private updatePropertyType(key: PropertyKey, value: any) {
    const ctor = this.constructor as typeof ChadElement;

    ctor.properties.set(key, { type: value.constructor });
  }
}
