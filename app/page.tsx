import { getTokenStats } from "@/lib/fetchStats";
import Dashboard from "@/components/Dashboard";

export const revalidate = 0;

export default async function Home() {
  let initialStats;
  try {
    initialStats = await getTokenStats();
  } catch {
    initialStats = null;
  }

  return (
    <main className="pb-16">
      <Dashboard initialStats={initialStats} />
    </main>
  );
}
