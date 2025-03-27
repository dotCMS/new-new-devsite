import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function extractAssetId(uri: string) {
    const match = uri.match(/\/dA\/([^/]+)/);
    return match ? match[1] : null;
}

/**
 * Checks if a string is valid JSON
 * @param str - The string to check
 * @returns true if the string is valid JSON, false otherwise
 */
export function isJSON(str: any): boolean {

    if( str instanceof Array) {
        return false;
    }
    if( str instanceof Object) {
        return true;
    }

  
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}
