import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Analytics } from "@vercel/analytics/next"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
