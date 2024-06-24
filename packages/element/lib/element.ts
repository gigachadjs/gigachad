import { Signal } from "@preact/signals-core";
import { addActionEventListener, removeActionEventListener } from "./actions";
import { decode } from "./encoding";

type Constructor<T> = {
  new (...args: any[]): T;
};

export function chadElementConstructor(object: Object) {
  return object.constructor as typeof ChadElement;
}

export abstract class ChadElement extends HTMLElement {
  static chadName: string;

  static attributeConstructorMap: Map<string, Constructor<any>>;

  attributeSignalMap: Map<string, Signal<unknown>> = new Map();

  connected(element: ChadElement) {}
  disconnected(element: ChadElement) {}

  connectedCallback() {
    this.setupActions();

    this.observe();

    this.connected(this);
  }

  disconnectedCallback() {
    this.disconnected(this);

    this.teardownActions();
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
    if (oldValue === newValue) return;

    const type = chadElementConstructor(this).attributeConstructorMap.get(name);

    if (!type) return;

    const signal = this.attributeSignalMap.get(name);

    if (!signal) return;

    signal.value = newValue === null ? null : decode(newValue, type);
  }

  observe() {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "attributes") {
          this.attributeChangedCallback(
            mutation.attributeName!,
            mutation.oldValue,
            this.getAttribute(mutation.attributeName!)
          );
        }
      }
    });

    observer.observe(this, {
      attributes: true,
      attributeOldValue: true,
      attributeFilter: Array.from(this.attributeSignalMap.keys()),
    });
  }

  private setupActions() {
    const elements = Array.from(this.querySelectorAll(`[action]`));

    elements.push(this);

    for (const element of elements) {
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
      .forEach((action) => addActionEventListener(action, element, this));
  }

  private teardownActions() {
    const elements = Array.from(this.querySelectorAll(`[action]`));

    elements.push(this);

    for (const element of elements) {
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
      .forEach((action) => removeActionEventListener(action, element, this));
  }
}
