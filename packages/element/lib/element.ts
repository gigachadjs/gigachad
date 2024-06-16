import { dasherize } from "@gigachad/support";
import { decode, encode } from "@/encoding";
import { Signal, signal } from "@preact/signals-core";

export function chadElementConstructor(object: Object) {
  return object.constructor as typeof ChadElement;
}

interface PropDescriptor<TypeHint = unknown> {
  type: TypeHint;
}

const defaultPropDescriptor: PropDescriptor = {
  type: String,
};

export interface TargetDescriptor {
  multiple: boolean;
}

export abstract class ChadElement extends HTMLElement {
  static chadName: string;

  private static properties: Map<PropertyKey, PropDescriptor>;
  private static attributesToProperties: Map<string, PropertyKey>;
  private static propertiesToAttributes: Map<PropertyKey, string>;

  private propertyStore: Map<PropertyKey, Signal<unknown>> = new Map();

  connected() {}

  disconnected() {}

  private connectedCallback() {
    this.setupActions();

    this.connected();
  }

  private disconnectedCallback() {
    this.teardownActions();

    this.disconnected();
  }

  private attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    this.setPropertyFromAttribute(name, oldValue, newValue);
  }

  static get observedAttributes() {
    return this.attributesToProperties?.keys();
  }

  static addProp(key: PropertyKey, options = defaultPropDescriptor): PropertyDescriptor {
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
      enumerable: true,
    };
  }

  static addTarget(key: PropertyKey, descriptor: TargetDescriptor): PropertyDescriptor {
    return {
      get(this: ChadElement) {
        const attribute = `[target="${chadElementConstructor(this).chadName}.${dasherize(key.toString())}"]`;
        const elements = Array.from(this.querySelectorAll(attribute));

        // TODO: Should this raise instead of returning null? Ensures type-safety?
        if (!elements.length) return null;

        if (descriptor.multiple) {
          return elements;
        }

        return elements[0];
      },
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

    const constructor = chadElementConstructor(this);
    const key = constructor.attributesToProperties.get(attribute);

    if (!key) return;

    if (newValue === null || newValue === undefined) {
      this.propertyStore.delete(key);
    } else {
      const type = constructor.properties.get(key)?.type;

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
    chadElementConstructor(this).properties.set(key, { type: value.constructor });
  }

  private setupActions() {
    for (const element of Array.from(this.querySelectorAll(`[action]`))) {
      this.setupActionsOn(element);
    }
  }

  private setupActionsOn(element: Element) {
    const actions = element.getAttribute("action")?.split(" ");

    if (!actions) return;

    const chadName = chadElementConstructor(this).chadName;

    actions
      .map((action) => action.replace("\n", ""))
      .filter((action) => action)
      .filter((action) => action.includes(chadName))
      .forEach((action) => {
        const eventName = action.split("->")[0]; // TODO: Default actions
        const method = action.split("#")[1]; // TODO: Default actions

        element.addEventListener(eventName, (this as any)[method], true);
      });
  }

  private teardownActions() {
    for (const element of Array.from(this.querySelectorAll(`[action]`))) {
      this.teardownActionsOn(element);
    }
  }

  private teardownActionsOn(element: Element) {
    const actions = element.getAttribute("action")?.split(" ");

    if (!actions) return;

    const chadName = chadElementConstructor(this).chadName;

    actions
      .map((action) => action.replace("\n", ""))
      .filter((action) => action)
      .filter((action) => action.includes(chadName))
      .forEach((action) => {
        const eventName = action.split("->")[0]; // TODO: Default actions
        const method = action.split("#")[1]; // TODO: Default actions

        element.removeEventListener(eventName, (this as any)[method], true);
      });
  }
}
