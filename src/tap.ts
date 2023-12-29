/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { type InstanceMethodDecorator } from "./type/decorator";
import { type Callable, type Newable } from "./type/function";
import {
  type Observable,
  type ObservableInput,
  type OperatorFunction,
  Subject,
  catchError,
  concatAll,
  ignoreElements,
  map,
  mergeMap,
  of,
} from "rxjs";

export function Tap<T, Key, Args extends unknown[], Return>(
  tap: (
    ob: Observable<TapItem<T, Args, Return>>,
    target: Newable<any, T>,
    propertyKey: Key,
  ) => void,
): InstanceMethodDecorator<T, Key, Callable<Args, Return>> {
  return (target, propertyKey, descriptor) => {
    const ob = descriptionXObservable.get(descriptor);
    if (ob) {
      tap(
        ob as Observable<TapItem<T, Args, Return>>,
        target as never,
        propertyKey,
      );

      return descriptor;
    } else {
      const sourceMethod = descriptor.value!;

      const subject = new Subject<TapItem<T, Args, Return>>();
      descriptionXObservable.set(descriptor, subject);

      tap(subject, target as never, propertyKey);

      let seq = 0;

      descriptor.value = function (this: T, ...args: Args) {
        seq++;

        const resultSubject = new Subject<Return>();
        subject.next({ args, result: resultSubject, seq, thisArg: this });

        try {
          const result = sourceMethod.apply(this, args);
          resultSubject.next(result);
          resultSubject.complete();

          return result;
        } catch (e) {
          resultSubject.error(e);

          throw e;
        }
      };

      return descriptor;
    }
  };
}

export function flatResult<
  T,
  Args extends unknown[],
  Return,
>(): OperatorFunction<
  TapItem<T, Args, ObservableInput<Return>>,
  TapItem<T, Args, Return>
> {
  return (source) =>
    source.pipe(
      map(({ args, result, seq, thisArg }) => ({
        args,
        result: result.pipe(concatAll()),
        seq,
        thisArg,
      })),
    );
}

export function tapReturn<
  T,
  Args extends unknown[],
  Return,
>(): OperatorFunction<TapItem<T, Args, Return>, TapReturn<T, Args, Return>> {
  return (source) =>
    source.pipe(
      mergeMap(({ args, result, seq, thisArg }) =>
        result.pipe(map((result) => ({ args, result, seq, thisArg }))),
      ),
    );
}

export function tapError<T, Args extends unknown[]>(): OperatorFunction<
  TapItem<T, Args, unknown>,
  TapError<T, Args>
> {
  return (source) =>
    source.pipe(
      mergeMap(({ args, result, seq, thisArg }) =>
        result.pipe(
          ignoreElements(),
          catchError((e) => of({ args, error: e, seq, thisArg })),
        ),
      ),
    );
}

export type TapItem<T, Args, Return> = {
  args: Args;
  result: Observable<Return>;
  seq: number;
  thisArg: T;
};

export type TapReturn<T, Args, Return> = {
  args: Args;
  result: Return;
  seq: number;
  thisArg: T;
};

export type TapError<T, Args> = {
  args: Args;
  error: unknown;
  seq: number;
  thisArg: T;
};

const descriptionXObservable = new WeakMap<
  TypedPropertyDescriptor<Callable>,
  Observable<unknown>
>();
