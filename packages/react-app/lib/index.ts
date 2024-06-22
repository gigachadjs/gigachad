import { ChadElement, prop, register, target } from "@gigachad/element";
import { createElement } from "react";
import { createRoot, hydrateRoot, Root } from "react-dom/client";
import { ReactApp } from "./react_app";
import { QueryClient } from "@tanstack/react-query";

export type Router = any;

class RequiresNameError extends Error {
  constructor() {
    super(
      '`react-partial` element requires a name to render a React component. Please add `name="component-name"`.'
    );
  }
}

export class ReactAppElement extends ChadElement {
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

  private get reactComponent() {
    const props = ChadReactApp.registry.get(this.name);

    if (!props) return;

    return createElement(ReactApp, props);
  }

  private throwUnlessNamePresent() {
    if (!this.name) {
      throw new RequiresNameError();
    }
  }
}

class App {
  constructor(
    public router: Router,
    public queryClient: QueryClient
  ) {}
}

export class ChadReactApp {
  static registry = new Map<string, App>();

  static registerApp(name: string, router: Router, queryClient?: QueryClient) {
    this.registry.set(name, new App(router, queryClient || new QueryClient()));
  }

  static start() {
    register(ReactAppElement);
  }
}
