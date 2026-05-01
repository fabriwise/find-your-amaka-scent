import { PerfumeSearch } from "@/components/PerfumeSearch";
const Index = () => {
  return (
    <main className="min-h-screen ivory-bg relative overflow-x-hidden">
      {/* decorative gold orbs */}
      <div className="pointer-events-none absolute -top-40 -right-40 h-96 w-96 rounded-full bg-gold/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-gold-deep/15 blur-[120px]" />
      <header className="relative z-10 px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 max-w-6xl mx-auto">
        <div className="font-display text-lg sm:text-xl tracking-wide text-center sm:text-left">
          <span className="font-semibold">Amakha</span>{" "}
          <span className="italic text-gold-deep">Reference</span>
        </div>
        <div className="text-[10px] sm:text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
          Pesquisa olfativa
        </div>
      </header>
      <section className="relative z-10 px-4 sm:px-6 pt-12 md:pt-20 pb-40">
        <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
          <h1 className="font-display text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-medium leading-[1.1] text-balance animate-float-up">
            Encontre sua versão{" "}
            <span className="font-sodo font-bold uppercase not-italic gold-text">
              AMAKHA PARIS
            </span>
          </h1>
        </div>
        <div>
          <PerfumeSearch />
        </div>
      </section>
      <footer className="relative z-10 border-t border-border/60">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground text-center sm:text-left">
          <div className="font-display italic">Amakha Paris · 2026</div>
        </div>
      </footer>
    </main>
  );
};
export default Index;
