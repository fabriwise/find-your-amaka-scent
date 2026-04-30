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
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-medium leading-[1.05] text-balance animate-float-up">
            Encontre sua versão{" "}
            <span className="font-sodo font-bold uppercase not-italic gold-text">AMAKHA PARIS</span>
          </h1>
        </div>

        <div className="animate-float-up" style={{ animationDelay: "0.2s" }}>
          <PerfumeSearch />
        </div>
      </section>

      <footer className="relative z-10 mt-20 border-t border-border/60">
        <div className="max-w-6xl mx-auto px-6 py-8 flex items-center justify-between flex-wrap gap-3 text-xs text-muted-foreground">
          <div className="font-display italic">Amakha Paris · 2026</div>
        </div>
      </footer>
    </main>
  );
};

export default Index;
