import { ChadElement, chadElementConstructor } from "./element";

let targets = [];
let currentChadElement: ChadElement | null;

export function startCollectingTargets(this: ChadElement) {
  targets = [];
  currentChadElement = this;
}

export function useTarget<T extends HTMLElement>(name: string) {
  const chadName = chadElementConstructor(currentChadElement!).chadName;
  const attribute = `[target="${chadName}.${name}"]`;

  Object.defineProperty(currentChadElement, name, {
    get(this: ChadElement) {
      return this.querySelector<T>(attribute);
    },
  });

  return currentChadElement!.querySelector<T>(attribute);
}

export function endCollectingTargets() {
  targets = [];
  currentChadElement = null;
}
