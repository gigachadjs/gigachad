import { dasherize } from "@gigachad/support";

export abstract class ChadElement extends HTMLElement {}

export function register(classObject: any) {
  const name = dasherize(classObject.name).replace("-element", "");

  customElements.define(name, classObject);
}
