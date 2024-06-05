import { dasherize } from "@gigachad/support";
import { ChadElement } from "../element";

type Constructor<T> = {
  new (...args: any[]): T;
};

export function register(classObject: Constructor<ChadElement>) {
  const name = dasherize(classObject.name).replace("-element", "");

  customElements.define(name, classObject);
}
