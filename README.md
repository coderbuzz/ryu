<!-- docs: sync from coderbuzz/codex@b37bd48 -->

# Ryu: `@coderbuzz/ryu`

> **Status: skeleton.** Ryu is planned as a reactive signals library, but it is not implemented yet.
> Today it ships one minimal `signal()` primitive (`get`, `set`, `subscribe`). There is no computed/derived state,
> no effects, no batching, and no dependency tracking. The API will change. Do not build on it yet.
>
> AI agents: see [AI_KNOWLEDGE.md](https://github.com/coderbuzz/ryu/blob/main/AI_KNOWLEDGE.md) for exact behavior.
<p align="center">
  <a href="https://www.npmjs.com/package/@coderbuzz/ryu"><img src="https://img.shields.io/npm/v/@coderbuzz/ryu.svg?style=flat-square" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/@coderbuzz/ryu"><img src="https://img.shields.io/npm/dm/@coderbuzz/ryu.svg?style=flat-square" alt="npm downloads" /></a>
  <a href="https://github.com/coderbuzz/ryu/blob/main/LICENSE"><img src="https://img.shields.io/github/license/coderbuzz/ryu.svg?style=flat-square" alt="MIT License" /></a>
  <a href="https://github.com/coderbuzz/ryu"><img src="https://img.shields.io/github/stars/coderbuzz/ryu.svg?style=flat-square" alt="GitHub Stars" /></a>
  <a href="https://github.com/coderbuzz/ryu/actions/workflows/ci.yml"><img src="https://github.com/coderbuzz/ryu/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="https://codecov.io/gh/coderbuzz/ryu"><img src="https://codecov.io/gh/coderbuzz/ryu/graph/badge.svg" alt="Codecov" /></a>
</p>

---

## What exists today

- **`signal<T>(initialValue)`**: a typed value holder with `get`, `set`, and `subscribe`
- **Immediate notification**: a new subscriber is called once with the current value
- **Unsubscribe**: `subscribe` returns a function that removes the listener
- **No `null`/`undefined`**: both are rejected with an `Error`, as the initial value and in `set()`
- Plain ESM, no runtime-specific APIs, so it runs on Node.js, Bun, Deno, and browsers

## Not implemented yet

- Computed / derived signals
- Effects and automatic dependency tracking
- Batching or transactions
- Equality checks (`set()` notifies even when the value did not change)

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
// (no log: listener was removed)
```

---

## API

### `signal<T>(initialValue: T): Signal<T>`

Creates a new signal. The initial value is required. Throws if it is `null` or `undefined`.

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

  /** Stores the value and notifies all subscribers.
   *  Throws if value is null/undefined. */
  set(value: T): void;

  /**
   * Calls the listener immediately with the current value, and again on
   * every subsequent `set()`. Returns an unsubscribe function.
   */
  subscribe(listener: (value: T) => void): () => void;
}
```

---

## License

MIT © 2026 Indra Gunawan
