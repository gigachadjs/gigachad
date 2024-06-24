import { ChadElement } from "./element";

const EVENT_DELIMITER = "->";
const METHOD_DELIMITER = "#";
const ELEMENT_STR_DELIMITER = "@";
const OPTION_DELIMITER = ":";

const VALID_OPTIONS = ["once", "passive", "capture"];

type Action = {
  method: string;
  event: string;
  element: ActionElement;
  option: string | undefined;
};

type ActionElement = Element | Document | (Window & typeof globalThis);

type ActionMethod = {
  method: string;
  option: string | undefined;
};

type ActionFn = (...args: any[]) => void;

let actionsMap: Map<string, ActionFn>;

export function useAction(name: string, action: ActionFn) {
  actionsMap.set(name, action);

  return action;
}

export function startCollectingActions() {
  actionsMap = new Map();
}

export function setupActions(this: ChadElement) {
  for (const [key, action] of actionsMap.entries()) {
    (this as any)[key] = action;
  }
}

export function endCollectingActions() {
  startCollectingActions();
}

export function addActionEventListener(raw: string, originalElement: Element, chadElement: ChadElement) {
  const { element, event, method, option } = decomposeAction(raw, originalElement);
  const boundMethod = (chadElement as any)[method].bind(chadElement);

  element.addEventListener(event, boundMethod, decomposeOptionForAdd(option));
}

export function removeActionEventListener(raw: string, originalElement: Element, chadElement: ChadElement) {
  const { element, event, method, option } = decomposeAction(raw, originalElement);
  const boundMethod = (chadElement as any)[method].bind(chadElement);

  element.removeEventListener(event, boundMethod, decomposeOptionForRemove(option));
}

function decomposeAction(action: string, originalElement: Element): Action {
  const [beforeArrow, afterArrow] = action.split(EVENT_DELIMITER);

  if (afterArrow) {
    return decomposeFullAction(beforeArrow, afterArrow, originalElement);
  }

  return decomposePartialAction(beforeArrow, originalElement);
}

function decomposeFullAction(beforeArrow: string, afterArrow: string, originalElement: Element): Action {
  const [event, elementString] = beforeArrow.split(ELEMENT_STR_DELIMITER);

  let element: ActionElement = originalElement;

  if (elementString === "document") {
    element = document;
  } else if (elementString === "window") {
    element = window;
  }

  const { method, option } = decomposeMethod(afterArrow);

  return {
    event,
    method,
    element,
    option,
  };
}

function decomposePartialAction(raw: string, element: Element): Action {
  const event = defaultActionEvent(element);

  const { method, option } = decomposeMethod(raw);

  return {
    event,
    method,
    element,
    option,
  };
}

function decomposeMethod(raw: string): ActionMethod {
  const [_element, methodAndOption] = raw.split(METHOD_DELIMITER);

  const [method, option] = methodAndOption.split(OPTION_DELIMITER);

  return {
    method,
    option,
  };
}

function decomposeOptionForAdd(raw: string | undefined): AddEventListenerOptions {
  if (!raw) return {};

  const options = raw.split(":").filter((option) => option);

  const out: AddEventListenerOptions = {};

  for (const rawOption of options) {
    const value = !rawOption.includes("!");
    const option = rawOption.replace("!", "");

    if (!VALID_OPTIONS.includes(option)) {
      throw new InvalidActionOptionError(option);
    }

    out[option as keyof AddEventListenerOptions] = value as any;
  }

  return out;
}

function decomposeOptionForRemove(raw: string | undefined): EventListenerOptions {
  if (!raw) return {};

  const options = raw.split(":").filter((option) => option);

  const out: EventListenerOptions = {};

  for (const rawOption of options) {
    const value = !rawOption.includes("!");
    const option = rawOption.replace("!", "");

    if (option !== "capture") continue;

    out[option as keyof EventListenerOptions] = value as any;
  }

  return out;
}

function defaultActionEvent(element: Element) {
  const tag = element.tagName.toLowerCase();

  if (tag === "input" || tag === "textarea") {
    return "input";
  } else if (tag === "select") {
    return "change";
  } else if (tag === "form") {
    return "submit";
  } else if (tag === "details") {
    return "toggle";
  }

  return "click";
}

class InvalidActionOptionError extends Error {
  constructor(option: string) {
    super(`Action option ${option} is invalid. Valid options are ${VALID_OPTIONS.join(" ")}`);
  }
}
