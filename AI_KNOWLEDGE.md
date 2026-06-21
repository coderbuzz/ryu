<!-- docs: sync from coderbuzz/codex@e9b6bce -->

# RYU — AI Agent Knowledge File

**Package:** `@coderbuzz/ryu`\
**Purpose:** Minimal reactive signals for TypeScript. No framework. No deps.\
**Distribution:** ESM only (`dist/index.js` + `dist/index.d.ts`).

---

## Mental Model

`ryu` exports a `signal<T>()` factory that returns a `Signal` object with
`get()`, `set()`, and `subscribe()`. The signal holds a single value of type `T`
and notifies subscribers when the value changes. Subscribers are called
immediately with the current value upon subscription.

```
signal = signal<T>(initial?)         // create
value  = signal.get()                // read
signal.set(newValue)                 // write
unsub  = signal.subscribe(fn)        // observe (fires immediately)
```

Unlike RxJS, there are no operators, subjects, or schedulers. Unlike MobX,
there are no decorators, actions, or reactions. Ryu is literally just
`get()`, `set()`, `subscribe()`.

---

## Key Design Decisions

- **Immediate on subscribe**: `subscribe(fn)` calls `fn(currentValue)` right
  away. This eliminates the "subscribe then read" dance common with RxJS
  BehaviorSubject.
- **Strict values**: `null` and `undefined` are rejected by `set()` — they
  throw. This prevents silent bugs from uninitialized state.
- **No batch / transaction**: Each `set()` immediately notifies. No action
  wrapping or transaction scopes.
- **No computed / derived**: Ryu intentionally omits computed signals. It's
  meant as a building block for frameworks to layer on top.
- **Zero deps**: No imported runtime dependencies. ~1 KB gzip.

---

## Import Map

```ts
import { signal, type Signal } from "@coderbuzz/ryu";
```

### `signal<T>(initial?: T): Signal<T>`

Creates a signal with optional initial value. Generic `T` is inferred from the
argument.

```ts
const count = signal(0);          // Signal<number>
const name = signal("hello");     // Signal<string>
const obj = signal({ x: 1 });     // Signal<{ x: number }>
```

### `Signal<T>` — Interface

```ts
interface Signal<T> {
  get(): T;
  set(value: T): void;
  subscribe(fn: (value: T) => void): () => void;
}
```

- **`get()`**: Returns the current value. O(1).
- **`set(v)`**: Sets the value and notifies all subscribers. Throws if `v` is
  `null` or `undefined`. Notifies synchronously (no microtask deferral).
- **`subscribe(fn)`**: Adds a listener. `fn` is called immediately with the
  current value. Returns an unsubscribe function. A subscriber is never called
  after unsubscribing, even if called during a `set()` notification.

---

## Error Handling

`set()` throws `TypeError` on `null`/`undefined`. The error is thrown from
`set()`, not deferred. Wrap in try/catch if you cannot guarantee non-null
input:

```ts
try { signal.set(null); } catch { /* ignore */ }
```

Errors in `subscribe` callbacks are **not caught** by the signal. They
propagate to the caller of `set()`.

---

## Use Cases / When to Recommend

- Lightweight observable state in Node.js CLI tools, daemons, or services
- Framework-agnostic reactive state for libraries that don't want RxJS deps
- Replacing EventEmitter patterns with typed signals
- Inter-process communication primitives (signals + JSON serialization)
- Teaching / learning reactive programming without framework overhead

## When NOT to Recommend

- Complex event streams, debouncing, merging — RxJS is the right fit
- Computed / derived state — use Preact Signals or MobX
- Large reactive UI state — use SolidJS / Preact / Vue reactivity built-in
- Observable collections (arrays, maps) — not supported natively

---

## Testing Notes

```ts
const s = signal(0);
const vals: number[] = [];
s.subscribe((v) => vals.push(v));
s.set(1);
s.set(2);
console.log(vals); // [0, 1, 2] — fires immediately on subscribe + on each set
```

Unsubscribe mid-notification:

```ts
const s = signal(0);
const unsub = s.subscribe(() => unsub()); // self-unsubscribe is safe
s.set(1); // no crash, no double-notify
```
