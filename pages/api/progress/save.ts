import type { NextApiRequest, NextApiResponse } from "next";

import type { LearnerProgress } from "@/features/progress/types";

// Minimal D1 binding type (same as load.ts, avoids any Cloudflare SDK dep).
type D1Database = {
  prepare: (query: string) => {
    bind: (...values: unknown[]) => {
      run: () => Promise<void>;
    };
  };
};

type RequestBody = {
  userId: string;
  progress: LearnerProgress;
};

type ResponseBody = { ok: true } | { error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseBody>
): Promise<void> {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const body = req.body as Partial<RequestBody>;
  const { userId, progress } = body;

  if (!userId || typeof userId !== "string" || userId.trim() === "") {
    res.status(400).json({ error: "Missing or invalid userId" });
    return;
  }

  if (!progress || typeof progress !== "object") {
    res.status(400).json({ error: "Missing or invalid progress payload" });
    return;
  }

  // Access the D1 binding injected by Cloudflare Workers / Pages runtime.
  // Falls through silently during local Next.js dev (no D1 available).
  const db = (process.env as unknown as Record<string, D1Database | undefined>).DB;

  if (!db) {
    // Local dev fallback — acknowledge without persisting
    res.status(200).json({ ok: true });
    return;
  }

  try {
    await db
      .prepare(
        `INSERT INTO learner_progress
           (user_id, nickname, xp, badges, completed_mission_ids,
            streak_days, last_active_date, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
         ON CONFLICT(user_id) DO UPDATE SET
           nickname              = excluded.nickname,
           xp                    = excluded.xp,
           badges                = excluded.badges,
           completed_mission_ids = excluded.completed_mission_ids,
           streak_days           = excluded.streak_days,
           last_active_date      = excluded.last_active_date,
           updated_at            = excluded.updated_at`
      )
      .bind(
        userId,
        progress.profile?.nickname ?? null,
        progress.xp,
        JSON.stringify(progress.badges),
        JSON.stringify(progress.completedMissionIds),
        progress.streakDays,
        progress.lastActiveDate ?? null
      )
      .run();

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("[progress/save] D1 query failed:", err);
    res.status(500).json({ error: "Database error" });
  }
}
