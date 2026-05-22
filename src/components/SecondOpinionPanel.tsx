import { useEffect, useRef, useState } from "react";
import { X, Stethoscope, Bot, Maximize2, Minimize2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";


type PanelKind = "second-opinion" | "chatbot";

const SYMPTOM_OPTIONS = ["Ardência/queimação", "Formigamento/dormência", "Dor", "Outra"];
const TREATMENT_OPTIONS = [
  "Medicamentoso tópico",
  "Medicamentoso sistêmico",
  "Cirúrgico",
  "Práticas Integrativas Complementares",
  "Outros",
];
const FUND_LESION = ["Mancha", "Placa", "Nódulo/tumefação ou aumento de volume", "Estrias", "Verrucosidade/vegetação", "Úlcera (mais profunda)", "Outra"];
const COLOR_OPTIONS = [
  "Semelhante à mucosa normal",
  "Branca homogênea",
  "Vermelha homogênea",
  "Heterogênea (branca e vermelha)",
  "Amarelada",
  "Azulada",
  "Acinzentada",
  "Escurecida",
  "Outra",
];

const SIZE_OPTIONS: { label: string; hint: string }[] = [
  { label: "Menor que 0,5 cm", hint: "Igual ou menor ao tamanho de uma cabeça de alfinete comum." },
  { label: "Entre 0,5 e 3,0 cm", hint: "Varia entre o tamanho de um grão de feijão (1 cm) a o de uma moeda de 1 real (2,7 cm)." },
  { label: "Maior que 3,0 cm", hint: "A partir do tamanho de uma tampa de garrafa PET." },
];

type ResizeDir = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

function getFinalButtonMinBottom(defaultBottom = 24, spacing = 16) {
  if (typeof window === "undefined") return defaultBottom;
  const btn = document.getElementById("finalizar-consulta");
  if (!btn) return defaultBottom;
  const rect = btn.getBoundingClientRect();
  const distanceFromBtnTopToViewportBottom = window.innerHeight - rect.top;
  return Math.max(defaultBottom, distanceFromBtnTopToViewportBottom + spacing);
}

function FloatingPanel({
  kind,
  onClose,
  availableRegions,
}: {
  kind: PanelKind;
  onClose: () => void;
  availableRegions: string[];
}) {
  const [size, setSize] = useState(() => ({ w: kind === "second-opinion" ? 320 : 480, h: kind === "second-opinion" ? 360 : 560 }));
  const [pos, setPos] = useState<{ right: number; bottom: number }>({ right: 24, bottom: 96 });
  const [requestSecond, setRequestSecond] = useState<"sim" | "nao" | "">("");
  const [fullscreen, setFullscreen] = useState(false);

  const startResize = (dir: ResizeDir) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const start = { x: e.clientX, y: e.clientY, w: size.w, h: size.h, right: pos.right, bottom: pos.bottom };
    const onMove = (ev: MouseEvent) => {
      const dx = ev.clientX - start.x;
      const dy = ev.clientY - start.y;
      let { w, h, right, bottom } = start;
      if (dir.includes("e")) { w = start.w + dx; right = start.right - dx; }
      if (dir.includes("w")) { w = start.w - dx; /* keep right fixed when dragging left edge */ }
      if (dir.includes("s")) h = start.h + dy;
      if (dir.includes("n")) { h = start.h - dy; /* keep bottom fixed so panel height decreases instead of moving down */ }
      const minW = isSO ? 160 : 120;
      const minH = isSO ? 220 : 120;
      w = Math.max(minW, Math.min(window.innerWidth - 40, w));
      h = Math.max(minH, Math.min(window.innerHeight - 40, h));
      right = Math.max(8, right);
      const minBottom = getFinalButtonMinBottom(24, 16);
      bottom = Math.max(minBottom, bottom);
      setSize({ w, h });
      setPos({ right, bottom });
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  // Ensure panel doesn't overlap the Finalizar button on open/resize/scroll
  useEffect(() => {
    const update = () => {
      setPos((p) => ({ ...p, bottom: Math.max(p.bottom, getFinalButtonMinBottom(24, 16)) }));
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update as any);
    };
  }, []);

  const isSO = kind === "second-opinion";

  return (
    <div
      className={`fixed z-50 flex flex-col border border-border bg-card shadow-2xl ${
        fullscreen ? "inset-0 rounded-none" : "rounded-2xl"
      }`}
      style={
        fullscreen
          ? undefined
          : { width: size.w, height: size.h, right: pos.right, bottom: pos.bottom }
      }
    >
      <div
        className={`flex items-center justify-between px-4 py-3 text-primary-foreground ${
          fullscreen ? "" : "rounded-t-2xl"
        } ${
          isSO ? "bg-gradient-to-r from-primary to-[oklch(0.5_0.2_330)]" : "bg-primary"
        }`}
      >
        <div className="flex items-center gap-2">
          {isSO ? <Stethoscope className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
          <div className="leading-tight">
            <h3 className="text-sm font-bold">
              {isSO ? "Solicitar Segunda Opinião" : "Assistente SobreVidas"}
            </h3>
            {isSO && <p className="text-[11px] opacity-90">Recurso opcional</p>}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setFullscreen((f) => !f)}
            className="rounded-md p-1 hover:bg-white/15"
            aria-label={fullscreen ? "Sair da tela cheia" : "Tela cheia"}
            title={fullscreen ? "Sair da tela cheia" : "Tela cheia"}
          >
            {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
          <button
            onClick={onClose}
            className="rounded-md p-1 hover:bg-white/15"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4" data-so-scroll>
        {isSO ? (
          <SecondOpinionForm
            requestSecond={requestSecond}
            setRequestSecond={setRequestSecond}
            availableRegions={availableRegions}
          />
        ) : (
          <ChatbotPanel />
        )}
      </div>

      <div className="border-t border-border bg-muted/40 px-4 py-2 text-xs text-muted-foreground">
        {isSO
          ? "As informações desta solicitação serão enviadas ao especialista ao finalizar a consulta."
          : "Tire dúvidas sobre o sistema."}
      </div>

      {/* Resize handles - all 8 directions (disabled in fullscreen) */}
      {!fullscreen && (
        <>
      <div onMouseDown={startResize("n")} className="absolute -top-1 left-2 right-2 h-2 cursor-ns-resize" />
      <div onMouseDown={startResize("s")} className="absolute -bottom-1 left-2 right-2 h-2 cursor-ns-resize" />
      <div onMouseDown={startResize("e")} className="absolute -right-1 top-2 bottom-2 w-2 cursor-ew-resize" />
      <div onMouseDown={startResize("w")} className="absolute -left-1 top-2 bottom-2 w-2 cursor-ew-resize" />
      <div onMouseDown={startResize("ne")} className="absolute -top-1 -right-1 h-3 w-3 cursor-nesw-resize" />
      <div onMouseDown={startResize("nw")} className="absolute -top-1 -left-1 h-3 w-3 cursor-nwse-resize" />
      <div onMouseDown={startResize("sw")} className="absolute -bottom-1 -left-1 h-3 w-3 cursor-nesw-resize" />
      <div
        onMouseDown={startResize("se")}
        className="absolute bottom-0 right-0 h-4 w-4 cursor-nwse-resize"
        style={{
          background:
            "linear-gradient(135deg, transparent 50%, var(--color-muted-foreground) 50%, var(--color-muted-foreground) 60%, transparent 60%, transparent 70%, var(--color-muted-foreground) 70%, var(--color-muted-foreground) 80%, transparent 80%)",
          borderBottomRightRadius: "1rem",
        }}
      />
        </>
      )}
    </div>
  );
}

function ChatbotPanel() {
  return (
    <div className="space-y-3 text-sm">
      <div className="rounded-lg bg-muted p-3">
        Olá! Posso ajudar com dúvidas sobre o uso do sistema, fluxo de atendimento ou
        encaminhamentos. Em que posso te ajudar?
      </div>
      <Textarea placeholder="Escreva sua mensagem..." rows={3} />
    </div>
  );
}

function Field({
  label,
  children,
  required,
  tooltip,
}: {
  label: string;
  required?: boolean;
  tooltip?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium block pb-1">
        {label}
        {required && <span className="text-destructive"> *</span>}
        {tooltip && (
          <span
            title={tooltip}
            aria-label={tooltip}
            className="ml-1 inline-flex h-4 w-4 -translate-y-[1px] cursor-pointer items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary ring-1 ring-primary/30 hover:bg-primary/20"
          >
            ?
          </span>
        )}
      </Label>
      {children}
    </div>
  );
}

function RadioRow({
  value,
  onChange,
  options,
  name,
}: {
  value?: string;
  onChange?: (v: string) => void;
  options: string[];
  name: string;
}) {
  const [internal, setInternal] = useState<string>("");
  const isControlled = value !== undefined;
  const current = isControlled ? value : internal;
  const handleChange = (o: string) => {
    if (!isControlled) setInternal(o);
    onChange?.(o);
  };
  return (
    <div className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(140px,1fr))]">
      {options.map((o) => (
        <label
          key={o}
          className="flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm cursor-pointer hover:bg-muted"
        >
          <input
            type="radio"
            name={name}
            checked={current === o}
            onChange={() => handleChange(o)}
          />
          <span>{o}</span>
        </label>
      ))}
    </div>
  );
}

