# tap-decorator

`tap-decorator` is a TypeScript library that enables you to use a Tap decorator to observe any function without interfering. It is perfect for debugging, testing, and logging your code with ease.

## usage

```typescript
import { Tap } from "tap-decorator";

class Foo {
  @Tap((ob) =>
    ob.subscribe(({ seq, result }) => {
      console.log("seq", seq);

      result.subscribe((x) => {
        console.log("result", x);
      });
    })
  )
  public foo() {
    return 1;
  }
}

const foo = new Foo();
foo.foo();
foo.foo();
```
