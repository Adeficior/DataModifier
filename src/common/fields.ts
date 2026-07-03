import z from "zod";

export const CountSchema = z.codec(
  z.number().int().positive().optional(),
  z.number(),
  { decode: (it) => it ?? 1, encode: (it) => (it === 1 ? undefined : it) },
);
export const AmountSchema = z.number().positive();
export const ChanceSchema = z.number().max(1).positive().optional();
