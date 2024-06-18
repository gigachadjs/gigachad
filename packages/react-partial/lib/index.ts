import { ChadElement, prop, register, target } from "@gigachad/element";
import { ComponentClass, createElement, FunctionComponent } from "react";
import { createRoot, hydrateRoot, Root } from "react-dom/client";

class RequiresRootError extends Error {
  constructor() {
    super('`react-partial` element requires a root target. Please add a child with `target="react-partial.root"`');
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

class ReactPartialElement extends ChadElement {
  @target declare embeddedProps: HTMLScriptElement;
  @target declare root: HTMLElement;

  @prop declare name: string;
  @prop ssr = false;

  private declare reactRoot: Root;

  connected() {
    console.log(this);

    this.throwUnlessNamePresent();
    this.throwUnlessRootPresent();

    this.mount();
  }

  disconnect() {
    this.unmount();
  }

  mount() {
    if (this.ssr) {
      this.reactRoot = hydrateRoot(this.root, this.reactComponent);

      return;
    }

    this.reactRoot = createRoot(this.root);
    this.reactRoot.render(this.reactComponent);
  }

  unmount() {
    this.reactRoot.unmount();
  }

  private get props() {
    const trimmed = this.embeddedProps?.textContent?.trim() || "{}";

    return JSON.parse(trimmed);
  }

  private get reactComponent() {
    const componentConstructor = ChadReactPartial.registry.get(this.name);

    if (!componentConstructor) throw new ComponentNotRegisteredError(this.name);

    return createElement(componentConstructor, this.props);
  }

  private throwUnlessNamePresent() {
    if (!this.name) {
      throw new RequiresNameError();
    }
  }

  private throwUnlessRootPresent() {
    if (!this.root) {
      throw new RequiresRootError();
    }
  }
}

export class ChadReactPartial {
  static registry = new Map<string, ComponentClass | FunctionComponent>();

  static registerComponent(name: string, component: ComponentClass | FunctionComponent) {
    this.registry.set(name, component);
  }

  static start() {
    register(ReactPartialElement);
  }
}
