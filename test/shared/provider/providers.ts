import { it } from "bun:test";

export type ProvidedData<T extends unknown[]> = [string, ...T];
export type DataProvider<T extends unknown[]> = Generator<ProvidedData<T>>;

export function provided<T extends unknown[]>(
  name: string,
  generator: Generator<ProvidedData<T>>,
  test: (...data: T) => void | Promise<void>,
) {
  for (const [suffix, ...data] of generator) {
    it(`${name} (${suffix})`, () => test(...data));
  }
}
