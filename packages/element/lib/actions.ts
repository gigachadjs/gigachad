import { ChadElement } from "./element";

const EVENT_DELIMITER = "->";
const ACTION_DELIMITER = "#";

export function addActionEventListener(action: string, element: Element, chadElement: ChadElement) {
  const method = methodName(action);
  const event = eventName(action) || defaultActionEvent(element);

  element.addEventListener(event, (chadElement as any)[method], true);
}

export function removeActionEventListener(action: string, element: Element, chadElement: ChadElement) {
  const method = methodName(action);
  const event = eventName(action) || defaultActionEvent(element);

  element.removeEventListener(event, (chadElement as any)[method], true);
}

function eventName(action: string) {
  if (!action.includes(EVENT_DELIMITER)) return;

  return action.split(EVENT_DELIMITER)[0];
}

function methodName(action: string) {
  return action.split(ACTION_DELIMITER)[1] || action.split(EVENT_DELIMITER)[1];
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
