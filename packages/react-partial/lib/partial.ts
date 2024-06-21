import { ChadElement, prop, register, target } from "@gigachad/element";
import { ComponentClass, createElement, FunctionComponent } from "react";
import { createRoot, hydrateRoot, Root } from "react-dom/client";

class RequiresRootError extends Error {
  constructor() {
    super(
      '`react-partial` element requires a root target. Please add a child with `target="react-partial.reactRoot"`'
    );
  }
}

class RequiresNameError extends Error {
  constructor() {
    super(
      '`react-partial` element requires a name to render a React component. Please add `name="component-name"`.'
    );
  }
}

class ComponentNotRegisteredError extends Error {
  constructor(name: string) {
    super(
      `\`react-partial\` element could not find registered component ${name}. Please ensure it is registered.`
    );
  }
}

export class ReactPartialElement extends ChadElement {
  @target declare embeddedProps: HTMLScriptElement;
  @target declare reactRoot: HTMLElement;

  @prop declare name: string;
  @prop ssr = false;

  private declare root: Root;

  connected() {
    this.throwUnlessNamePresent();

    this.mount();
  }

  disconnect() {
    this.unmount();
  }

  mount() {
    if (this.ssr) {
      this.root = hydrateRoot(this.reactRoot || this, this.reactComponent);

      return;
    }

    this.root = createRoot(this.reactRoot || this);
    this.root.render(this.reactComponent);
  }

  unmount() {
    this.root.unmount();
  }

  private get reactProps() {
    if (!this.embeddedProps?.textContent) return {};

    const trimmed = this.embeddedProps.textContent.trim();

    return JSON.parse(trimmed);
  }

  private get reactComponent() {
    const componentConstructor = ChadReactPartial.registry.get(this.name);

    if (!componentConstructor) throw new ComponentNotRegisteredError(this.name);

    return createElement(componentConstructor, this.reactProps);
  }

  private throwUnlessNamePresent() {
    if (!this.name) {
      throw new RequiresNameError();
    }
  }

  private throwUnlessRootPresent() {
    if (!this.reactRoot) {
      throw new RequiresRootError();
    }
  }
}

export class ChadReactPartial {
  static registry = new Map<string, ComponentClass | FunctionComponent>();

  static registerComponent(name: string, component: ComponentClass<any> | FunctionComponent<any>) {
    this.registry.set(name, component);
  }

  static start() {
    register(ReactPartialElement);
  }
}
