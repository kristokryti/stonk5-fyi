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
    <main className="mx-auto max-w-3xl px-4 py-10 sm:py-16">
      <Dashboard initialStats={initialStats} />
    </main>
  );
}
