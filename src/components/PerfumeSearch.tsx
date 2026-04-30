import { useMemo, useRef, useState, useEffect } from "react";
import { Search, X, Sparkles } from "lucide-react";
import { perfumes, type Perfume } from "@/data/perfumes";
import { PerfumeResult } from "./PerfumeResult";

// Sinônimos comuns: número escrito ↔ algarismo
const SYNONYMS: Record<string, string> = {
  "1": "one", um: "one",
  "2": "two", dois: "two",
  "3": "three", tres: "three",
  milion: "million", milhon: "million", milhao: "million", milhoes: "million",
};

const normalize = (s: string) =>
  s.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map(t => SYNONYMS[t] ?? t)
    .join(" ");

// Stopwords/marcas comuns que não devem dominar o match
const STOP = new Set([
  "de", "da", "do", "the", "le", "la", "for", "by", "and",
  "men", "man", "women", "woman", "homme", "femme", "her", "him", "pour",
  "edp", "edt", "eau", "parfum", "perfume",
]);

// Levenshtein distance (iterativo)
function lev(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const m = a.length, n = b.length;
  let prev = new Array(n + 1);
  let curr = new Array(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
      curr[j] = Math.min(
        curr[j - 1] + 1,
        prev[j] + 1,
        prev[j - 1] + cost
      );
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

// Tolerância em função do tamanho do token (mais permissiva)
// 3 chars => 1 erro, 4-5 => 2, 6-8 => 3, >8 => 4
function maxErrors(len: number): number {
  if (len <= 2) return 0;
  if (len <= 3) return 1;
  if (len <= 5) return 2;
  if (len <= 8) return 3;
  return 4;
}

// Pontua um token da query contra os tokens do alvo (retorna melhor pontuação)
function tokenScore(qt: string, tTokens: string[]): number {
  let best = 0;
  for (const tt of tTokens) {
    if (!tt) continue;
    if (tt === qt) { best = Math.max(best, 100); continue; }
    if (tt.startsWith(qt)) { best = Math.max(best, 80); continue; }
    if (qt.length >= 3 && tt.includes(qt)) { best = Math.max(best, 55); continue; }
    // fuzzy: comparar com o token inteiro (mais tolerante)
    if (qt.length >= 3) {
      const tol = maxErrors(Math.max(qt.length, tt.length));
      if (Math.abs(tt.length - qt.length) <= tol) {
        const d = lev(qt, tt);
        if (d <= tol) {
          best = Math.max(best, 78 - d * 8);
          continue;
        }
      }
      // fuzzy prefixo: comparar com o início do token alvo
      if (tt.length > qt.length) {
        const slice = tt.slice(0, qt.length);
        const d = lev(qt, slice);
        if (d <= maxErrors(qt.length)) {
          best = Math.max(best, 68 - d * 8);
        }
      }
      // fuzzy substring: procurar a melhor janela do tamanho da query dentro do token
      if (tt.length > qt.length + 1) {
        const tol = maxErrors(qt.length);
        for (let i = 0; i <= tt.length - qt.length; i++) {
          const slice = tt.slice(i, i + qt.length);
          const d = lev(qt, slice);
          if (d <= tol) {
            best = Math.max(best, 60 - d * 8);
            break;
          }
        }
      }
    }
  }
  return best;
}

function score(query: string, perfume: Perfume): number {
  const q = normalize(query);
  if (!q) return 0;
  const target = normalize(perfume.inspiracao);

  const qTokens = q.split(" ").filter(t => t.length > 0);
  const tTokens = target.split(" ").filter(t => t.length > 0);
  const meaningful = qTokens.filter(t => !STOP.has(t));

  // Boosts diretos
  if (target === q) return 10000;
  if (target.startsWith(q + " ") || target === q) return 5000;
  if (target.includes(" " + q + " ") || target.startsWith(q) || target.endsWith(" " + q)) return 3000;

  // Fuzzy sobre o nome inteiro sem espaços (ex.: "milhon" ~ "onemillion")
  const qJoined = q.replace(/\s+/g, "");
  const tJoined = target.replace(/\s+/g, "");
  if (qJoined.length >= 4 && tJoined.length >= qJoined.length) {
    const tol = maxErrors(qJoined.length);
    // tenta como substring fuzzy dentro do alvo
    for (let i = 0; i <= tJoined.length - qJoined.length; i++) {
      const slice = tJoined.slice(i, i + qJoined.length);
      const d = lev(qJoined, slice);
      if (d <= tol) {
        return 2200 - d * 50 - i;
      }
    }
  }

  // Uma palavra digitada deve encontrar essa palavra em qualquer posição do nome
  // Ex: "Girl" encontra "Very Good Girl", "Good Girl" e "Poison Girl".
  if (meaningful.length === 1) {
    const qt = meaningful[0];
    if (tTokens.includes(qt)) return 2500 + Math.max(0, 80 - target.length);
    if (tTokens.some(tt => tokenScore(qt, [tt]) >= 70)) return 2300 + Math.max(0, 60 - target.length);
    if (qt.length >= 3 && tTokens.some(tt => tt.includes(qt))) return 1800;
  }

  // Match por tokens com fuzzy
  let total = 0;
  let strongHits = 0;
  let consideredTokens = 0;

  for (const qt of qTokens) {
    const isStop = STOP.has(qt);
    const weight = isStop ? 0.2 : 1;
    if (!isStop) consideredTokens++;
    const s = tokenScore(qt, tTokens);
    if (s >= 70 && !isStop) strongHits++;
    total += s * weight;
  }

  if (consideredTokens === 0) return 0;

  // Exige pelo menos 1 hit forte para queries multi-palavra significativas,
  // ou um hit razoável para query de 1 palavra
  if (meaningful.length >= 2 && strongHits === 0 && total < 100) {
    return 0;
  }
  if (total < 30) return 0;

  // Para query de 1 token, considere também todos os perfumes que contenham
  // esse token (mesmo que apareça depois no nome — ex: "girl" em "Very Good Girl")
  if (meaningful.length === 1 && strongHits >= 1) {
    total += 50; // pequeno boost para garantir inclusão acima do limiar
  }

  return total;
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
      .slice(0, 20)
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
            onBlur={() => setTimeout(() => setOpen(false), 500)}
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
          <div className="absolute z-20 mt-2 w-full bg-popover border border-border rounded-sm shadow-luxe animate-fade-in">
            <div className="px-5 py-3 text-xs uppercase tracking-[0.2em] text-muted-foreground border-b border-border bg-muted/40">
              {matches.length === 1 ? "1 inspiração encontrada" : `${matches.length} inspirações encontradas — escolha uma`}
            </div>
            <ul className="max-h-[300px] overflow-y-auto">
              {matches.map((p, i) => (
                <li key={p.inspiracao + p.amakha}>
                  <button
                    onClick={() => choose(p)}
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
