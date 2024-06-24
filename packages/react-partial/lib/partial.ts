import {
  type ChadElement,
  onConnected,
  onDisconnected,
  registerChadElement,
  useAttr,
  useTarget,
} from "@gigachad/element";
import { type Attributes, type ComponentClass, createElement, type FunctionComponent } from "react";
import { createRoot, hydrateRoot, type Root } from "react-dom/client";

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

function reactComponent(name: string, props?: Attributes) {
  const componentConstructor = ChadReactPartial.registry.get(name);

  if (!componentConstructor) throw new ComponentNotRegisteredError(name);

  return createElement(componentConstructor, props);
}

function reactProps(embedded: string | null | undefined) {
  if (!embedded) return {};

  const trimmed = embedded.trim();

  return JSON.parse(trimmed);
}

export function ReactPartialElement() {
  const embeddedPropsTarget = useTarget("embeddedProps");
  const rootTarget = useTarget("reactRoot");

  const nameAttr = useAttr("name", "");
  const ssrAttr = useAttr("ssr", false);

  let root: Root;

  onConnected((element) => {
    if (!nameAttr.value) {
      throw new RequiresNameError();
    }

    const props = reactProps(embeddedPropsTarget?.textContent);
    const component = reactComponent(nameAttr.value, props);

    if (ssrAttr.value) {
      root = hydrateRoot(rootTarget || element, component);
      return;
    }

    root = createRoot(rootTarget || element);
    root.render(component);
  });

  onDisconnected(() => {
    root.unmount();
  });
}

export class ChadReactPartial {
  static registry = new Map<string, ComponentClass | FunctionComponent>();

  static registerComponent(name: string, component: ComponentClass<any> | FunctionComponent<any>) {
    this.registry.set(name, component);
  }

  static start() {
    registerChadElement(ReactPartialElement);
  }
}
