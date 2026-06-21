import { test, expect } from "bun:test";
import { signal } from "@coderbuzz/ryu";

test("signal get/set", () => {
  const s = signal(0);
  expect(s.get()).toBe(0);
  s.set(42);
  expect(s.get()).toBe(42);
});

test("signal subscribe", () => {
  const s = signal("hello");
  let called = 0;
  s.subscribe(() => { called++; });
  s.set("world");
  expect(called).toBe(1);
  expect(s.get()).toBe("world");
});