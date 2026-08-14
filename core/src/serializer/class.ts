/* eslint-disable @typescript-eslint/no-explicit-any */
type Constructor<T> = new (...args: any[]) => T;
type AbstractConstructor<T> = abstract new (...args: any[]) => T;
/* eslint-enable @typescript-eslint/no-explicit-any */

// TODO export this somewhere?
export type Class<T> = Constructor<T> | AbstractConstructor<T>;
