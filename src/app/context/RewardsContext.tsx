import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";

export type RewardType = "badge" | "avatar_frame" | "offer";

export interface Reward {
  id: string;
  type: RewardType;
  key: string;
  name: string;
  description: string | null;
  cost: number;
  icon: string | null;
}

interface RewardsContextType {
  balance: number;
  rewards: Reward[];
  ownedRewardIds: Set<string>;
  loading: boolean;
  redeemReward: (rewardId: string) => Promise<{ error: string | null }>;
  refreshBalance: () => Promise<void>;
}

const RewardsContext = createContext<RewardsContextType | undefined>(undefined);

// Maps a Supabase `rewards` row to the frontend Reward shape.
function mapRewardRow(row: any): Reward {
  return {
    id: row.id,
    type: row.type,
    key: row.key,
    name: row.name,
    description: row.description ?? null,
    cost: row.cost,
    icon: row.icon ?? null,
  };
}

export function RewardsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [ownedRewardIds, setOwnedRewardIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Catalog is public — load once regardless of login state.
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("rewards")
        .select("*")
        .eq("active", true)
        .order("type")
        .order("cost");
      if (!error && data) setRewards(data.map(mapRewardRow));
    })();
  }, []);

  const refreshBalance = useCallback(async () => {
    if (!user) {
      setBalance(0);
      return;
    }
    const { data, error } = await supabase
      .from("user_points")
      .select("balance")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!error) setBalance(data?.balance ?? 0);
  }, [user]);

  const refreshOwned = useCallback(async () => {
    if (!user) {
      setOwnedRewardIds(new Set());
      return;
    }
    const { data, error } = await supabase
      .from("user_rewards")
      .select("reward_id")
      .eq("user_id", user.id);
    if (!error && data) setOwnedRewardIds(new Set(data.map((r) => r.reward_id as string)));
  }, [user]);

  // Balance and ownership are per-user — reload whenever login state changes.
  useEffect(() => {
    setLoading(true);
    Promise.all([refreshBalance(), refreshOwned()]).finally(() => setLoading(false));
  }, [refreshBalance, refreshOwned]);

  const redeemReward = useCallback(
    async (rewardId: string) => {
      const { error } = await supabase.rpc("redeem_reward", { p_reward_id: rewardId });
      if (error) {
        return { error: error.message };
      }
      await Promise.all([refreshBalance(), refreshOwned()]);
      return { error: null };
    },
    [refreshBalance, refreshOwned],
  );

  return (
    <RewardsContext.Provider
      value={{ balance, rewards, ownedRewardIds, loading, redeemReward, refreshBalance }}
    >
      {children}
    </RewardsContext.Provider>
  );
}

export const useRewards = () => {
  const context = useContext(RewardsContext);
  if (!context) throw new Error("useRewards must be used within RewardsProvider");
  return context;
};

// For viewing another user's public profile — not part of the provider's
// own state since it's a one-off lookup, not something the whole app needs.
export async function fetchUserBadges(userId: string): Promise<Reward[]> {
  const { data, error } = await supabase
    .from("user_rewards")
    .select("reward:rewards(id, type, key, name, description, cost, icon)")
    .eq("user_id", userId);
  if (error || !data) return [];
  return data
    .map((row: any) => row.reward)
    .filter((reward: any) => reward && reward.type === "badge")
    .map(mapRewardRow);
}
