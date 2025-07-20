/**
 * utils.ts
 *
 * Utility functions for Fintrack GenZ Vision.
 * - cn: Combines class names using clsx and merges Tailwind classes
 *
 * Dependencies:
 * - clsx: Utility for conditional class names
 * - tailwind-merge: Merges Tailwind CSS classes to avoid conflicts
 *
 * NOTE: Use cn for all dynamic className props in React components.
 */

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * cn
 * Combines and merges class names for React components.
 * @param {...ClassValue[]} inputs - List of class values
 * @returns {string} Merged class name string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
