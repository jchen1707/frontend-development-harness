import { expect, test } from "vitest";
import { greeting } from "./domain.js";

test("greets the named person", () => {
  expect(greeting("Ada")).toBe("Hello, Ada");
});
