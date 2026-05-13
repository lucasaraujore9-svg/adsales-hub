import { PageHeader } from "@/components/shared/page-header";
import { WidgetCard } from "@/components/shared/widget-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";

export const metadata = { title: "Prospeccao · AdSales Hub" };

export default function ProspectingPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-8">
      <PageHeader
        kicker="CRM"
        title="Prospeccao"
        description="Base oficial brasileira (CNAE, cidade, porte, regime) + envio direto pro CRM"
      />

      <WidgetCard kicker="Busca" title="Encontre empresas por criterio">
        <form className="grid grid-cols-1 gap-3 md:grid-cols-4" action="/prospeccao" method="get">
          <div>
            <Label htmlFor="cnae">CNAE</Label>
            <Input id="cnae" name="cnae" placeholder="6201-5/00" />
          </div>
          <div>
            <Label htmlFor="cidade">Cidade</Label>
            <Input id="cidade" name="cidade" placeholder="Sao Paulo" />
          </div>
          <div>
            <Label htmlFor="estado">Estado</Label>
            <Input id="estado" name="estado" placeholder="SP" />
          </div>
          <div>
            <Label htmlFor="porte">Porte</Label>
            <select id="porte" name="porte" className="mt-1 w-full rounded-md border border-[color:var(--line-2)] bg-[color:var(--bg)] px-3 py-2 text-sm">
              <option value="">Qualquer</option>
              <option value="mei">MEI</option>
              <option value="me">ME</option>
              <option value="epp">EPP</option>
              <option value="demais">Demais</option>
            </select>
          </div>
          <Button type="submit" className="md:col-span-4" variant="outline">
            <Search className="mr-1 h-4 w-4" /> Buscar
          </Button>
        </form>
      </WidgetCard>

      <div className="mt-6 rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-10 text-center text-sm text-[color:var(--ink-3)]">
        <p>
          Base integrada sera ativada na <strong>issue 069</strong>. Quando a conexao com a base
          oficial (Receita Federal / CNPJ) estiver em producao, resultados aparecerao aqui com opcao de
          enviar direto pra fila do SDR IA ou pro pipeline comercial.
        </p>
      </div>
    </div>
  );
}
