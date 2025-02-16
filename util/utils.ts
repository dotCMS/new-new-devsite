import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function extractAssetId(uri: string) {
    const match = uri.match(/\/dA\/([^/]+)/);
    return match ? match[1] : null;
}
