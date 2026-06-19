<!-- docs: sync from coderbuzz/codex@6f70be3 -->

# Ryu &mdash; `@coderbuzz/ryu`

> **Simple reactive signals for TypeScript.** No framework. No dependencies. No complexity.
> AI agents: see [AI_KNOWLEDGE.md](https://github.com/coderbuzz/ryu/blob/main/AI_KNOWLEDGE.md) for expert context.

Ryu is a portable, framework-agnostic reactive state primitive that works in **Node.js, Bun, Deno, and browsers**. If you need observable state without pulling in RxJS, MobX, or a full framework — Ryu is your answer.

---

## Why Ryu Over RxJS, MobX, or Preact Signals?

| Pain Point | RxJS | MobX | Preact Signals | **Ryu** |
|---|---|---|---|---|
| Learning curve | Steep — operators, subjects, schedulers | Moderate — decorators, actions, reactions | Moderate — computed, effect, batch | **Minimal** — `get()`, `set()`, `subscribe()` |
| Bundle size | ~40 KB gzip | ~30 KB gzip | ~5 KB gzip | **<1 KB gzip** |
| Dependencies | Many (symbol-observable, tslib) | None | Preact | **Zero** |
| Runtime support | All (polyfill needed for old browsers) | All | Browser-focused | **All** — Node, Deno, Bun, browsers |
| Immediate notification on subscribe | Custom behavior needed | Manual reaction | Default | **Built-in** — fires immediately with current value |
| Strict null/undefined rejection | No | No | No | **Yes** — prevents silent bugs |
| TypeScript | Good | Limited | Good | **Full** — generic `signal<T>()` |

Ryu is not trying to replace RxJS for complex event streams. It's the **simple, predictable alternative** for when you just need observable state with zero overhead.

---

## Features

- **`signal<T>()`** — create a typed reactive value with `get`, `set`, and `subscribe`
- **Immediate notification** — subscribers are called with the current value on subscription
- **Automatic cleanup** — `subscribe` returns an unsubscribe function
- **Multiple subscribers** — independent listeners each receive updates
- **Strict values** — `null` and `undefined` are rejected to prevent silent bugs
- **Runtime agnostic** — works in Node.js, Bun, Deno, and browsers
- **Zero dependencies** — just 1 KB of pure TypeScript
- **No decorators** — plain functions, plain generics

---

## Installation

```sh
# npm
npm install @coderbuzz/ryu

# Bun
bun add @coderbuzz/ryu

# Deno
import { signal } from "npm:@coderbuzz/ryu";
```

---

## Quick Start

```ts
import { signal } from "@coderbuzz/ryu";

const count = signal(0);

console.log(count.get()); // 0

count.set(1);
console.log(count.get()); // 1

const unsubscribe = count.subscribe((value) => {
  console.log("count changed:", value);
});
// → "count changed: 1"  (fires immediately with current value)

count.set(2);
// → "count changed: 2"

unsubscribe();
count.set(3);
// (no log — listener was removed)
```

---

## API

### `signal<T>(initialValue: T): Signal<T>`

Creates a new reactive signal with the given initial value. Throws if the
initial value is `null` or `undefined`.

```ts
const name = signal("Alice");
const active = signal(true);
const config = signal({ theme: "dark", locale: "en" });
```

### `Signal<T>` interface

```ts
interface Signal<T> {
  /** Returns the current value. */
  get(): T;

  /** Updates the value and notifies all subscribers.
   *  Throws if value is null/undefined. */
  set(value: T): void;

  /**
   * Subscribe to value changes. The listener is called immediately with the
   * current value, and again on every subsequent `set()`.
   * Returns an unsubscribe function.
   */
  subscribe(listener: (value: T) => void): () => void;
}
```

---

## Examples

### Derived / Computed Values

```ts
const firstName = signal("Alice");
const lastName = signal("Smith");

let fullName = `${firstName.get()} ${lastName.get()}`;

firstName.subscribe(() => {
  fullName = `${firstName.get()} ${lastName.get()}`;
});
lastName.subscribe(() => {
  fullName = `${firstName.get()} ${lastName.get()}`;
});

firstName.set("Bob");
console.log(fullName); // "Bob Smith"
```

### Shared State Between Modules

```ts
// state.ts
export const currentUser = signal<{ id: string; name: string }>(
  { id: "guest", name: "Guest" }
);

// auth.ts
import { currentUser } from "./state";
export function login(user: { id: string; name: string }) {
  currentUser.set(user);
}

// ui.ts
import { currentUser } from "./state";
currentUser.subscribe((user) => {
  console.log("Active user:", user.name);
});
```

### Reactive Config Reload

```ts
const config = signal({ debug: false, timeout: 5000 });

config.subscribe(({ debug, timeout }) => {
  console.log(`Config updated — debug: ${debug}, timeout: ${timeout}ms`);
});

config.set({ debug: true, timeout: 10000 });
// → "Config updated — debug: true, timeout: 10000ms"
```

### Cross-Module Communication

```ts
// logger.ts
import { signal } from "@coderbuzz/ryu";
export const logStream = signal<string[]>([]);

export function appendLog(message: string) {
  logStream.set([...logStream.get(), message]);
}

// metrics.ts
import { logStream } from "./logger";
logStream.subscribe((logs) => {
  console.log(`Log count: ${logs.length}`);
});
```

---

## License

MIT © 2026 Indra Gunawan
