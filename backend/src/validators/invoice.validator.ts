import { InvoiceStatus } from "@prisma/client";
import { z } from "zod";

const iso4217Fallback = [
  "AED","AFN","ALL","AMD","ANG","AOA","ARS","AUD","AWG","AZN","BAM","BBD","BDT","BGN","BHD","BIF",
  "BMD","BND","BOB","BOV","BRL","BSD","BTN","BWP","BYN","BZD","CAD","CDF","CHE","CHF","CHW","CLF",
  "CLP","CNY","COP","COU","CRC","CUC","CUP","CVE","CZK","DJF","DKK","DOP","DZD","EGP","ERN","ETB",
  "EUR","FJD","FKP","GBP","GEL","GHS","GIP","GMD","GNF","GTQ","GYD","HKD","HNL","HRK","HTG","HUF",
  "IDR","ILS","INR","IQD","IRR","ISK","JMD","JOD","JPY","KES","KGS","KHR","KMF","KPW","KRW","KWD",
  "KYD","KZT","LAK","LBP","LKR","LRD","LSL","LYD","MAD","MDL","MGA","MKD","MMK","MNT","MOP","MRU",
  "MUR","MVR","MWK","MXN","MXV","MYR","MZN","NAD","NGN","NIO","NOK","NPR","NZD","OMR","PAB","PEN",
  "PGK","PHP","PKR","PLN","PYG","QAR","RON","RSD","RUB","RWF","SAR","SBD","SCR","SDG","SEK","SGD",
  "SHP","SLE","SLL","SOS","SRD","SSP","STN","SVC","SYP","SZL","THB","TJS","TMT","TND","TOP","TRY",
  "TTD","TWD","TZS","UAH","UGX","USD","USN","UYI","UYU","UYW","UZS","VED","VES","VND","VUV","WST",
  "XAF","XAG","XAU","XBA","XBB","XBC","XBD","XCD","XDR","XOF","XPD","XPF","XPT","XSU","XTS","XUA",
  "XXX","YER","ZAR","ZMW","ZWL"
] as const;

const supportedCurrencyCodes = new Set(
  ((Intl as unknown as { supportedValuesOf?: (key: string) => string[] }).supportedValuesOf?.("currency") ??
    []) as string[]
);
const allowedCurrencyCodes =
  supportedCurrencyCodes.size > 0 ? supportedCurrencyCodes : new Set<string>(iso4217Fallback);

const moneySchema = z
  .union([z.string(), z.number()])
  .transform((value) => String(value).trim())
  .refine((value) => /^\d+(\.\d{1,2})?$/.test(value), {
    message: "Amount must be a valid non-negative decimal with up to 2 digits"
  });

const currencySchema = z
  .string()
  .trim()
  .toUpperCase()
  .length(3, "Currency must be a 3-letter ISO code")
  .refine((value) => allowedCurrencyCodes.has(value), {
    message: "Currency must be a valid ISO-4217 code"
  });

const invoiceNumberSchema = z
  .string()
  .trim()
  .min(1)
  .max(64)
  .transform((value) => value.toUpperCase());

export const listInvoicesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.nativeEnum(InvoiceStatus).optional(),
  clientId: z.string().min(1).optional(),
  search: z.string().trim().max(80).transform((value) => value.toUpperCase()).optional()
});

export const createDraftInvoiceSchema = z.object({
  clientId: z.string().min(1),
  projectId: z.string().min(1).optional(),
  invoiceNumber: invoiceNumberSchema,
  currency: currencySchema,
  subtotal: moneySchema,
  tax: moneySchema,
  total: moneySchema,
  dueDate: z.coerce.date()
});

export const updateDraftInvoiceSchema = z.object({
  clientId: z.string().min(1).optional(),
  projectId: z.string().min(1).nullable().optional(),
  invoiceNumber: invoiceNumberSchema.optional(),
  currency: currencySchema.optional(),
  subtotal: moneySchema.optional(),
  tax: moneySchema.optional(),
  total: moneySchema.optional(),
  dueDate: z.coerce.date().optional()
});

export const invoiceParamsSchema = z.object({
  invoiceId: z.string().min(1)
});

export type ListInvoicesQueryInput = z.infer<typeof listInvoicesQuerySchema>;
export type CreateDraftInvoiceInput = z.infer<typeof createDraftInvoiceSchema>;
export type UpdateDraftInvoiceInput = z.infer<typeof updateDraftInvoiceSchema>;
export type InvoiceParamsInput = z.infer<typeof invoiceParamsSchema>;
