/**
 * RFC Store — Robots.txt (Phase 9)
 *
 * Controls crawler access to the application.
 *
 * ALLOWED:  Homepage, /shop, /shop/[slug] — public product pages
 * DISALLOWED: Admin, API, Account, Checkout, Cart, Order confirmation
 */
import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/api/",
          "/account/",
          "/checkout/",
          "/cart/",
          "/order-confirmation/",
          "/login",
          "/signup",
          "/_next/",
        ],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}

