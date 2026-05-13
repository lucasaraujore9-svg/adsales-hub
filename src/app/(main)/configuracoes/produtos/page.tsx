import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { getSession } from "@/lib/auth/guards";
import { ProductsManager } from "@/components/settings/products-manager";

export const metadata = { title: "Produtos e precos · AdSales Hub" };

interface ProductRow {
  id: string;
  name: string;
  sku: string | null;
  price: number;
  currency: string;
  billing_cycle: string;
  is_active: boolean;
}

export default async function ProductsSettingsPage() {
  const session = await getSession();
  const { data } = await session.supabase
    .from("products")
    .select("id, name, sku, price, currency, billing_cycle, is_active")
    .eq("workspace_id", session.workspaceId)
    .order("created_at", { ascending: false });
  const products = (data ?? []) as unknown as ProductRow[];

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-8">
      <Link
        href="/configuracoes"
        className="inline-flex items-center gap-1 text-xs text-[color:var(--ink-3)] hover:text-[color:var(--ink)]"
      >
        <ArrowLeft className="h-3 w-3" /> Configuracoes
      </Link>

      <PageHeader
        kicker="CRM"
        title="Produtos e precos"
        description="Catalogo usado em propostas, contratos e analise de mix por deal."
      />

      <ProductsManager products={products} />
    </div>
  );
}
