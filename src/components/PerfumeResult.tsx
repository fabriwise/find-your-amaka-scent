import { ArrowRight, RotateCcw, ExternalLink } from "lucide-react";
import type { Perfume } from "@/data/perfumes";

interface Props {
  perfume: Perfume;
  onReset: () => void;
}

const Detail = ({ label, value }: { label: string; value: string }) => {
  if (!value) return null;
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.25em] text-gold-deep mb-1">{label}</div>
      <div className="text-sm text-foreground/90 font-light leading-relaxed">{value}</div>
    </div>
  );
};

export const PerfumeResult = ({ perfume, onReset }: Props) => {
  return (
    <article className="relative bg-card border border-border rounded-sm shadow-luxe overflow-hidden">
      <div className="luxe-bg text-primary-foreground px-8 md:px-12 py-10 md:py-12 relative grain">
        <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-gold-soft mb-6">
          <span className="h-px w-8 bg-gold-soft/60" />
          A sua versão Amakha Paris
        </div>

        <div className="flex items-end justify-between gap-6 flex-wrap">
          <div>
            <div className="text-sm text-gold-soft/80 font-light mb-2">Inspirado em</div>
            <h3 className="font-display text-2xl md:text-3xl italic text-primary-foreground/90 mb-4">
              {perfume.inspiracao}
            </h3>
            <div className="flex items-center gap-3 text-gold-soft mb-3">
              <ArrowRight className="h-5 w-5" />
              <span className="text-xs uppercase tracking-[0.25em]">O seu perfume Amakha é o</span>
            </div>
            <h2 className="font-display text-5xl md:text-6xl font-semibold gold-text leading-none">
              {perfume.amakha}
            </h2>
            {perfume.link && (
              <div className="mt-5">
                <a
                  href={perfume.link}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gold-soft/10 border border-gold-soft/40 text-gold-soft hover:bg-gold-soft/20 hover:text-primary-foreground transition-colors text-xs uppercase tracking-[0.3em] rounded-sm"
                >
                  Ver página do perfume
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            )}
          </div>
          <div className="text-right space-y-1">
            <div className="text-[10px] uppercase tracking-[0.3em] text-gold-soft/80">{perfume.genero}</div>
            <div className="text-xs text-gold-soft font-light">{perfume.familia}</div>
          </div>
        </div>
      </div>

      <div className="px-8 md:px-12 py-8 grid sm:grid-cols-2 gap-6">
        <Detail label="Ocasião" value={perfume.ocasiao} />
        <Detail label="Perfil" value={perfume.perfil} />
        <Detail label="Estações" value={perfume.estacoes} />
        <Detail label="Dia ou Noite" value={perfume.diaNoite} />
      </div>

      {(perfume.notasTopo || perfume.notasCorpo || perfume.notasFundo) && (
        <div className="px-8 md:px-12 pb-10">
          <div className="text-xs uppercase tracking-[0.3em] text-gold-deep mb-5 flex items-center gap-3">
            <span className="h-px w-6 bg-gold/60" />
            Pirâmide olfativa
          </div>
          <div className="space-y-5">
            <Detail label="Notas de topo" value={perfume.notasTopo} />
            <Detail label="Notas de corpo" value={perfume.notasCorpo} />
            <Detail label="Notas de fundo" value={perfume.notasFundo} />
          </div>
        </div>
      )}

      <div className="px-8 md:px-12 py-6 border-t border-border bg-muted/30 flex items-center justify-between gap-4 flex-wrap">
        <p className="text-xs text-muted-foreground italic max-w-md">
          A Amakha Paris não fabrica nem comercializa as marcas citadas. Os nomes são apenas referências olfativas.
        </p>
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-gold-deep transition-colors"
        >
          <RotateCcw className="h-4 w-4" />
          Buscar outro perfume
        </button>
      </div>
    </article>
  );
};
