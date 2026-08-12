/**
 * RFC Store — Site-wide Constants
 *
 * Change values here to update them everywhere.
 * Do not scatter literal strings throughout components.
 */

export const RFC_BRAND = {
  name: "REVIVE FIGHT CLUB",
  shortName: "RFC",
  tagline: "Train Like a Champion",
  description:
    "Premium combat sports equipment and athletic gear for fighters who demand the best.",
  email: "hello@revivefightclub.com",
  social: {
    instagram: "https://instagram.com/revivefightclub",
    facebook: "https://facebook.com/revivefightclub",
  },
} as const;

export const ROUTES = {
  home: "/",
  shop: "/shop",
  categories: "/categories",
  search: "/search",
  cart: "/cart",
  checkout: "/checkout",
  account: {
    root: "/account",
    orders: "/account/orders",
    wishlist: "/account/wishlist",
    profile: "/account/profile",
    addresses: "/account/addresses",
  },
  auth: {
    login: "/login",
    signup: "/signup",
    logout: "/logout",
    resetPassword: "/reset-password",
  },
  admin: {
    root: "/admin",
    dashboard: "/admin/dashboard",
    products: "/admin/products",
    orders: "/admin/orders",
    customers: "/admin/customers",
    media: "/admin/media",
    content: "/admin/content",
  },
} as const;

export const PRODUCT_CONFIG = {
  /**  Default number of products per page in listings */
  itemsPerPage: 24,
  /** Maximum number of items in a cart session */
  maxCartItems: 50,
  /** Maximum quantity for a single product in cart */
  maxItemQuantity: 10,
  /** Low-stock threshold for inventory warnings */
  lowStockThreshold: 5,
} as const;

export const IMAGE_SIZES = {
  /** Product card thumbnail */
  thumbnail: 400,
  /** Product listing medium */
  medium: 800,
  /** Product detail main image */
  large: 1200,
  /** Full-width hero images */
  hero: 1920,
} as const;

export const NAV_LINKS = [
  { label: "Shop All", href: ROUTES.shop },
  { label: "Categories", href: ROUTES.categories },
] as const;
