import { getInitialStats } from "@/lib/getInitialStats";
import PageShell from "@/components/PageShell";
import MarketBento from "@/components/MarketBento";
import Chart from "@/components/Chart";
import CopyAddress from "@/components/CopyAddress";

export const revalidate = 0;

export default async function MarketPage() {
  const initialStats = await getInitialStats();

  return (
    <PageShell initialStats={initialStats}>
      <div className="pt-12" />
      <MarketBento />
      <section className="wrap mt-16 sm:mt-22">
        <Chart />
      </section>
      <section className="wrap mt-16 sm:mt-22">
        <CopyAddress />
      </section>
    </PageShell>
  );
}
