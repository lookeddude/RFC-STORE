/**
 * RFC Store — Types Index
 * Re-exports all domain types for convenient importing.
 */

export type { Database, Tables, TablesInsert, TablesUpdate, Enums, Json } from "./database";
export type {
  Category,
  Product,
  ProductCard,
  ProductImage,
  ProductVariant,
  ProductFilters,
  PerformanceSpec,
  SortOption,
  CartItem,
  Cart,
} from "./product";
export type { UserProfile, Address, AuthUser, UserRole } from "./user";
export { isAdmin, isSuperAdmin } from "./user";
