import { test, expect } from "bun:test";
import { signal } from "../src/index";

test("signal get/set", () => {
  const s = signal(0);
  expect(s.get()).toBe(0);
  s.set(42);
  expect(s.get()).toBe(42);
});

test("signal subscribe", () => {
  const s = signal("hello");
  const values: string[] = [];
  s.subscribe(v => values.push(v));
  s.set("world");
  expect(values).toEqual(["hello", "world"]);
});