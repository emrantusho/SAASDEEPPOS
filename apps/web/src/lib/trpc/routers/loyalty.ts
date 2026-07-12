import { z } from "zod/v4";
import { protectedProcedure, router } from "../init";
import { db } from "@/lib/db";
import { storeSettings, customers } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export const loyaltyRouter = router({
  get: protectedProcedure
    .meta({ openapi: { method: "GET", path: "/loyalty/settings", tags: ["Loyalty"], summary: "Get loyalty settings" } })
    .input(z.void())
    .output(
      z.object({
        id: z.number(),
        user_uid: z.string(),
        store_name: z.string().nullable(),
      }).nullable()
    )
    .query(async ({ ctx }) => {
      const settings = await db.query.storeSettings.findFirst({
        where: eq(storeSettings.user_uid, ctx.user.id),
        columns: { id: true, user_uid: true, store_name: true },
      });
      return settings ?? null;
    }),

  addPoints: protectedProcedure
    .meta({ openapi: { method: "POST", path: "/loyalty/points", tags: ["Loyalty"], summary: "Add loyalty points to customer" } })
    .input(
      z.object({
        customerId: z.number(),
        points: z.number().int().min(0),
      })
    )
    .output(z.object({ success: z.boolean(), total_points: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const customer = await db.query.customers.findFirst({
        where: and(
          eq(customers.id, input.customerId),
          eq(customers.user_uid, ctx.user.id)
        ),
      });

      if (!customer) {
        throw new Error("Customer not found");
      }

      const currentPoints = customer.loyalty_points ?? 0;
      const newPoints = currentPoints + input.points;

      await db
        .update(customers)
        .set({ loyalty_points: newPoints })
        .where(eq(customers.id, input.customerId));

      return { success: true, total_points: newPoints };
    }),
});
