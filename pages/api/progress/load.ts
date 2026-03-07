import type { NextApiRequest, NextApiResponse } from "next";

import { getDefaultProgress } from "@/features/progress/engine";
import type { LearnerProgress } from "@/features/progress/types";

// Cloudflare D1 binding injected at runtime. Typed minimally to keep the
// file dependency-free from any Cloudflare SDK package.
type D1Database = {
  prepare: (query: string) => {
    bind: (...values: unknown[]) => {
      first: <T>() => Promise<T | null>;
    };
  };
};

type ProgressRow = {
  user_id: string;
  nickname: string | null;
  xp: number;
  badges: string;
  completed_mission_ids: string;
  streak_days: number;
  last_active_date: string | null;
};

function rowToProgress(row: ProgressRow): LearnerProgress {
  return {
    profile: row.nickname ? { nickname: row.nickname } : null,
    xp: row.xp,
    badges: JSON.parse(row.badges) as string[],
    completedMissionIds: JSON.parse(row.completed_mission_ids) as string[],
    streakDays: row.streak_days,
    lastActiveDate: row.last_active_date
  };
}

type ResponseBody = LearnerProgress | { error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseBody>
): Promise<void> {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { userId } = req.query;

  if (!userId || typeof userId !== "string" || userId.trim() === "") {
    res.status(400).json({ error: "Missing or invalid userId query parameter" });
    return;
  }

  // Access the D1 binding injected by Cloudflare Workers / Pages runtime.
  // During local Next.js development (pnpm dev) DB will be undefined — fall
  // back to default progress so the app still works without a database.
  const db = (process.env as unknown as Record<string, D1Database | undefined>).DB;

  if (!db) {
    // Local dev fallback: no D1 binding available
    res.status(200).json(getDefaultProgress());
    return;
  }

  try {
    const row = await db
      .prepare(
        `SELECT user_id, nickname, xp, badges, completed_mission_ids,
                streak_days, last_active_date
         FROM   learner_progress
         WHERE  user_id = ?`
      )
      .bind(userId)
      .first<ProgressRow>();

    if (!row) {
      res.status(200).json(getDefaultProgress());
      return;
    }

    res.status(200).json(rowToProgress(row));
  } catch (err) {
    console.error("[progress/load] D1 query failed:", err);
    res.status(500).json({ error: "Database error" });
  }
}
