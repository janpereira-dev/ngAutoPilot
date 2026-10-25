# Finite values without unnecessary enums

Choose the representation from the contract. This is a default for new code, not a reason to rewrite an existing API.

| Need | Default |
| --- | --- |
| Allowed values only at type level | Literal union |
| Named keys and runtime values | `as const` object; derive keys or values as needed |
| Runtime list for iteration or membership validation | `as const` array; derive the union from its elements |
| Existing API requires an enum or its runtime behavior | Keep the enum until a scoped migration proves compatibility |

## Examples

Const assertions require TypeScript 3.4+. These examples use `const` bindings and derive the runtime-backed types without a second list of allowed values.

```ts
type Fruit = "apple" | "banana" | "orange";

const meats = {
  cow: "beef",
  pig: "pork",
  sheep: "mutton",
} as const;

type Animal = keyof typeof meats;
type Meat = (typeof meats)[Animal];

const veggies = ["broccoli", "carrot", "potato"] as const;
type Veggie = (typeof veggies)[number];

function isVeggie(value: unknown): value is Veggie {
  return veggies.some(candidate => candidate === value);
}
```

`Fruit` permits values, not object keys. `Animal` is the union of the object's keys; `Meat` is the union of its values. `Veggie` and its guard use the same list, so adding a vegetable updates both. The equality check accepts `unknown` without asserting that it is already a `Veggie`; it rejects invalid strings, numbers, null, and objects. Reuse an existing schema validator when the boundary already has one.

The type aliases and `as const` assertions are erased. The object and array remain JavaScript values; `as const` does not freeze them at runtime. Use a union alone if no runtime values are needed.

## Enum compatibility

- Ordinary enums emit runtime JavaScript. Numeric enums also expose reverse mappings, which these examples do not reproduce.
- Implicit numeric members auto-increment. Reordering or inserting members can change serialized or persisted values. Preserve existing values and use explicit stable values for new external numeric contracts.
- Modern TypeScript rejects out-of-domain numeric literals for literal-valued numeric enums; do not repeat the outdated claim that any numeric literal is accepted. This is still not runtime validation of incoming data.
- Keep enums required by generated code, libraries, public consumers, bit-flag contracts, or reverse lookups unless the requested migration covers those callers and behaviors. A union or object is not automatically a compatible replacement.
- `const enum` may inline values, but `preserveConstEnums` retains runtime declarations. Published ambient const enums also introduce `isolatedModules` and dependency-version risks. Do not prescribe them as a universal optimization.
- For TypeScript older than 3.4, retain compatible existing patterns or a literal union; do not upgrade the compiler just to use this preference.

## Verification

Use the receiving project's type checker and test runner. Verify valid members, unknown strings, null/undefined, numbers, and objects. When migrating an enum, also check public imports, serialized values, reverse mappings, and any bitwise combinations that consumers use. Do not add a validator when no runtime boundary needs one.

## Sources

- [TypeScript handbook: enums, numeric values, runtime output, const enum pitfalls, and objects](https://www.typescriptlang.org/docs/handbook/enums.html).
- [TypeScript 3.4: const assertions](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html#const-assertions).
- [TypeScript 5.0: enum overhaul and out-of-domain errors](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html#enum-overhaul).