function CheckRow({
  options,
  value,
  onChange,
}: {
  options: string[];
  value?: string[];
  onChange?: (next: string[]) => void;
}) {
  const [internal, setInternal] = useState<string[]>([]);
  const isControlled = value !== undefined;
  const selected = isControlled ? value : internal;
  const toggle = (o: string) => {
    const next = selected.includes(o) ? selected.filter((x) => x !== o) : [...selected, o];
    if (!isControlled) setInternal(next);
    onChange?.(next);
  };
  return (
    <div className="grid gap-2 grid-cols-[repeat(auto-fit,minmax(160px,1fr))]">
      {options.map((o) => (
        <label
          key={o}
          className="flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm cursor-pointer hover:bg-muted"
        >
          <Checkbox
            checked={selected.includes(o)}
            onCheckedChange={() => toggle(o)}
          />
          <span>{o}</span>
        </label>
      ))}
    </div>
  );
}

function TempoLesao({
  valor,
  unidade,
  onChangeValor,
  onChangeUnidade,
}: {
  valor: string;
  unidade: string;
  onChangeValor: (v: string) => void;
  onChangeUnidade: (u: string) => void;
}) {
  return (
    <div className="flex items-stretch rounded-md border border-input bg-background overflow-hidden focus-within:ring-2 focus-within:ring-ring">
      <input
        type="number"
        min={0}
        value={valor}
        onChange={(e) => onChangeValor(e.target.value)}
        className="min-w-0 flex-1 bg-transparent px-3 py-1.5 text-sm outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        placeholder="Digite o tempo"
      />
      <select
        value={unidade}
        onChange={(e) => onChangeUnidade(e.target.value)}
        aria-label="Unidade de tempo"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23737373' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>\")",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 4px center",
        }}
        className="appearance-none border-l border-input bg-muted/40 pl-3 pr-6 py-1.5 text-sm outline-none cursor-pointer hover:bg-muted"
      >
        <option value="Dias">Dias</option>
        <option value="Meses">Meses</option>
        <option value="Anos">Anos</option>
      </select>
    </div>
  );
}

