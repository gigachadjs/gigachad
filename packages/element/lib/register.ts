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
import { startCollectingActions, endCollectingActions, setupActions, useAction } from "./actions";
import { endCollectingTargets, startCollectingTargets } from "./targets";
import { endCollectingMountCallbacks, setupMountCallbacks, startCollectingMountCallbacks } from "./mounting";

type Constructor<T> = {
  new (...args: any[]): T;
};

class InvalidElementNameError extends Error {}

type ChadElementDescriptor = Record<any, (...args: any[]) => void>;

type ChadFunctionalElement = (...args: string[]) => ChadElementDescriptor | void;

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
      startCollectingActions();
      setInitialAttrValuesFromDOM.bind(this)();
      startCollectingTargets.bind(this)();
      startCollectingMountCallbacks();

      const actions = elementFunction();

      if (actions) {
        for (const [key, action] of Object.entries(actions)) {
          useAction(key, action);
        }
      }

      setupAttributes.bind(this)();
      setupActions.bind(this)();
      setupMountCallbacks.bind(this)();

      endCollectingMountCallbacks();
      endCollectingTargets();
      endCollectingActions();
      resetInitialAttrValuesFromDOM();
      endCollectingAttrs();

      super.connectedCallback();
    }
  };

  register(elementFunction.name, klass);
}
