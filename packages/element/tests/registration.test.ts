import { describe, expect, it } from "vitest";
import { ChadElement, register } from "../lib";

describe("chad element registration", () => {
  @register
  class CoolTestElement extends ChadElement {}

  it("registers the element", () => {
    expect(customElements.get("cool-test")).toBe(CoolTestElement);
  });

  it("throws for a bad element name", () => {
    expect(() => {
      @register
      class FunElement extends ChadElement {}

      FunElement;
    }).toThrowError(`
      Class name FunElement produces invalid element name fun.
      Gigachad element names require two words, such as SuperCoolElement.
    `);
  });
});
