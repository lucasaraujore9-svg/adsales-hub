-- ============================================================================
-- AdSales Hub — Public catalog access
-- Migration: 00005
--
-- The modules/baskets/basket_modules/media_tiers catalogs hold the SaaS pricing
-- metadata. These need to be readable on the public pricing page (anon role)
-- and from every authenticated session. The original policies only granted
-- access to `authenticated`; here we drop and recreate them open to PUBLIC
-- (covers both anon and authenticated). Writes remain service_role-only.
-- ============================================================================

DROP POLICY IF EXISTS modules_select_auth ON modules;
CREATE POLICY modules_select_public ON modules FOR SELECT TO PUBLIC USING (true);

DROP POLICY IF EXISTS baskets_select_auth ON baskets;
CREATE POLICY baskets_select_public ON baskets FOR SELECT TO PUBLIC USING (true);

DROP POLICY IF EXISTS basket_modules_select_auth ON basket_modules;
CREATE POLICY basket_modules_select_public ON basket_modules FOR SELECT TO PUBLIC USING (true);

DROP POLICY IF EXISTS media_tiers_select_auth ON media_tiers;
CREATE POLICY media_tiers_select_public ON media_tiers FOR SELECT TO PUBLIC USING (true);
