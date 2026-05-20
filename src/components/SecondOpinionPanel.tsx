import { useEffect, useRef, useState } from "react";
import { X, Stethoscope, Bot, Maximize2, Minimize2 } from "lucide-react";
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
}: {
  kind: PanelKind;
  onClose: () => void;
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

      <div className="flex-1 overflow-y-auto p-4">
        {isSO ? (
          <SecondOpinionForm requestSecond={requestSecond} setRequestSecond={setRequestSecond} />
        ) : (
          <ChatbotPanel />
        )}
      </div>

      <div className="border-t border-border bg-muted/40 px-4 py-2 text-xs text-muted-foreground">
        {isSO
          ? "Será enviado ao especialista ao finalizar a consulta."
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

function TempoLesao() {
  const [unidade, setUnidade] = useState<string>("Dias");
  const [valor, setValor] = useState<string>("");
  return (
    <div className="flex items-stretch rounded-md border border-input bg-background overflow-hidden focus-within:ring-2 focus-within:ring-ring">
      <input
        type="number"
        min={0}
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        className="min-w-0 flex-1 bg-transparent px-3 py-1.5 text-sm outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        placeholder="Digite o tempo"
      />
      <select
        value={unidade}
        onChange={(e) => setUnidade(e.target.value)}
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

function SecondOpinionForm({
  requestSecond,
  setRequestSecond,
}: {
  requestSecond: "sim" | "nao" | "";
  setRequestSecond: (v: "sim" | "nao") => void;
}) {
  const [causa, setCausa] = useState("");
  const [sintoma, setSintoma] = useState("");
  const [sintomasSelecionados, setSintomasSelecionados] = useState<string[]>([]);
  const [escalaDor, setEscalaDor] = useState<number>(0);
  const [tratamento, setTratamento] = useState("");
  const [tratamentosSelecionados, setTratamentosSelecionados] = useState<string[]>([]);
  const [lesaoFundamental, setLesaoFundamental] = useState<string>("");
  const [numeroLesoes, setNumeroLesoes] = useState<string[]>([]);
  const [coresSelecionadas, setCoresSelecionadas] = useState<string[]>([]);

  const handleNumeroLesoes = (next: string[]) => {
    // "Única" e "Múltiplas" são mutuamente exclusivas; ambas podem coexistir com "Distribuição bilateral".
    const prev = numeroLesoes;
    const added = next.find((o) => !prev.includes(o));
    let result = next;
    if (added === "Única") result = next.filter((o) => o !== "Múltiplas");
    else if (added === "Múltiplas") result = next.filter((o) => o !== "Única");
    setNumeroLesoes(result);
  };

  const toggleSintoma = (o: string) =>
    setSintomasSelecionados((prev) =>
      prev.includes(o) ? prev.filter((x) => x !== o) : [...prev, o]
    );

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

      {requestSecond === "sim" && (
        <div className="space-y-8">
          {/* =============== 1. FATORES DE RISCO PRÉVIOS =============== */}
          <section className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wide text-primary">
              Fatores de risco prévios
            </h4>

            {/* Nível 2 [1..1] */}
            <Field label="Possui lesão(ões) na boca há mais de duas semanas?" required>
              <RadioRow name="lesao-2sem" options={["Não", "Sim", "Não sei"]} />
            </Field>

            {/* Nível 3 [1..N] */}
            <Field
              label="Histórico da doença atual (para cada lesão)"
              required
              tooltip="Informações acerca do início da lesão (Onde, como, quando e porquê?); O que melhora? O que piora? Intervenções realizadas, etc."
            >
              <Textarea rows={3} placeholder="Digite aqui..." />
            </Field>

            {/* Nível 4 [1..1] */}
            <Field label="Possui alguma causa associada à(s) lesão(ões)?" required>
              <RadioRow name="causa" value={causa} onChange={setCausa} options={["Não", "Sim", "Não sei"]} />
            </Field>

            {/* Nível 4 [0..1] — condicional a "Sim" */}
            {causa === "Sim" && (
              <Field label="Qual a causa associada à(s) lesão(ões)?">
                <RadioRow
                  name="qual-causa"
                  options={["Trauma químico", "Trauma mecânico", "Trauma físico"]}
                />
              </Field>
            )}

            {/* Nível 4 [0..1] */}
            <Field label="Há quanto tempo desta(s) lesão(ões)?">
              <TempoLesao />
            </Field>

            {/* Nível 4 [0..1] */}
            <Field label="Evolução desta(s) lesão(ões)?">
              <RadioRow name="evol" options={["Melhora", "Piora", "Estável", "Não sei informar"]} />
            </Field>

            {/* Nível 4 [0..1] */}
            <Field label="Paciente apresenta sintoma(s) relacionado à(s) lesão(ões)?">
              <RadioRow name="sint" value={sintoma} onChange={setSintoma} options={["Não", "Sim"]} />
              {sintoma === "Sim" && (
                <div className="pt-2 space-y-3">
                  <Label className="text-sm font-medium block pb-1">Qual?</Label>
                  <div className="grid gap-2 grid-cols-[repeat(auto-fit,minmax(160px,1fr))]">
                    {SYMPTOM_OPTIONS.map((o) => (
                      <label
                        key={o}
                        className="flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm cursor-pointer hover:bg-muted"
                      >
                        <Checkbox
                          checked={sintomasSelecionados.includes(o)}
                          onCheckedChange={() => toggleSintoma(o)}
                        />
                        <span>{o}</span>
                      </label>
                    ))}
                  </div>

                  {/* Nível 4 [0..1] — Escala de dor (condicional a "Dor") */}
                  {sintomasSelecionados.includes("Dor") && (
                    <div className="rounded-md border border-border bg-muted/40 p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-medium">Escala de dor</Label>
                        <span className="text-sm font-semibold tabular-nums">
                          {escalaDor} / 10
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={10}
                        step={1}
                        value={escalaDor}
                        onChange={(e) => setEscalaDor(Number(e.target.value))}
                        className="w-full accent-primary"
                      />
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>0 · sem dor</span>
                        <span>10 · dor máxima</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Field>

            {/* Nível 4 [0..1] */}
            <Field label="Foi realizado algum tipo de tratamento para à(s) lesão(ões)?">
              <RadioRow name="trat" value={tratamento} onChange={setTratamento} options={["Não", "Sim", "Não sei"]} />
              {tratamento === "Sim" && (
                <div className="pt-2 space-y-3">
                  <Label className="text-sm font-medium block pb-1">
                    Qual o tratamento realizado?
                  </Label>
                  <CheckRow
                    options={TREATMENT_OPTIONS}
                    value={tratamentosSelecionados}
                    onChange={setTratamentosSelecionados}
                  />
                  {tratamentosSelecionados.includes("Outros") && (
                    <div className="pt-1">
                      <Label className="text-sm font-medium block pb-1">
                        Descreva o(s) outro(s) tratamento(s)
                      </Label>
                      <Textarea rows={2} placeholder="Digite aqui..." />
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
                    value={lesaoFundamental}
                    onChange={(e) => setLesaoFundamental(e.target.value)}
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
                {lesaoFundamental === "Outra" && (
                  <div>
                    <Label className="text-sm font-medium block pb-1">
                      Descreva a lesão fundamental
                    </Label>
                    <Textarea rows={2} placeholder="Digite aqui..." />
                  </div>
                )}
              </div>
            </Field>

            {/* Nível 3 [1..N] */}
            <Field label="Número de lesões" required>
              <CheckRow
                options={["Única", "Distribuição bilateral", "Múltiplas"]}
                value={numeroLesoes}
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
                    <input type="radio" name="tam" />
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
                  value={coresSelecionadas}
                  onChange={setCoresSelecionadas}
                />
                {coresSelecionadas.includes("Outra") && (
                  <div>
                    <Label className="text-sm font-medium block pb-1">
                      Descreva a(s) outra(s) cor(es)
                    </Label>
                    <Textarea rows={2} placeholder="Digite aqui..." />
                  </div>
                )}
              </div>
            </Field>

            {/* Nível 3 [1..1] */}
            <Field label="Lesão removível à raspagem" required>
              <RadioRow name="rasp" options={["Não", "Sim", "Não se aplica"]} />
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
            <Textarea rows={5} placeholder="Descreva aqui..." className="placeholder:text-xs" />
          </section>

          <p className="rounded-md border border-dashed border-primary/40 bg-primary-soft/40 p-3 text-xs text-foreground">
            As informações desta solicitação serão enviadas ao especialista junto com o botão
            <strong> "Finalizar consulta"</strong> na aba Conduta.
          </p>
        </div>
      )}
    </div>
  );
}

export function FloatingAssistants() {
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
      {open && <FloatingPanel kind={open} onClose={() => setOpen(null)} />}

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
