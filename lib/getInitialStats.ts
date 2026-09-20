import { getTokenStats } from "./fetchStats";
import type { TokenStats } from "./types";

export async function getInitialStats(): Promise<TokenStats | null> {
  try {
    return await getTokenStats();
  } catch {
    return null;
  }
}
