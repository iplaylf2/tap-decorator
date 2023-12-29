import { type Newable } from "./function";

export type InstanceMethodDecorator<T, Key, M> = (
  target: T,
  propertyKey: Key,
  descriptor: TypedPropertyDescriptor<M>,
) => T extends Newable ? unknown : TypedPropertyDescriptor<M> | void;
