/* eslint-disable @typescript-eslint/no-explicit-any */
export type Callable<Args extends unknown[] = any, ReturnType = any> = (
  ...args: Args
) => ReturnType;
export type Newable<Args extends unknown[] = any, ReturnType = any> = new (
  ...args: Args
) => ReturnType;
