import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(1, "Product description is required"),
  currentPrice: z.number().positive("Current price must be a positive number"),
  previousPrice: z.number().optional(),
  stock: z.number().int().nonnegative("Stock must be a non-negative integer"),
  images: z.array(z.string().url("Invalid image URL")),
});

export const filterSchema = z.object({
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  category: z.string().optional(),
  stock: z.string().optional(),
});

export const searchSchema = z.object({
  query: z.string().min(3, "Please enter a valid search name").optional(),
});

export const productsSchema = z.array(productSchema);
