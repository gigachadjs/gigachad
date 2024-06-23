import { dasherize } from "@gigachad/support";
import { ChadElement, chadElementConstructor } from "./element";
import { effect, signal, Signal } from "@preact/signals-core";
import {
  endCollectingAttrs,
  resetInitialAttrValuesFromDOM,
  setInitialAttrValuesFromDOM,
  setupAttributes,
  startCollectingAttrs,
} from "./attributes";

type Constructor<T> = {
  new (...args: any[]): T;
};

class InvalidElementNameError extends Error {}

interface ChadElementDescriptor {
  props?: Record<any, any | Signal>;
  actions?: Record<any, (...args: any[]) => void>;
}

type ChadFunctionalElement = (...args: string[]) => void;

function register(name: string, classObject: Constructor<ChadElement>) {
  const chadName = dasherize(name).replace("-element", "");

  if (!chadName.includes("-")) {
    throw new InvalidElementNameError(`
      Class name ${name} produces invalid element name ${chadName}.
      Gigachad element names require two words, such as SuperCoolElement.
    `);
  }

  (classObject as unknown as typeof ChadElement).chadName = chadName;

  customElements.define(chadName, classObject);
}

export function registerChadElement(elementFunction: ChadFunctionalElement) {
  const klass = class extends ChadElement {
    connectedCallback() {
      startCollectingAttrs();
      setInitialAttrValuesFromDOM.bind(this)();

      elementFunction();

      setupAttributes.bind(this)();

      resetInitialAttrValuesFromDOM();
      endCollectingAttrs();

      super.connectedCallback();
    }
  };

  register(elementFunction.name, klass);
}
