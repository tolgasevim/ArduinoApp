import type { NextRequest } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";

import type { LearnerProgress } from "@/features/progress/types";

export const runtime = "edge";

// Minimal D1 binding type (avoids any Cloudflare SDK dep).
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

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

export default async function handler(req: NextRequest): Promise<Response> {
  if (req.method !== "POST") {
    return new Response(null, { status: 405, headers: { Allow: "POST" } });
  }

  let body: Partial<RequestBody>;
  try {
    body = (await req.json()) as Partial<RequestBody>;
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const { userId, progress } = body;

  if (!userId || typeof userId !== "string" || userId.trim() === "") {
    return json({ error: "Missing or invalid userId" }, 400);
  }

  if (!progress || typeof progress !== "object") {
    return json({ error: "Missing or invalid progress payload" }, 400);
  }

  // Access D1 via Cloudflare edge context; falls back gracefully in local dev.
  let db: D1Database | undefined;
  try {
    db = (getRequestContext().env as Record<string, D1Database | undefined>).DB;
  } catch {
    // Local Next.js dev — getRequestContext is not available
  }

  if (!db) {
    // Local dev fallback — acknowledge without persisting
    return json({ ok: true });
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

    return json({ ok: true });
  } catch (err) {
    console.error("[progress/save] D1 query failed:", err);
    return json({ error: "Database error" }, 500);
  }
}
