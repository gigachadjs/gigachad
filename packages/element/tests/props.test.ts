import { describe, expect, it } from "vitest";
import { ChadElement, prop, register } from "../lib";

// TODO: For some reason testing the prop decorator just like.. doesnt work. Dont wanna spen
// more time on it cuz it works in the browser. For some weird reason the getter and
// setter just totally aren't working in test.
