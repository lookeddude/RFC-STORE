/**
 * cn — className utility
 *
 * Merges class names safely, handling conditional values.
 * Wraps `clsx` for simple, readable className composition.
 *
 * Usage:
 *   cn('base-class', isActive && 'active', variant === 'primary' && 'primary-btn')
 */
import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]): string {
  return clsx(...inputs);
}
