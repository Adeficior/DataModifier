import type { InferIds, RegistryId } from "@adeficior/data-modifier/generated";
import type { Logger } from "@adeficior/pack-resolver";
import { ZodError } from "zod";

export class IllegalShapeError extends Error {
  constructor(
    message: string,
    readonly input?: unknown,
  ) {
    super(message);
  }
}

export class UnknownRegistryEntry<T extends RegistryId> extends Error {
  constructor(
    message: string,
    readonly registry: T,
    readonly id: InferIds<T>,
  ) {
    super(message);
  }
}

export function transformError(error: unknown): Error {
  if (error instanceof ZodError) {
    const message = error.issues
      .map((it) => {
        if (it.path) return `${it.path.join(".")}: ${it.message}`;
        else return it.message;
      })
      .join(", ");
    return new IllegalShapeError(message);
  }

  if (error instanceof Error) return error;
  return new Error("an unknown error occured");
}

export function transformErrors<T>(run: () => T): T {
  try {
    return run();
  } catch (error) {
    throw transformError(error);
  }
}

export function tryCatching<T>(logger: Logger, run: () => T): T | null {
  try {
    return run();
  } catch (error) {
    const transformed = transformError(error);

    if (transformed instanceof IllegalShapeError) {
      if (transformed.input)
        logger?.trace(transformed.message, { input: transformed.input });
      else logger?.trace(transformed.message);
      return null;
    }

    throw error;
  }
}
