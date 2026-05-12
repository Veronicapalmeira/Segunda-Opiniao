import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Menu,
  MapPin,
  Calendar,
  ThumbsUp,
  LogOut,
  Users,
  Activity,
  BarChart3,
  Settings,
  MessageSquare,
  User,
  AlertCircle,
  Pencil,
} from "lucide-react";
import logoWhite from "@/components/ui/sobre-vidas-branca.png";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { FloatingAssistants } from "@/components/SecondOpinionPanel";

export const Route = createFileRoute("/")({
  component: PatientPage,
});

function PatientPage() {
  const [tab, setTab] = useState<"avaliacao" | "conduta">("avaliacao");

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="flex items-center justify-between bg-primary px-4 py-3 text-primary-foreground">
        <div className="flex items-center gap-3">
          <Menu className="h-6 w-6" />
          <div className="flex h-10 w-10 items-center justify-center">
            <img src={logoWhite} alt="SobreVidas" className="h-8 w-8 object-contain" />
          </div>
          <span className="text-xl font-semibold">SobreVidas</span>
        </div>
        <div className="flex items-center gap-3">
          <ThumbsUp className="h-5 w-5" />
          <Calendar className="h-5 w-5" />
          <div className="rounded-md bg-white/15 px-3 py-1.5 text-right text-xs">
            <div className="font-bold tracking-wide">ADMINISTRADOR SOBREVIDAS 1</div>
            <div className="opacity-80">ADMINISTRADOR</div>
          </div>
          <LogOut className="h-5 w-5" />
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-72 shrink-0 border-r border-border bg-card p-4 min-h-[calc(100vh-60px)]">
          <div className="mb-6 rounded-lg bg-primary/10 p-3 text-xs">
            <div className="mb-1 flex items-center gap-2 font-bold text-primary">
              <MapPin className="h-4 w-4" /> MEU LOCAL DE ATENDIMENTO
            </div>
            <div className="font-semibold">HOSPITAL DAS CLINICAS</div>
            <div className="text-muted-foreground">GOIANIA/GO</div>
          </div>

          <NavSection title="HOME">
            <NavItem icon={<Calendar className="h-4 w-4" />} label="Agenda" />
          </NavSection>

          <NavSection title="ATENDIMENTOS">
            <NavItem icon={<User className="h-4 w-4" />} label="Paciente" active />
            <NavItem icon={<MessageSquare className="h-4 w-4" />} label="Segunda Opinião" />
          </NavSection>

          <NavSection title="MONITORAMENTO">
            <NavItem icon={<Activity className="h-4 w-4" />} label="Painel Gerencial Inteligente" />
            <NavItem icon={<BarChart3 className="h-4 w-4" />} label="Gráficos" />
          </NavSection>

          <NavSection title="ADMINISTRAÇÃO">
            <NavItem icon={<Settings className="h-4 w-4" />} label="Configuração" />
          </NavSection>
        </aside>

        {/* Main */}
        <main className="flex-1 p-6">
          <div className="mb-4 flex items-center gap-2 text-primary">
            <Users className="h-5 w-5" />
            <h1 className="text-lg font-bold tracking-wide">PACIENTE LEANDRO</h1>
          </div>

          {/* Patient card */}
          <div className="rounded-xl border border-border bg-card">
            <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-7 md:items-center">
              <Info label="NOME COMPLETO" value="Leandro da Silva" />
              <Info label="CPF" value="000.000.000-00" />
              <Info label="IDADE" value="51 anos" />
              <Info label="CNS" value="000.000.000" />
              <Info label="SEXO" value="Masculino" />
              <Info label="TELEFONE" value="(xx) xxxxx-xxxx" />
              <Button variant="outline" className="border-primary text-primary">
                Ver cadastro
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-3 border-t border-border p-4">
              <AlertCircle className="h-5 w-5 text-primary" />
              <span className="font-semibold">Fatores de Risco para Câncer de Boca</span>
              <Tag>Tabagista</Tag>
              <Tag>Etilista</Tag>
              <Tag>Homem com idade &gt;= 50 anos</Tag>
              <Button variant="outline" className="ml-auto border-primary text-primary">
                <Pencil className="mr-2 h-4 w-4" /> Editar
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="my-8 flex items-center">
            <div className="h-0.5 flex-1 bg-primary" />
            <button
              onClick={() => setTab("avaliacao")}
              className={`mx-2 rounded-full border-2 px-6 py-2 text-sm font-semibold ${
                tab === "avaliacao"
                  ? "border-primary bg-background text-foreground"
                  : "border-border bg-background text-muted-foreground"
              }`}
            >
              Avaliação Clínica
            </button>
            <div className={`h-0.5 flex-1 ${tab === "conduta" ? "bg-primary" : "bg-border"}`} />
            <button
              onClick={() => setTab("conduta")}
              className={`mx-2 rounded-full border-2 px-6 py-2 text-sm font-semibold ${
                tab === "conduta"
                  ? "border-primary bg-background text-foreground"
                  : "border-border bg-background text-muted-foreground"
              }`}
            >
              Conduta
            </button>
            <div className="h-0.5 flex-1 bg-border" />
          </div>

          {tab === "avaliacao" ? <AvaliacaoTab /> : <CondutaTab />}
        </main>
      </div>

      <FloatingAssistants />
    </div>
  );
}

function NavSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <div className="mb-2 px-2 text-xs font-bold tracking-wider text-muted-foreground">{title}</div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function NavItem({ icon, label, active }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <button
      className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm ${
        active ? "bg-primary-soft text-primary font-semibold" : "text-foreground hover:bg-muted"
      }`}
    >
      {icon} <span>{label}</span>
    </button>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase text-muted-foreground">{label}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">{children}</span>
  );
}

function AvaliacaoTab() {
  const [hasLesion, setHasLesion] = useState<"sim" | "nao" | "">("");
  return (
    <div className="space-y-6">
      <div>
        <p className="mb-3 text-sm">Paciente possui lesão bucal suspeita?</p>
        <div className="flex gap-3">
          {(["sim", "nao"] as const).map((v) => (
            <label
              key={v}
              className="flex flex-1 max-w-xs items-center gap-2 rounded-lg border border-border px-4 py-3 text-sm cursor-pointer hover:bg-muted"
            >
              <input
                type="radio"
                name="has-lesion"
                checked={hasLesion === v}
                onChange={() => setHasLesion(v)}
              />
              {v === "sim" ? "Sim" : "Não"}
            </label>
          ))}
        </div>
      </div>

      {hasLesion === "sim" && (
        <div className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
          Selecione regiões da boca com lesão para avaliação clínica detalhada.
        </div>
      )}
    </div>
  );
}

function CondutaTab() {
  return (
    <div className="space-y-8">
      <section>
        <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-primary">
          Procedimentos Gerais Realizados
        </h3>
        <div className="space-y-3">
          <ToggleRow label="Orientações em saúde" defaultOpen />
          <ToggleRow label="Outros" />
          <ToggleRow label="Solicitação de exame por imagem" />
          <ToggleRow label="Solicitação de exame laboratorial" />
          <ToggleRow label="Solicitação de farmacoterapia" defaultOpen />
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-primary">
          Realização de Biópsias
        </h3>
        <div className="space-y-3">
          <ToggleRow label="Biópsia Excisional" />
          <ToggleRow label="Biópsia Incisional" />
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-primary">Agendamento</h3>
        <p className="mb-3 text-sm">Para onde deseja agendar retorno do paciente? *</p>
        <div className="flex gap-3">
          <label className="flex items-center gap-2 rounded-lg border border-border px-4 py-3 text-sm cursor-pointer hover:bg-muted">
            <Checkbox /> Na minha própria unidade
          </label>
          <label className="flex items-center gap-2 rounded-lg border border-border px-4 py-3 text-sm cursor-pointer hover:bg-muted">
            <Checkbox /> Para a Atenção Secundária
          </label>
        </div>
      </section>

      <div className="flex justify-end gap-3 border-t border-border pt-6">
        <Button id="finalizar-consulta" className="bg-primary">Finalizar consulta</Button>
      </div>
      <p className="text-right text-xs text-muted-foreground">
        Caso tenha preenchido a Segunda Opinião, ela será enviada junto ao finalizar a consulta.
      </p>
    </div>
  );
}

function ToggleRow({ label, defaultOpen }: { label: string; defaultOpen?: boolean }) {
  const [on, setOn] = useState(!!defaultOpen);
  return (
    <div className={`rounded-lg border p-4 ${on ? "border-primary" : "border-border"}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <Switch checked={on} onCheckedChange={setOn} />
      </div>
      {on && (
        <div className="mt-3">
          <Label className="mb-1 block text-xs text-muted-foreground">Observações</Label>
          <Textarea placeholder="Digite as observações..." rows={2} />
        </div>
      )}
    </div>
  );
}
