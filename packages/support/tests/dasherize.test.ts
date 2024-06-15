import { expect, it, describe } from "vitest";
import { dasherize } from "../lib";

describe("dasherize", () => {
  it("should convert camelCase to dash-case", () => {
    expect(dasherize("camelCase")).toBe("camel-case");
  });

  it("should convert PascalCase to dash-case", () => {
    expect(dasherize("PascalCase")).toBe("pascal-case");
  });

  it("should handle snake_case correctly", () => {
    expect(dasherize("snake_case")).toBe("snake-case");
  });

  it("should handle mixedCase and snake_case correctly", () => {
    expect(dasherize("mixed_SnakeCase")).toBe("mixed-snake-case");
  });

  it("should handle multiple underscores correctly", () => {
    expect(dasherize("multiple__underscores")).toBe("multiple-underscores");
  });

  it("should handle strings with leading and trailing underscores", () => {
    expect(dasherize("_leading_trailing_")).toBe("leading-trailing");
  });

  it("should handle strings with leading and trailing dashes", () => {
    expect(dasherize("-leading-dash-")).toBe("leading-dash");
  });

  it("should handle strings with both leading/trailing underscores and dashes", () => {
    expect(dasherize("_-leading_both-_")).toBe("leading-both");
  });

  it("should handle an empty string", () => {
    expect(dasherize("")).toBe("");
  });

  it("should handle a single word", () => {
    expect(dasherize("word")).toBe("word");
  });

  it("should handle strings with numbers", () => {
    expect(dasherize("number123Test")).toBe("number123-test");
  });

  it("should handle strings with special characters", () => {
    expect(dasherize("special@Char")).toBe("special@-char");
  });
});
