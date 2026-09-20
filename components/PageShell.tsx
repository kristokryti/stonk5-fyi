import type { TokenStats } from "@/lib/types";
import { StatsProvider } from "@/lib/statsContext";
import AuroraBackground from "./AuroraBackground";
import Nav from "./Nav";
import LiveStatusBanner from "./LiveStatusBanner";
import Footer from "./Footer";

export default function PageShell({
  initialStats,
  children,
}: {
  initialStats: TokenStats | null;
  children: React.ReactNode;
}) {
  return (
    <StatsProvider initialStats={initialStats}>
      <AuroraBackground />
      <Nav />
      <main>
        <LiveStatusBanner />
        {children}
      </main>
      <Footer />
    </StatsProvider>
  );
}
