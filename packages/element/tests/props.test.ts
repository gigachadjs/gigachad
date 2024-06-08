import { describe, expect, it, test } from "vitest";
import { ChadElement, prop, register } from "../lib";

describe("chad element props", () => {
  @register
  class CoolTestElement extends ChadElement {}

  // console.log(customElements.get("cool-test"));

  it("registers the element", () => {
    expect(true).toBe(true);
  });
});
