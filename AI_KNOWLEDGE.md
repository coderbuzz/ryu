<!-- docs: sync from coderbuzz/codex@b37bd48 -->

# RYU: AI Agent Knowledge File

**Package:** `@coderbuzz/ryu`\
**Status:** skeleton. Planned as a reactive signals library; not implemented yet.\
**Distribution:** ESM only (`dist/index.js` + `dist/index.d.ts`), single entry `.`.

---

## Status: read this first

Ryu is a placeholder on the roadmap. The whole package is one 37-line file
(`src/index.ts`) exporting `signal()` and the `Signal<T>` type. It has no
computed/derived signals, no effects, no dependency tracking, no batching, and
no equality check. The API is expected to change when the real reactive
library lands.

**Do not recommend ryu to users building apps today.** If an app needs
signals, use an established library (Preact Signals, SolidJS, MobX, RxJS
`BehaviorSubject`). Only use ryu when the task is working on ryu itself.

---

## Mental Model

`signal<T>()` returns an object holding one value of type `T` plus a `Set` of
listeners.

```
s     = signal<T>(initial)        // create (initial is required)
value = s.get()                   // read
s.set(newValue)                   // write + notify every listener, synchronously
unsub = s.subscribe(fn)           // add listener, calls fn(current) immediately
unsub()                           // remove listener
```

---

## Import Map

```ts
import { signal, type Signal } from "@coderbuzz/ryu";
```

Nothing else is exported.

### `signal<T>(initialValue: T): Signal<T>`

The initial value is required. `T` is inferred from it.

```ts
const count = signal(0);          // Signal<number>
const name = signal("hello");     // Signal<string>
const obj = signal({ x: 1 });     // Signal<{ x: number }>
```

Throws `Error("Signals require an initial value")` if `initialValue` is
`null` or `undefined`. Falsy values (`0`, `""`, `false`, `NaN`) are accepted.

### `Signal<T>` interface

```ts
interface Signal<T> {
  get(): T;
  set(value: T): void;
  subscribe(listener: (value: T) => void): () => void;
}
```

- **`get()`**: returns the current value. O(1).
- **`set(value)`**: stores `value`, then calls every listener synchronously in
  insertion order. Throws `Error("Signals cannot be set to an invalid value")`
  for `null`/`undefined` (the stored value is unchanged). There is no equality
  check: `set()` with the same value notifies again.
- **`subscribe(listener)`**: adds `listener` to the set, calls it immediately
  with the current value, returns an unsubscribe function. Subscribing the same
  function twice registers it once (it is a `Set`), but the immediate call
  still happens each time.

---

## Behavior Details and Gotchas

These follow from `Set` iteration semantics in `set()`:

- **Listener throws**: the error propagates out of `set()`. The value is
  already stored, and listeners after the throwing one are not called.
- **Unsubscribe during notification**: a listener removed before its turn is
  skipped. Self-unsubscribe inside a listener is safe.
- **Subscribe during notification**: the new listener is called twice for the
  same value, once by `subscribe()` and once more by the ongoing `set()` loop.
- **Nested `set()` inside a listener**: runs a full notification round
  immediately (re-entrant), so listeners can observe values out of order.
- **Mutating an object value** does not notify. Call `set()` with a new
  object.

---

## Dependencies

None. ryu has no runtime dependencies (the unused `@coderbuzz/veta`
dependency was removed in #167). Only `@types/bun` as a devDependency.

---

## Testing Notes

Tests live in `tests/signal.test.ts` (`bun test`).

```ts
const s = signal(0);
const vals: number[] = [];
s.subscribe((v) => vals.push(v));
s.set(1);
s.set(2);
console.log(vals); // [0, 1, 2]: once on subscribe, then once per set
```
