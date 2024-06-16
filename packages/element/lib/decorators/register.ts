import { dasherize } from "@gigachad/support";
import { ChadElement } from "../element";

type Constructor<T> = {
  new (...args: any[]): T;
};

class InvalidElementNameError extends Error {}

export function register(classObject: Constructor<ChadElement>) {
  const name = dasherize(classObject.name).replace("-element", "");

  if (!name.includes("-")) {
    throw new InvalidElementNameError(`
      Class name ${classObject.name} produces invalid element name ${name}.
      Gigachad element names require two words, such as SuperCoolElement.
    `);
  }

  (classObject as unknown as typeof ChadElement).chadName = name;

  customElements.define(name, classObject);
}
