import z from "zod";

export const CountSchema = z.number().int().positive().default(1);
export const AmountSchema = z.number().positive();
export const ChanceSchema = z.number().max(1).positive().optional();
