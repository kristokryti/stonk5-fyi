import { getInitialStats } from "@/lib/getInitialStats";
import PageShell from "@/components/PageShell";
import Hero from "@/components/Hero";
import PayoutCard from "@/components/PayoutCard";
import MarketBento from "@/components/MarketBento";
import HowItWorks from "@/components/HowItWorks";
import BuybackBurn from "@/components/BuybackBurn";
import SafetyCard from "@/components/SafetyCard";
import Chart from "@/components/Chart";
import CopyAddress from "@/components/CopyAddress";

export const revalidate = 0;

export default async function Home() {
  const initialStats = await getInitialStats();

  return (
    <PageShell initialStats={initialStats}>
      <Hero />
      <PayoutCard />
      <MarketBento />
      <HowItWorks />
      <BuybackBurn />
      <section className="wrap mt-16 sm:mt-22">
        <Chart />
      </section>
      <section className="wrap mt-16 sm:mt-22">
        <CopyAddress />
      </section>
      <SafetyCard />
    </PageShell>
  );
}
