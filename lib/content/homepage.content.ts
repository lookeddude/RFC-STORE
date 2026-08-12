/**
 * RFC Store — Homepage Content Data
 *
 * Single source of truth for all homepage content.
 * All section content is isolated here so future CMS migration
 * requires only replacing the data in this file — no JSX changes needed.
 *
 * Phase 2: Static seed data matching the approved Stitch design.
 * Phase 4+: Replace exports with Supabase CMS fetch functions.
 *
 * Image URLs: lh3.googleusercontent.com (Stitch design references)
 * Permitted in next.config.ts remotePatterns.
 * Replace with Supabase storage URLs after Phase 3 media library is built.
 */

// ── Announcement Bar ─────────────────────────────────────

export const ANNOUNCEMENT_TEXT =
  "FREE SHIPPING ON ORDERS ABOVE ₹5000 • ENGINEERED FOR PERFORMANCE";

// ── Hero Section ─────────────────────────────────────────

export interface HeroContent {
  headline: string;
  subheadline: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  image: {
    src: string;
    alt: string;
  };
}

export const HERO_CONTENT: HeroContent = {
  headline: "BUILT FOR THE FIGHT.",
  subheadline:
    "Professional grade equipment engineered for the arena. Crafted with precision for those who demand excellence.",
  primaryCta: { label: "SHOP NOW", href: "/shop" },
  secondaryCta: { label: "EXPLORE COLLECTION", href: "/categories" },
  image: {
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDt-kRal9mweE9dqDRHvai8qz4gII8WL8MqIpzIsCCrNZkxZFgFmlnWODUc8mqckRvxU2UkgbYIT2aMtVu3oIctGeOwDzQs4Dof2vg8mT7GmzD1Qf20ItupSRp-lwqMgLxxLzIalxEeECK5ddzuo7hX1N_RjrkVSNwySZvtp216glbSRqyeOxUQN9E9kKQdfneLlOEABp0eFZjDBN7vfePGoBufzMXzB6_NDRLW3L2p6Kofhzzq4K-G",
    alt: "A high-contrast, dramatic shot of an MMA fighter wrapping their hands in a dimly lit, authentic training gym. Strong directional lighting highlights the muscle definition and the texture of the hand wraps. The mood is intense, focused, and gritty.",
  },
};

// ── Shop by Discipline (Bento Grid) ──────────────────────

export interface Discipline {
  slug: string;
  title: string;
  description: string | null;
  href: string;
  /** CSS grid span — used for bento layout */
  gridSize: "large" | "medium" | "wide";
  image: {
    src: string;
    alt: string;
  };
}

