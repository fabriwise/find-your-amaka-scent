import { PerfumeSearch } from "@/components/PerfumeSearch";

const Index = () => {
  return (
    <main className="min-h-screen ivory-bg relative overflow-hidden">
      {/* decorative gold orbs */}
      <div className="pointer-events-none absolute -top-40 -right-40 h-96 w-96 rounded-full bg-gold/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-gold-deep/15 blur-[120px]" />

      <header className="relative z-10 px-6 py-6 flex items-center justify-between max-w-6xl mx-auto">
        <div className="font-display text-xl tracking-wide">
          <span className="font-semibold">Amakha</span>{" "}
          <span className="italic text-gold-deep">Reference</span>
        </div>
        <div className="hidden sm:block text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
          Pesquisa olfativa
        </div>
      </header>

      <section className="relative z-10 px-6 pt-12 md:pt-20 pb-12">
        <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-gold-deep mb-6 animate-fade-in">
            <span className="h-px w-8 bg-gold-deep/60" />
            Paris · Inspiração olfativa
            <span className="h-px w-8 bg-gold-deep/60" />
          </div>
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-medium leading-[1.05] text-balance animate-float-up">
            Encontre sua versão{" "}
            <span className="italic gold-text">Amakha Paris</span>
          </h1>
          <p className="mt-6 text-base md:text-lg text-muted-foreground font-light max-w-xl mx-auto text-balance animate-float-up" style={{ animationDelay: "0.1s" }}>
            Diga qual perfume importado você ama e descubra a fragrância Amakha Paris que carrega a mesma assinatura olfativa.
          </p>
        </div>

        <div className="animate-float-up" style={{ animationDelay: "0.2s" }}>
          <PerfumeSearch />
        </div>
      </section>

      <footer className="relative z-10 mt-20 border-t border-border/60">
        <div className="max-w-6xl mx-auto px-6 py-8 flex items-center justify-between flex-wrap gap-3 text-xs text-muted-foreground">
          <div className="font-display italic">Amakha Reference · 2026</div>
          <div className="tracking-wider uppercase">Catálogo abril/2026</div>
        </div>
      </footer>
    </main>
  );
};

export default Index;
