<!-- docs: sync from coderbuzz/codex@76ca592 -->

# Ryu &mdash; `@coderbuzz/ryu`

Portable reactive signal primitives for TypeScript. Ryu provides a minimal,
framework-agnostic observable state primitive that works in Node.js, Bun, and
Deno — no dependencies, no runtime overhead.

## Features

- **`signal<T>()`** — create a typed reactive value with `get`, `set`, and `subscribe`
- **Immediate notification** — subscribers are called with the current value on subscription
- **Automatic cleanup** — `subscribe` returns an unsubscribe function
- **Multiple subscribers** — independent listeners each receive updates
- **Strict values** — `null` and `undefined` are rejected to prevent silent bugs
- **Runtime agnostic** — works in Node.js, Bun, Deno, and browsers

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

// Read the current value
console.log(count.get()); // 0

// Update the value
count.set(1);
console.log(count.get()); // 1

// Subscribe to changes (fires immediately with current value)
const unsubscribe = count.subscribe((value) => {
  console.log("count changed:", value);
});
// → "count changed: 1"  (fires immediately)

count.set(2);
// → "count changed: 2"

// Stop listening
unsubscribe();
count.set(3);
// (no log — listener has been removed)
```

---

## API

### `signal<T>(initialValue: T): Signal<T>`

Creates a new reactive signal with the given initial value. Throws if the
initial value is `null` or `undefined`.

```ts
import { signal } from "@coderbuzz/ryu";

const name = signal("Alice");
const active = signal(true);
const config = signal({ theme: "dark", locale: "en" });
```

### `Signal<T>` interface

```ts
interface Signal<T> {
  /** Returns the current value. */
  get(): T;

  /** Updates the value and notifies all subscribers. Throws if value is null/undefined. */
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
import { signal } from "@coderbuzz/ryu";

const firstName = signal("Alice");
const lastName = signal("Smith");

// Derive a full name whenever either changes
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
import { signal } from "@coderbuzz/ryu";

export const currentUser = signal<{ id: string; name: string } | null>(
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
import { signal } from "@coderbuzz/ryu";

const config = signal({ debug: false, timeout: 5000 });

config.subscribe(({ debug, timeout }) => {
  console.log(`Config updated — debug: ${debug}, timeout: ${timeout}ms`);
});

// Later, apply a new config
config.set({ debug: true, timeout: 10000 });
// → "Config updated — debug: true, timeout: 10000ms"
```

---

## License

MIT © 2026 Indra Gunawan
