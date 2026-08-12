# RFC Store — Phase Roadmap

## Phase 1 — Production Foundation ✅ COMPLETE
*Goal: Establish the complete technical foundation*

- [x] Next.js 16 + TypeScript architecture
- [x] Stitch Design System integration (Project `6383426045060807708`)
- [x] Global CSS design tokens (The Arena / The Lab duality)
- [x] Supabase connection (`efmwddxzsdiexzmyccvk`)
- [x] Environment variable strategy
- [x] Database architecture documented
- [x] Storage architecture documented
- [x] Auth foundation (middleware skeleton)
- [x] Reusable component library (Button, Badge, Card, Input, Container)
- [x] Layout components (Navbar, Footer)
- [x] State components (Loading, Error, Empty)
- [x] Application shell (Homepage, 404)
- [x] Health check API endpoint
- [x] SEO metadata foundation
- [x] Responsive layout foundation
- [x] Git/GitHub workflow
- [x] Vercel compatibility confirmed
- [x] Hostinger compatibility noted

---

## Phase 2 — Database & Authentication
*Goal: Real data flowing through the application*

- [ ] Supabase database migrations (all tables from DATABASE_SCHEMA.md)
- [ ] Row Level Security policies
- [ ] Supabase Auth integration (email/password + social)
- [ ] Customer registration and login UI
- [ ] Protected account routes
- [ ] User profile page
- [ ] Admin role detection
- [ ] Generate TypeScript types from Supabase schema
- [ ] Supabase Storage buckets creation

---

## Phase 3 — Product Catalogue
*Goal: Products browsable and searchable*

- [ ] Product listing page (/shop)
- [ ] Category pages (/categories/[slug])
- [ ] Product detail page (/shop/[slug])
- [ ] Product variants (size, color selection)
- [ ] Product image gallery
- [ ] Performance spec bars
- [ ] Search results (/search)
- [ ] Filtering and sorting
- [ ] Admin: Product management
- [ ] Admin: Product editor
- [ ] Admin: Category management

---

## Phase 4 — Cart & Wishlist
*Goal: Users can add items and save for later*

- [ ] Cart drawer / full cart page
- [ ] Add to cart / remove from cart
- [ ] Quantity adjustment
- [ ] Cart persistence (authenticated users: DB; guests: localStorage)
- [ ] Wishlist functionality
- [ ] Cart → Checkout transition

---

## Phase 5 — Checkout & Orders
*Goal: Complete purchase flow*

- [ ] Checkout page (shipping → payment → confirm)
- [ ] Address management
- [ ] Payment gateway integration (Stripe/Razorpay)
- [ ] Order confirmation page
- [ ] Order detail page
- [ ] Customer order history

---

## Phase 6 — Admin Dashboard
*Goal: Full store management capability*

- [ ] Admin dashboard overview
- [ ] Orders management (list, detail, status update)
- [ ] Customer management
- [ ] Inventory management
- [ ] Media Library UI
- [ ] Website Content Management (site_content CMS)
- [ ] Admin analytics

---

## Phase 7 — Production Deployment
*Goal: Live on Hostinger production environment*

- [ ] Final performance audit
- [ ] SEO final implementation (sitemap, robots, OG images)
- [ ] Hostinger Node.js deployment configuration
- [ ] Domain configuration
- [ ] SSL verification
- [ ] Production environment variables
- [ ] CDN/caching strategy
- [ ] Error monitoring (Sentry or similar)
- [ ] Load testing

---

## Technical Debt / Considerations

- Email service for order confirmations (Phase 5)
- Webhook handlers for payment provider events (Phase 5)
- Rate limiting on API routes (Phase 6)
- Admin audit logs (Phase 6)
- Booking/class schedule system (post-Phase 7 if required by RFC)