export const DISCIPLINES: Discipline[] = [
  {
    slug: "boxing",
    title: "Boxing",
    description: "Gloves, Wraps & Protection",
    href: "/categories/boxing",
    gridSize: "large",
    image: {
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuAklNQ6d-s0fvtr0Y-oD0PQSZZFWH8K0i1JmatXYTl569POtmSmHnQEJp1pGnPZy2zKD8h80z8QBm64AAnDmls67MbV5h1XWIzQx-3ubcYqQo5K8W90tIem0_tXqxC42gkCTfHEXtoq5MrVK49ulVSdXzaANlAlGfAKHfsgrXqaxtaOouBDBkkDHlsASlNN6plxQZWzqnhoKGHKNo5RVKCv9iCgBpO2N3zLBQAO2mYRWW0-CmjdewE1",
      alt: "Close up of a pair of premium red leather boxing gloves resting on the canvas of a boxing ring. Clean, bright, highly detailed commercial product photography.",
    },
  },
  {
    slug: "mma",
    title: "MMA",
    description: null,
    href: "/categories/mma",
    gridSize: "medium",
    image: {
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDgv2if75wvw5Rf48DedSPPnIOl98ngAIYmtOAqTwNk8GIS5rfc306a6IA9qXE6HossRkF-k_dZwFnOSqvgMcW5AzWN8aJrIk986MQOLvQVBEDrrEOSZA6VnUuEP1i3Z39TVoppQjtGenNsGxa3HiQomswwBP4dfdABib-JOBeQ9u_Q65Rfjjg0--ImDter_nZuRXs2ns05OOQfbo_JULdPtMRYhcIhiJExkTmj0vIT0ikRBDuBlttp",
      alt: "Dynamic shot of an athlete wearing MMA grappling gloves demonstrating a submission hold on a mat. Bright, clean lighting focusing on the gear and technique.",
    },
  },
  {
    slug: "muay-thai",
    title: "Muay Thai",
    description: null,
    href: "/categories/muay-thai",
    gridSize: "medium",
    image: {
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuC1fWitvMAMGSzlb20knBfO8ELSmSkVKoC3ofh-XhW3xZARqqOV9jZCptZTrNftwmK25G2PhoRogKjw6N4fviBTxy2J3PDtlyskSdQWnpfvZ6rYgCoDoHFPRMSpS3TIYoUI1oMr-MPEuM4UF9xl8Bu4lbfSJANQ4xAOBm1Xuy4r_RfqXKSMoNOkO0g8S_dhZvSFqKGdgyk-zl54q9LzIjvnwLl2xNQ9JwhUedU9m6OIVf3clULi0rgT",
      alt: "A fighter striking a heavy bag with a powerful Muay Thai roundhouse kick, wearing premium shin guards and shorts. Action-oriented, crisp lighting in a modern training facility.",
    },
  },
  {
    slug: "training-gear",
    title: "Training Gear",
    description: null,
    href: "/categories/training-gear",
    gridSize: "wide",
    image: {
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuAl7WG_GJqDOhdmCGK_3MRXyN7wDyICCiE9xPwwTWGhhsz9TYd-qNzOZqWxT62DXdEEc6Wb6vUIDFP5vR8IvRT6G1ctlIjBdxUDxzU4nyG4ha4JoD3mRrqPlbXd6OR4cph8ooc-CsbqpzU6cwEAiFInmhfFFBgA2is1sgwvyovxBSo2f9RAcYXlcFXbvXxjVvQzE8C-BBo648rj4VtVyl0XvOf6DlpB-iJtpbTG2SvUmMrNrAThwlW3",
      alt: "A collection of kickboxing training gear including focus mitts and striking pads arranged neatly on a polished concrete floor. High-key, clean commercial aesthetic.",
    },
  },
];

// ── Featured Gear (Seed Products) ────────────────────────

export interface HomepageProduct {
  /** Stable identifier — maps to future Supabase product slug */
  id: string;
  name: string;
  /** Subtitle shown below name (e.g. "Professional Grade") */
  subtitle: string;
  /** Price in INR paise (e.g. 849900 = ₹8,499) */
  priceInr: number;
  /** Original compare-at price, null if no discount */
  compareAtPriceInr: number | null;
  href: string;
  image: {
    src: string;
    alt: string;
  };
  /** Badge text e.g. "NEW", "BESTSELLER" — null for none */
  badge: string | null;
}