type LesionFormState = {
  lesao2sem: string;
  historico: string;
  causa: string;
  qualCausa: string;
  tempoValor: string;
  tempoUnidade: string;
  evolucao: string;
  sintoma: string;
  sintomasSelecionados: string[];
  escalaDor: number;
  tratamento: string;
  tratamentosSelecionados: string[];
  outrosTratamentos: string;
  lesaoFundamental: string;
  descLesaoFundamental: string;
  numeroLesoes: string[];
  tamanho: string;
  coresSelecionadas: string[];
  outrasCores: string;
  raspagem: string;
  duvida: string;
};

const emptyLesionFormState = (): LesionFormState => ({
  lesao2sem: "",
  historico: "",
  causa: "",
  qualCausa: "",
  tempoValor: "",
  tempoUnidade: "Dias",
  evolucao: "",
  sintoma: "",
  sintomasSelecionados: [],
  escalaDor: 0,
  tratamento: "",
  tratamentosSelecionados: [],
  outrosTratamentos: "",
  lesaoFundamental: "",
  descLesaoFundamental: "",
  numeroLesoes: [],
  tamanho: "",
  coresSelecionadas: [],
  outrasCores: "",
  raspagem: "",
  duvida: "",
});

const cloneLesionFormState = (s: LesionFormState): LesionFormState => ({
  ...s,
  sintomasSelecionados: [...s.sintomasSelecionados],
  tratamentosSelecionados: [...s.tratamentosSelecionados],
  numeroLesoes: [...s.numeroLesoes],
  coresSelecionadas: [...s.coresSelecionadas],
});

const isLesionFormDirty = (s?: LesionFormState): boolean => {
  if (!s) return false;
  if (s.escalaDor > 0) return true;
  if (s.tempoUnidade && s.tempoUnidade !== "Dias") return true;
  const strings: (keyof LesionFormState)[] = [
    "lesao2sem",
    "historico",
    "causa",
    "qualCausa",
    "tempoValor",
    "evolucao",
    "sintoma",
    "tratamento",
    "outrosTratamentos",
    "lesaoFundamental",
    "descLesaoFundamental",
    "tamanho",
    "outrasCores",
    "raspagem",
    "duvida",
  ];
  if (strings.some((k) => ((s[k] as string) ?? "").trim() !== "")) return true;
  const arrays: (keyof LesionFormState)[] = [
    "sintomasSelecionados",
    "tratamentosSelecionados",
    "numeroLesoes",
    "coresSelecionadas",
  ];
  if (arrays.some((k) => (s[k] as string[]).length > 0)) return true;
  return false;
};

