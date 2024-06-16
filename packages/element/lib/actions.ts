export function defaultAction(element: Element) {
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