export const FEATURED_PRODUCTS: HomepageProduct[] = [
  {
    id: "apex-pro-gloves",
    name: "Apex Pro Gloves",
    subtitle: "Professional Grade",
    priceInr: 8499,
    compareAtPriceInr: null,
    href: "/shop/apex-pro-gloves",
    badge: "BESTSELLER",
    image: {
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDElwFEpP0B5j5E28wfrIBk6TDB6dK6vROtd1RH8wIaTK_9zu0LmWdMWPNvSvFPhMUixerypRFRPyOOyqvLAWcbAAUSlD2FPb3OohD0BdoaEjmviMJohGQIqaNoSVkiAIgHKab85URMsVAZ849ctsQkYlpXz0HiTdxuXW5TtBJrBd9ZWi1aICnz2q2Mwp-edIoRPpVcNMQ_zU047BvMzi5X_oV-6b8gXxU22gXO0I8PCK-r7Csldd5r",
      alt: "Apex Pro Boxing Gloves in classic black leather. Isolated on a pure white background. Studio lighting, sharp focus, highlighting the stitching and premium material texture.",
    },
  },
  {
    id: "combat-hand-wraps",
    name: "Combat Hand Wraps",
    subtitle: '180" Elastic',
    priceInr: 999,
    compareAtPriceInr: 1299,
    href: "/shop/combat-hand-wraps",
    badge: "NEW",
    image: {
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuCyaNlWhkOnjCX6yRedJcAXW2rqjUP-XI0V-wPXnJwNopvNqXLrkqidBBgrDD189JXan0wyV1Gce2TLz6-H5HtPer_gDRrutS1Lzv5zDLTiRUOpi_sI9sPhLNEWW9Ph6nAkCOnJAIEK32KDhmyzDeW6-dJTJZYkzszxh9CfPbs_nQM9xpjTFvtRHLYHstqLx05Oxk1D2FQ4MlP0GfMuqsUc_wjO36NwWxNLVSq_Wm9Ym_9suZwtUGKD",
      alt: "Combat Hand Wraps neatly rolled and stacked. Bright red color standing out against a pure white studio background. Clinical, high-clarity product photography.",
    },
  },
  {
    id: "heavy-bag-4ft",
    name: "Heavy Bag 4ft",
    subtitle: "Synthetic Leather",
    priceInr: 12999,
    compareAtPriceInr: null,
    href: "/shop/heavy-bag-4ft",
    badge: null,
    image: {
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuCvqTugsd6NmTzzjJVdnMznbhS1S_EHNbu4D0iJi6E6y858tFGVI0hk13ESPEN2X7gDbvi4O1QTFGeVpUo82gUlL-Ul_MfxysI-KaukL7AdPX4qvLtXwOxMgb6N3Cm1sAucnRVBAaGoTsx6IiCjWeHorLFSqEC65aUWTyaXECI2vwJQStk7nGOHnXoMSlZVP84ms3yqN6CeOZc20TnTB8asX9hi-Aymzg4RWRlGsNEgvLjtjSa9XjLd",
      alt: "A 4ft Heavy Punching Bag, synthetic leather, black with subtle branding. Isolated on a pure white background. Minimalist, premium product shot.",
    },
  },
  {
    id: "pro-shin-guards",
    name: "Pro Shin Guards",
    subtitle: "Maximum Protection",
    priceInr: 5499,
    compareAtPriceInr: null,
    href: "/shop/pro-shin-guards",
    badge: null,
    image: {
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuAjlazzLtZkntNjq6ZsgWvgedKeYTBsQvytzzhQbqxOGYCGgITiGNHpz0E4UTH4jM8zKiSQoEm5FBcRYsqsGZf1ghJ_T5AD2H_2BvmRKkUBDRVbo9lV8URhHp1crwHUIf0oS2dRg0wWZGVt_CiVsIgk-89H7G4nEd5SZC9Y6EVKNx2FCUhbBfOTswnPyKLEu-JvgPbmt0UhHCDo3F1BVoDWsisyRJb49nbG7qeeCfOJTdFk3vIiIVQF",
      alt: "Pro Shin Guards in matte black. Front view, perfectly symmetric against a clean white studio background. High contrast, sharp detail on the protective padding.",
    },
  },
];

// ── Dark Editorial Banner ─────────────────────────────────

export interface EditorialContent {
  headline: string;
  subtext: string;
  cta: { label: string; href: string };
  image: {
    src: string;
    alt: string;
  };
}

export const EDITORIAL_CONTENT: EditorialContent = {
  headline: "ENGINEERED FOR IMPACT.",
  subtext:
    "Our gear is tested in the fire of the hardest training camps. Built to absorb, built to endure, built so you can push past your limits.",
  cta: { label: "EXPLORE THE COLLECTION", href: "/shop" },
  image: {
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuBt0VPbT4bSvNxD--I7S3CO_2CAiz25p87wJ35Xz5uMhJJlurSP-haWD_oZfj8HLwb8FBI-PhdFzEj2f9PIVO8vuD0PZ2m5VVYOldbRIKxmfoJzMHvHnY99Cl96Uf7w4Q8qRA1n_xAskin0s-JkmMKhDkkCYB0nHTbsiBj1o27UTuryyRZmU0MgsdGRWL_zTW065QEIUj-F8uU7Na7k-RyiK36nc-ifPCIJCO4XpNIk21UHrIjbKiVY",
    alt: "Close up abstract shot of sweat dripping off a heavily used, textured leather heavy bag in a dark, atmospheric boxing gym. The lighting is cinematic and moody.",
  },
};
