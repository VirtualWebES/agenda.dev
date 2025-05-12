import { auth } from "./auth";
import { db } from "./db";
import { subscriptions, workspaces } from "./db/schema";
import { eq } from "drizzle-orm";

export type PlanLimits = { workspaces: number };

// Map plan names to their workspace limits
const PLAN_LIMITS: Record<string, PlanLimits> = {
  pro: { workspaces: 5 }
};

export async function requireSubscription(
  headers: Headers
): Promise<{ userId: string; limits: PlanLimits }> {
  // 1) Validate session
  const session = await auth.api.getSession({ headers });
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  const userId = session.user.id;

  // 2) Fetch all subscriptions for this reference
  const subs = await db.query.subscriptions.findMany({
    where: eq(subscriptions.referenceId, userId),
  });

  // 3) Determine active/trialing subscription
  const active = subs.find(
    (s) => s.status === "active" || s.status === "trialing"
  );

  // 4) Derive limits: default free users get 3 workspaces
  const limits: PlanLimits = active
    ? PLAN_LIMITS[active.plan] ?? { workspaces: 3 }
    : { workspaces: 3 };

  // 5) Count existing workspaces
  const existingCount = (
    await db.query.workspaces.findMany({
      where: eq(workspaces.ownerId, userId),
    })
  ).length;

  // 6) Enforce limit
  if (existingCount >= limits.workspaces) {
    throw new Error(
      `Workspace limit reached for plan${active?.plan ? ` (${active.plan})` : ""}.`
    );
  }

  return { userId, limits };
} 