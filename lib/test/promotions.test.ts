import type { Container } from "@adeficior/data-modifier-core";
import { describe, expect, it, mock } from "bun:test";
import { promote } from "../src/promotions";

class Service {
  readonly mocked = mock();

  method() {
    this.mocked();
  }
}

function createTestContainer<T extends Record<string, unknown>>(
  services: T,
): Container<T> {
  return {
    getOrNull: (key: keyof T & string) => services[key],
    get: (key: keyof T & string) => {
      if (!(key in services)) throw new Error(`unknown service ${key}`);
      return services[key];
    },
  };
}

describe("service promotions", () => {
  it("promoted properties on objects", () => {
    const target = new Service();

    const serviceA = {
      method: mock(),
    };

    const serviceB = new Service();

    const container = createTestContainer({
      serviceA,
      serviceB,
    });

    type PromotedService = Service & {
      a: typeof serviceA;
      b: typeof serviceB;
    };

    const promoted = promote(
      target,
      [
        {
          path: ["a"],
          service: "serviceA",
        },
        {
          path: ["b"],
          service: "serviceB",
        },
      ],
      container,
    ) as unknown as PromotedService;

    promoted.method();
    promoted.a.method();
    promoted.b.method();

    expect(promoted.a).toEqual(serviceA);
    expect(promoted.b).toEqual(serviceB);

    expect(promoted.mocked).toBeCalledTimes(1);
    expect(serviceA.method).toBeCalledTimes(1);
    expect(serviceB.mocked).toBeCalledTimes(1);
  });

  it("promotes tested objects", () => {
    const target = new Service();

    const serviceA = new Service();
    const serviceB = new Service();
    const serviceC = new Service();
    const serviceD = new Service();

    const container = createTestContainer({
      serviceA,
      serviceB,
      serviceC,
      serviceD,
    });

    type PromotedService = Service & {
      a: typeof serviceA & {
        b: typeof serviceB;
      };
      c: typeof serviceC & {
        d: typeof serviceD;
      };
    };

    const promoted = promote(
      target,
      [
        {
          path: ["a"],
          service: "serviceA",
        },
        {
          path: ["a", "b"],
          service: "serviceB",
        },
        {
          path: ["c", "d"],
          service: "serviceD",
        },
        {
          path: ["c"],
          service: "serviceC",
        },
      ],
      container,
    ) as unknown as PromotedService;

    promoted.a.method();
    promoted.a.b.method();
    promoted.c.method();
    promoted.c.d.method();

    expect(promoted.a).toEqual(serviceA as PromotedService["a"]);
    expect(promoted.a.b).toEqual(serviceB);
    expect(promoted.c).toEqual(serviceC as PromotedService["c"]);
    expect(promoted.c.d).toEqual(serviceD as PromotedService["c"]);

    expect(serviceA.mocked).toBeCalledTimes(1);
    expect(serviceB.mocked).toBeCalledTimes(1);
    expect(serviceC.mocked).toBeCalledTimes(1);
    expect(serviceD.mocked).toBeCalledTimes(1);
  });
});
