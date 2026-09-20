import { getInitialStats } from "@/lib/getInitialStats";
import PageShell from "@/components/PageShell";
import PayoutCard from "@/components/PayoutCard";
import HowItWorks from "@/components/HowItWorks";
import WhaleCap from "@/components/WhaleCap";
import PairedWithSol from "@/components/PairedWithSol";

export const revalidate = 0;

export default async function EnginePage() {
  const initialStats = await getInitialStats();

  return (
    <PageShell initialStats={initialStats}>
      <div className="pt-12" />
      <PayoutCard />
      <HowItWorks />
      <section className="wrap mt-16 sm:mt-22">
        <div className="two-grid">
          <WhaleCap />
          <PairedWithSol />
        </div>
      </section>
    </PageShell>
  );
}