function SecondOpinionForm({
  requestSecond,
  setRequestSecond,
  availableRegions,
}: {
  requestSecond: "sim" | "nao" | "";
  setRequestSecond: (v: "sim" | "nao") => void;
  availableRegions: string[];
}) {
  const [regionsForSO, setRegionsForSO] = useState<string[]>([]);
  const [formStates, setFormStates] = useState<Record<string, LesionFormState>>({});
  const [activeRegion, setActiveRegion] = useState<string>("");
  // Regiões em que o usuário já editou diretamente (deixam de espelhar a primeira).
  const [touchedRegions, setTouchedRegions] = useState<Set<string>>(new Set());

  // Sincroniza regiões selecionadas para SO com as disponíveis (sem pré-marcar)
  useEffect(() => {
    setRegionsForSO((prev) => prev.filter((r) => availableRegions.includes(r)));
  }, [availableRegions]);

  // Garante que a primeira região tenha estado e que a aba ativa seja válida
  useEffect(() => {
    if (regionsForSO.length === 0) {
      setActiveRegion("");
      return;
    }
    const first = regionsForSO[0];
    setFormStates((prev) => (prev[first] ? prev : { ...prev, [first]: emptyLesionFormState() }));
    if (!regionsForSO.includes(activeRegion)) {
      setActiveRegion(first);
    }
  }, [regionsForSO, activeRegion]);

  const toggleRegionForSO = (r: string) => {
    setRegionsForSO((prev) =>
      prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]
    );
  };

  const selectRegion = (r: string) => {
    setFormStates((prev) => {
      // Se a região destino j\u00e1 tem dados pr\u00f3prios, preserva.
      // Sen\u00e3o, semeia (ou re-semeia) com o estado atual da primeira regi\u00e3o.
      if (prev[r] && isLesionFormDirty(prev[r])) return prev;
      const first = regionsForSO[0];
      if (r === first) {
        return prev[r] ? prev : { ...prev, [r]: emptyLesionFormState() };
      }
      const template = prev[first] ?? emptyLesionFormState();
      return { ...prev, [r]: cloneLesionFormState(template) };
    });
    setActiveRegion(r);
  };

  const updateActiveForm = (next: LesionFormState) => {
    if (!activeRegion) return;
    const isEditingFirst = activeRegion === regionsForSO[0];
    setFormStates((prev) => {
      const updated: Record<string, LesionFormState> = { ...prev, [activeRegion]: next };
      // Enquanto o usuário edita a primeira região, espelha o estado para
      // todas as outras regiões que ainda não foram editadas diretamente.
      if (isEditingFirst) {
        for (const r of regionsForSO) {
          if (r === activeRegion) continue;
          if (touchedRegions.has(r)) continue;
          updated[r] = cloneLesionFormState(next);
        }
      }
      return updated;
    });
    if (!touchedRegions.has(activeRegion)) {
      setTouchedRegions((prev) => {
        if (prev.has(activeRegion)) return prev;
        const n = new Set(prev);
        n.add(activeRegion);
        return n;
      });
    }
  };

  const multipleRegions = regionsForSO.length > 1;
  const isFirstRegion = activeRegion === regionsForSO[0];
  const showForm = regionsForSO.length > 0 && !!activeRegion && !!formStates[activeRegion];
  const activeIndex = regionsForSO.indexOf(activeRegion);
  const nextRegion =
    activeIndex >= 0 && activeIndex < regionsForSO.length - 1
      ? regionsForSO[activeIndex + 1]
      : null;
  const prevRegion = activeIndex > 0 ? regionsForSO[activeIndex - 1] : null;

  const goToRegion = (r: string) => {
    selectRegion(r);
    // Rola o conteúdo do painel para mostrar o banner de pré-preenchimento (e o
    // menu de regiões logo acima), sem voltar até o início do formulário.
    requestAnimationFrame(() => {
      const scrollable = document.querySelector<HTMLElement>("[data-so-scroll]");
      if (!scrollable) return;
      const banner = scrollable.querySelector<HTMLElement>("[data-so-banner]");
      const tabs = scrollable.querySelector<HTMLElement>("[data-so-tabs]");
      const anchor = tabs ?? banner;
      if (anchor) {
        const scrollableRect = scrollable.getBoundingClientRect();
        const anchorRect = anchor.getBoundingClientRect();
        const offsetTop = anchorRect.top - scrollableRect.top + scrollable.scrollTop;
        scrollable.scrollTo({ top: Math.max(0, offsetTop - 8), behavior: "smooth" });
      } else {
        scrollable.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  };

  return (
    <div className="space-y-5">
      <Field label="Deseja solicitar segunda opinião de um especialista?">
        <div className="flex gap-3 w-full">
          {(["sim", "nao"] as const).map((v) => (
            <label key={v} className="flex flex-1 items-center gap-2 rounded-md border border-border px-4 py-2 text-sm cursor-pointer hover:bg-muted justify-start">
              <input
                type="radio"
                name="want-so"
                checked={requestSecond === v}
                onChange={() => setRequestSecond(v)}
              />
              <span>{v === "sim" ? "Sim" : "Não"}</span>
            </label>
          ))}
        </div>
      </Field>

      {requestSecond === "sim" && availableRegions.length === 0 && (
        <div className="rounded-md border border-dashed border-destructive/40 bg-destructive/5 p-3 text-xs text-foreground">
          Nenhuma região da boca foi selecionada na aba <strong>Avaliação Clínica</strong>.
          Volte e marque pelo menos uma região com lesão para prosseguir com a Segunda
          Opinião.
        </div>
      )}

      {requestSecond === "sim" && availableRegions.length > 0 && (
        <Field label="Qual região da boca você gostaria de solicitar segunda opinião?" required>
          <p className="-mt-3 pb-1 text-xs text-muted-foreground">
            Baseado nas regiões marcadas na aba Avaliação Clínica.
          </p>
          <div className="grid gap-2 grid-cols-[repeat(auto-fit,minmax(160px,1fr))]">
            {availableRegions.map((r) => {
              const checked = regionsForSO.includes(r);
              return (
                <label
                  key={r}
                  className={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm cursor-pointer hover:bg-muted ${
                    checked ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <Checkbox checked={checked} onCheckedChange={() => toggleRegionForSO(r)} />
                  <span>{r}</span>
                </label>
              );
            })}
          </div>
        </Field>
      )}

      {requestSecond === "sim" && showForm && (
        <div className="space-y-4">
          {multipleRegions && (
            <div
              role="tablist"
              aria-label="Regiões da segunda opinião"
              data-so-tabs
              className="-mx-4 flex w-[calc(100%+2rem)] border-b border-border"
            >
              {regionsForSO.map((r, idx) => {
                const isActive = r === activeRegion;
                return (
                  <button
                    key={r}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => goToRegion(r)}
                    className={`flex-1 break-words border-b-2 px-2 py-2 text-center text-xs font-medium leading-tight transition ${
                      isActive
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <span className="block text-[10px] font-normal uppercase tracking-wide opacity-70">
                      Região {idx + 1}
                    </span>
                    <span className="block">{r}</span>
                  </button>
                );
              })}
            </div>
          )}

          {multipleRegions && !isFirstRegion && isLesionFormDirty(formStates[regionsForSO[0]]) && (
            <div
              data-so-banner
              className="rounded-md border border-primary/30 bg-primary-soft/30 p-2 text-xs"
            >
              Os campos abaixo foram <strong>pré-preenchidos</strong> com as respostas de{" "}
              <strong>{regionsForSO[0]}</strong>. Edite o que for diferente para esta região.
            </div>
          )}

          <LesionFormFields
            value={formStates[activeRegion]}
            onChange={updateActiveForm}
            nextRegion={nextRegion}
            onGoToNext={nextRegion ? () => goToRegion(nextRegion) : undefined}
            prevRegion={prevRegion}
            onGoToPrev={prevRegion ? () => goToRegion(prevRegion) : undefined}
          />
        </div>
      )}
    </div>
  );
}

function LesionFormFields({
  value,
  onChange,
  nextRegion,
  onGoToNext,
  prevRegion,
  onGoToPrev,
}: {
  value: LesionFormState;
  onChange: (next: LesionFormState) => void;
  nextRegion?: string | null;
  onGoToNext?: () => void;
  prevRegion?: string | null;
  onGoToPrev?: () => void;
}) {
  const update = <K extends keyof LesionFormState>(key: K, v: LesionFormState[K]) =>
    onChange({ ...value, [key]: v });

  const handleNumeroLesoes = (next: string[]) => {
    // "Única" e "Múltiplas" são mutuamente exclusivas; ambas podem coexistir com "Distribuição bilateral".
    const prev = value.numeroLesoes;
    const added = next.find((o) => !prev.includes(o));
    let result = next;
    if (added === "Única") result = next.filter((o) => o !== "Múltiplas");
    else if (added === "Múltiplas") result = next.filter((o) => o !== "Única");
    update("numeroLesoes", result);
  };

  const toggleSintoma = (o: string) => {
    const next = value.sintomasSelecionados.includes(o)
      ? value.sintomasSelecionados.filter((x) => x !== o)
      : [...value.sintomasSelecionados, o];
    update("sintomasSelecionados", next);
  };

  return (
        <div className="space-y-8">
          {/* =============== 1. FATORES DE RISCO PRÉVIOS =============== */}
          <section className="space-y-4 pt-4">
            <h4 className="text-sm font-semibold uppercase tracking-wide text-primary">
              Fatores de risco prévios
            </h4>

            {/* Nível 2 [1..1] */}
            <Field label="Possui lesão(ões) na boca há mais de duas semanas?" required>
              <RadioRow
                name="lesao-2sem"
                value={value.lesao2sem}
                onChange={(v) => update("lesao2sem", v)}
                options={["Não", "Sim", "Não sei"]}
              />
            </Field>

            {/* Nível 3 [1..N] */}
            <Field
              label="Histórico da doença atual (para cada lesão)"
              required
              tooltip="Informações acerca do início da lesão (Onde, como, quando e porquê?); O que melhora? O que piora? Intervenções realizadas, etc."
            >
              <Textarea
                rows={3}
                placeholder="Digite aqui..."
                value={value.historico}
                onChange={(e) => update("historico", e.target.value)}
              />
            </Field>

            {/* Nível 4 [1..1] */}
            <Field label="Possui alguma causa associada à(s) lesão(ões)?" required>
              <RadioRow
                name="causa"
                value={value.causa}
                onChange={(v) => update("causa", v)}
                options={["Não", "Sim", "Não sei"]}
              />
            </Field>

            {/* Nível 4 [0..1] — condicional a "Sim" */}
            {value.causa === "Sim" && (
              <Field label="Qual a causa associada à(s) lesão(ões)?">
                <RadioRow
                  name="qual-causa"
                  value={value.qualCausa}
                  onChange={(v) => update("qualCausa", v)}
                  options={["Trauma químico", "Trauma mecânico", "Trauma físico"]}
                />
              </Field>
            )}

            {/* Nível 4 [0..1] */}
            <Field label="Há quanto tempo desta(s) lesão(ões)?">
              <TempoLesao
                valor={value.tempoValor}
                unidade={value.tempoUnidade}
                onChangeValor={(v) => update("tempoValor", v)}
                onChangeUnidade={(u) => update("tempoUnidade", u)}
              />
            </Field>

            {/* Nível 4 [0..1] */}
            <Field label="Evolução desta(s) lesão(ões)?">
              <RadioRow
                name="evol"
                value={value.evolucao}
                onChange={(v) => update("evolucao", v)}
                options={["Melhora", "Piora", "Estável", "Não sei informar"]}
              />
            </Field>

            {/* Nível 4 [0..1] */}
            <Field label="Paciente apresenta sintoma(s) relacionado à(s) lesão(ões)?">
              <RadioRow
                name="sint"
                value={value.sintoma}
                onChange={(v) => update("sintoma", v)}
                options={["Não", "Sim"]}
              />
              {value.sintoma === "Sim" && (
                <div className="pt-2 space-y-3">
                  <Label className="text-sm font-medium block pb-1">Qual?</Label>
                  <div className="grid gap-2 grid-cols-[repeat(auto-fit,minmax(160px,1fr))]">
                    {SYMPTOM_OPTIONS.map((o) => (
                      <label
                        key={o}
                        className="flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm cursor-pointer hover:bg-muted"
                      >
                        <Checkbox
                          checked={value.sintomasSelecionados.includes(o)}
                          onCheckedChange={() => toggleSintoma(o)}
                        />
                        <span>{o}</span>
                      </label>
                    ))}
                  </div>

                  {/* Nível 4 [0..1] — Escala EVA (condicional a "Dor") */}
                  {value.sintomasSelecionados.includes("Dor") && (
                    <div className="rounded-md border border-border bg-muted/40 p-3 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <Label className="text-xs font-medium">
                          Escala Visual Analógica (EVA)
                        </Label>
                        <span className="text-sm font-semibold tabular-nums">
                          {value.escalaDor} / 10
                        </span>
                      </div>
                      <div className="flex justify-between px-0.5 text-base leading-none" aria-hidden>
                        {["😀", "🙂", "😐", "😟", "😣", "😭"].map((face, i) => {
                          const v = i * 2;
                          const active = value.escalaDor >= v - 1 && value.escalaDor <= v + 1;
                          return (
                            <span
                              key={i}
                              className={`transition ${active ? "scale-125 opacity-100" : "opacity-40"}`}
                            >
                              {face}
                            </span>
                          );
                        })}
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={10}
                        step={1}
                        value={value.escalaDor}
                        onChange={(e) => update("escalaDor", Number(e.target.value))}
                        className="w-full accent-primary"
                      />
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>0 · sem dor</span>
                        <span>10 · pior dor imaginável</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Field>

            {/* Nível 4 [0..1] */}
            <Field label="Foi realizado algum tipo de tratamento para à(s) lesão(ões)?">
              <RadioRow
                name="trat"
                value={value.tratamento}
                onChange={(v) => update("tratamento", v)}
                options={["Não", "Sim", "Não sei"]}
              />
              {value.tratamento === "Sim" && (
                <div className="pt-2 space-y-3">
                  <Label className="text-sm font-medium block pb-1">
                    Qual o tratamento realizado?
                  </Label>
                  <CheckRow
                    options={TREATMENT_OPTIONS}
                    value={value.tratamentosSelecionados}
                    onChange={(v) => update("tratamentosSelecionados", v)}
                  />
                  {value.tratamentosSelecionados.includes("Outros") && (
                    <div className="pt-1">
                      <Label className="text-sm font-medium block pb-1">
                        Descreva o(s) outro(s) tratamento(s)
                      </Label>
                      <Textarea
                        rows={2}
                        placeholder="Digite aqui..."
                        value={value.outrosTratamentos}
                        onChange={(e) => update("outrosTratamentos", e.target.value)}
                      />
                    </div>
                  )}
                </div>
              )}
            </Field>
          </section>

          {/* =============== 2. APRESENTAÇÃO CLÍNICA DA LESÃO =============== */}
          <section className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wide text-primary">
              Apresentação Clínica da Lesão
            </h4>

            {/* Nível 2 [1..N] */}
            <Field label="Apresentação clínica da lesão (Lesão fundamental)" required>
              <div className="space-y-3">
                <div className="relative">
                  <select
                    value={value.lesaoFundamental}
                    onChange={(e) => update("lesaoFundamental", e.target.value)}
                    aria-label="Lesão fundamental"
                    style={{
                      backgroundImage:
                        "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23737373' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>\")",
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 8px center",
                    }}
                    className="w-full appearance-none rounded-md border border-input bg-background px-3 pr-8 py-2 text-sm outline-none cursor-pointer hover:bg-muted/30 focus:ring-2 focus:ring-ring"
                  >
                    <option value="" disabled>
                      Selecione uma opção
                    </option>
                    {FUND_LESION.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>
                {value.lesaoFundamental === "Outra" && (
                  <div>
                    <Label className="text-sm font-medium block pb-1">
                      Descreva a lesão fundamental
                    </Label>
                    <Textarea
                      rows={2}
                      placeholder="Digite aqui..."
                      value={value.descLesaoFundamental}
                      onChange={(e) => update("descLesaoFundamental", e.target.value)}
                    />
                  </div>
                )}
              </div>
            </Field>

            {/* Nível 3 [1..N] */}
            <Field label="Número de lesões" required>
              <CheckRow
                options={["Única", "Distribuição bilateral", "Múltiplas"]}
                value={value.numeroLesoes}
                onChange={handleNumeroLesoes}
              />
            </Field>

            {/* Nível 3 [1..1] — com tooltip por opção */}
            <Field label="Tamanho da lesão" required>
              <div className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(170px,1fr))]">
                {SIZE_OPTIONS.map((o) => (
                  <label
                    key={o.label}
                    className="flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm cursor-pointer hover:bg-muted"
                  >
                    <input
                      type="radio"
                      name="tam"
                      checked={value.tamanho === o.label}
                      onChange={() => update("tamanho", o.label)}
                    />
                    <span>{o.label}</span>
                    <span
                      title={o.hint}
                      aria-label={o.hint}
                      onClick={(e) => e.preventDefault()}
                      className="ml-1 inline-flex h-4 w-4 -translate-y-[1px] cursor-pointer items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary ring-1 ring-primary/30 hover:bg-primary/20"
                    >
                      ?
                    </span>
                  </label>
                ))}
              </div>
            </Field>

            {/* Nível 3 [1..N] */}
            <Field label="Cor da lesão" required>
              <div className="space-y-3">
                <CheckRow
                  options={COLOR_OPTIONS}
                  value={value.coresSelecionadas}
                  onChange={(v) => update("coresSelecionadas", v)}
                />
                {value.coresSelecionadas.includes("Outra") && (
                  <div>
                    <Label className="text-sm font-medium block pb-1">
                      Descreva a(s) outra(s) cor(es)
                    </Label>
                    <Textarea
                      rows={2}
                      placeholder="Digite aqui..."
                      value={value.outrasCores}
                      onChange={(e) => update("outrasCores", e.target.value)}
                    />
                  </div>
                )}
              </div>
            </Field>

            {/* Nível 3 [1..1] */}
            <Field label="Lesão removível à raspagem" required>
              <RadioRow
                name="rasp"
                value={value.raspagem}
                onChange={(v) => update("raspagem", v)}
                options={["Não", "Sim", "Não se aplica"]}
              />
            </Field>
          </section>

          {/* =============== 3. DÚVIDA AO ESPECIALISTA =============== */}
          <section className="space-y-2">
            <h4 className="text-sm font-semibold uppercase tracking-wide text-primary">
              Dúvida ao especialista
            </h4>
            <Label className="text-sm font-medium">
              Descreva a sua dúvida ao especialista <span className="text-destructive">*</span>
            </Label>
            <p className="text-xs text-muted-foreground">
              Informe de forma objetiva sua dúvida e as informações clínicas da lesão e do paciente.
            </p>
            <Textarea
              rows={5}
              placeholder="Descreva aqui..."
              className="placeholder:text-xs"
              value={value.duvida}
              onChange={(e) => update("duvida", e.target.value)}
            />
          </section>

          {(prevRegion || nextRegion) && (
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
              {prevRegion && onGoToPrev ? (
                <Button
                  type="button"
                  onClick={onGoToPrev}
                  className="group w-full sm:w-auto bg-primary whitespace-normal h-auto min-h-9 py-2 text-left leading-tight"
                >
                  <span className="flex w-full items-center gap-2.5">
                    <span
                      aria-hidden
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/25 transition-transform duration-200 group-hover:-translate-x-0.5 group-hover:bg-white/25"
                    >
                      <ChevronLeft className="h-4 w-4" strokeWidth={2.5} />
                    </span>
                    <span className="flex min-w-0 flex-col items-start">
                      <span className="text-[10px] font-normal uppercase tracking-wide opacity-80">
                        Região anterior
                      </span>
                      <span className="break-words text-sm font-semibold">{prevRegion}</span>
                    </span>
                  </span>
                </Button>
              ) : (
                <span aria-hidden />
              )}
              {nextRegion && onGoToNext && (
                <Button
                  type="button"
                  onClick={onGoToNext}
                  className="group w-full sm:w-auto bg-primary whitespace-normal h-auto min-h-9 py-2 text-left leading-tight"
                >
                  <span className="flex w-full items-center justify-between gap-2.5">
                    <span className="flex min-w-0 flex-col items-start">
                      <span className="text-[10px] font-normal uppercase tracking-wide opacity-80">
                        Próxima região
                      </span>
                      <span className="break-words text-sm font-semibold">{nextRegion}</span>
                    </span>
                    <span
                      aria-hidden
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/25 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:bg-white/25"
                    >
                      <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
                    </span>
                  </span>
                </Button>
              )}
            </div>
          )}
        </div>
  );
}

export function FloatingAssistants({
  availableRegions = [],
}: {
  availableRegions?: string[];
}) {
  const [open, setOpen] = useState<PanelKind | null>(null);

  // close on Esc
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Keep floating buttons above the "Finalizar consulta" button.
  const [floatBottom, setFloatBottom] = useState(24);
  useEffect(() => {
    const spacing = 16; // gap above the final button
    const defaultBottom = 24;
    const update = () => {
      const btn = document.getElementById("finalizar-consulta");
      if (!btn) {
        setFloatBottom(defaultBottom);
        return;
      }
      const rect = btn.getBoundingClientRect();
      // distance from button top to viewport bottom
      const distanceFromBtnTopToViewportBottom = window.innerHeight - rect.top;
      if (distanceFromBtnTopToViewportBottom > 0) {
        // ensure floating buttons sit above the button with some spacing
        setFloatBottom(Math.max(defaultBottom, distanceFromBtnTopToViewportBottom + spacing));
      } else {
        setFloatBottom(defaultBottom);
      }
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update as any);
      window.removeEventListener("resize", update as any);
    };
  }, []);

  return (
    <>
      {open && (
        <FloatingPanel
          kind={open}
          onClose={() => setOpen(null)}
          availableRegions={availableRegions}
        />
      )}

      <div className="fixed z-40 flex flex-col items-end gap-3" style={{ bottom: floatBottom, right: 24 }}>
        <button
          type="button"
          disabled
          aria-disabled="true"
          tabIndex={-1}
          aria-label="Assistente SobreVidas (indisponível)"
          title="Assistente SobreVidas"
          className="flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg pointer-events-none opacity-60 cursor-not-allowed"
          style={{
            background: "linear-gradient(135deg, oklch(0.55 0.22 30), oklch(0.45 0.20 300))",
          }}
        >
          <Bot className="h-6 w-6" />
        </button>

        <button
          onClick={() => setOpen("second-opinion")}
          aria-label="Solicitar segunda opinião de um especialista"
          title="Solicitar Segunda Opinião"
          className="flex items-center gap-3 rounded-full bg-primary py-3 pl-3 pr-5 text-primary-foreground shadow-xl transition hover:scale-105 hover:bg-primary/90"
        >
          <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
            <Stethoscope className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[oklch(0.82_0.18_75)] px-1 text-[10px] font-bold text-foreground">
              2ª
            </span>
          </span>
          <span className="text-left text-sm font-semibold leading-tight">
            Segunda Opinião
            <span className="block text-[10px] font-normal opacity-85">
              Consultar especialista
            </span>
          </span>
        </button>
      </div>
    </>
  );
}
