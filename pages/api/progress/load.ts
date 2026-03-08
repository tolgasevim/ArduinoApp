import type { NextRequest } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";

import { getDefaultProgress } from "@/features/progress/engine";
import type { LearnerProgress } from "@/features/progress/types";

export const runtime = "edge";

// Cloudflare D1 binding injected at runtime.
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

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

export default async function handler(req: NextRequest): Promise<Response> {
  if (req.method !== "GET") {
    return new Response(null, { status: 405, headers: { Allow: "GET" } });
  }

  const userId = new URL(req.url).searchParams.get("userId");

  if (!userId || userId.trim() === "") {
    return json({ error: "Missing or invalid userId query parameter" }, 400);
  }

  // Access D1 via Cloudflare edge context; falls back gracefully in local dev.
  let db: D1Database | undefined;
  try {
    db = (getRequestContext().env as Record<string, D1Database | undefined>).DB;
  } catch {
    // Local Next.js dev — getRequestContext is not available
  }

  if (!db) {
    return json(getDefaultProgress());
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

    return json(row ? rowToProgress(row) : getDefaultProgress());
  } catch (err) {
    console.error("[progress/load] D1 query failed:", err);
    return json({ error: "Database error" }, 500);
  }
}
