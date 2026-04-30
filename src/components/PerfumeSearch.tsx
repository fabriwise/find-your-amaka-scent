import { useMemo, useRef, useState, useEffect } from "react";
import { Search, X, Sparkles } from "lucide-react";
import { perfumes, type Perfume } from "@/data/perfumes";
import { PerfumeResult } from "./PerfumeResult";

const normalize = (s: string) =>
  s.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

function score(query: string, perfume: Perfume): number {
  const q = normalize(query);
  if (!q) return 0;
  const target = normalize(perfume.inspiracao);
  if (target === q) return 1000;
  if (target.startsWith(q)) return 500 + (100 - Math.min(target.length, 100));
  if (target.includes(" " + q)) return 300;
  if (target.includes(q)) return 200;
  // token-based partial
  const qTokens = q.split(" ");
  const tTokens = target.split(" ");
  const hits = qTokens.filter(qt => qt.length > 1 && tTokens.some(tt => tt.startsWith(qt))).length;
  return hits > 0 ? 50 + hits * 10 : 0;
}

export const PerfumeSearch = () => {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Perfume | null>(null);
  const [highlight, setHighlight] = useState(0);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const matches = useMemo(() => {
    if (query.trim().length < 2) return [];
    return perfumes
      .map(p => ({ p, s: score(query, p) }))
      .filter(x => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 8)
      .map(x => x.p);
  }, [query]);

  useEffect(() => {
    setHighlight(0);
  }, [query]);

  const choose = (p: Perfume) => {
    setSelected(p);
    setQuery(p.inspiracao);
    setOpen(false);
    inputRef.current?.blur();
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (!open || matches.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight(h => Math.min(h + 1, matches.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight(h => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      choose(matches[highlight]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const reset = () => {
    setSelected(null);
    setQuery("");
    setOpen(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <label className="block text-center font-display text-2xl md:text-3xl text-foreground mb-6 text-balance">
        Qual é o perfume importado que você mais ama?
      </label>

      <div className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-5 h-5 w-5 text-muted-foreground pointer-events-none" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); setSelected(null); }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            onKeyDown={onKey}
            placeholder="Ex: 212 Vip, Acqua di Gio, Alien…"
            className="w-full pl-14 pr-12 py-5 bg-card border border-border rounded-sm text-base md:text-lg font-light placeholder:text-muted-foreground/60 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all shadow-soft"
            aria-label="Pesquisar perfume importado"
            autoComplete="off"
          />
          {query && (
            <button
              onClick={reset}
              className="absolute right-4 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Limpar"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {open && matches.length > 0 && !selected && (
          <div className="absolute z-20 mt-2 w-full bg-popover border border-border rounded-sm shadow-luxe overflow-hidden animate-fade-in">
            <div className="px-5 py-3 text-xs uppercase tracking-[0.2em] text-muted-foreground border-b border-border bg-muted/40">
              {matches.length === 1 ? "1 inspiração encontrada" : `${matches.length} inspirações encontradas — escolha uma`}
            </div>
            <ul className="max-h-80 overflow-y-auto">
              {matches.map((p, i) => (
                <li key={p.inspiracao + p.amakha}>
                  <button
                    onMouseDown={(e) => { e.preventDefault(); choose(p); }}
                    onMouseEnter={() => setHighlight(i)}
                    className={`w-full text-left px-5 py-3 flex items-center justify-between gap-4 transition-colors ${
                      i === highlight ? "bg-accent/15" : "hover:bg-muted/60"
                    }`}
                  >
                    <span className="font-display text-lg text-foreground">{p.inspiracao}</span>
                    <span className="text-xs uppercase tracking-widest text-gold-deep font-medium shrink-0">
                      {p.genero}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {open && query.trim().length >= 2 && matches.length === 0 && !selected && (
          <div className="absolute z-20 mt-2 w-full bg-popover border border-border rounded-sm shadow-soft px-5 py-6 text-center text-muted-foreground animate-fade-in">
            Nenhuma inspiração encontrada para <span className="italic">"{query}"</span>.
            <div className="text-xs mt-1">Tente parte do nome, como "212" ou "Acqua".</div>
          </div>
        )}
      </div>

      {!selected && !query && (
        <p className="mt-6 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-gold" />
          Mais de {perfumes.length} referências olfativas catalogadas
        </p>
      )}

      {selected && (
        <div className="mt-10 animate-float-up">
          <PerfumeResult perfume={selected} onReset={reset} />
        </div>
      )}
    </div>
  );
};
