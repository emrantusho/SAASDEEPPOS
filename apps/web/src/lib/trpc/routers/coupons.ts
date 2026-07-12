import { z } from "zod/v4";
import { protectedProcedure, router } from "../init";
import { db } from "@/lib/db";
import { coupons } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

const couponSchema = z.object({
  id: z.number(),
  user_uid: z.string(),
  code: z.string(),
  type: z.string(),
  value: z.number(),
  min_amount: z.number().nullable(),
  max_uses: z.number().nullable(),
  used_count: z.number().nullable(),
  expires_at: z.date().nullable(),
  active: z.boolean().nullable(),
  created_at: z.date().nullable(),
});

export const couponsRouter = router({
  list: protectedProcedure
    .meta({ openapi: { method: "GET", path: "/coupons", tags: ["Coupons"], summary: "List all coupons" } })
    .input(z.void())
    .output(z.array(couponSchema))
    .query(async ({ ctx }) => {
      return db.select().from(coupons).where(eq(coupons.user_uid, ctx.user.id));
    }),

  create: protectedProcedure
    .meta({ openapi: { method: "POST", path: "/coupons", tags: ["Coupons"], summary: "Create a coupon" } })
    .input(
      z.object({
        code: z.string().min(1),
        type: z.enum(["percentage", "fixed"]),
        value: z.number().int().min(0),
        min_amount: z.number().int().min(0).optional(),
        max_uses: z.number().int().min(0).optional(),
        expires_at: z.string().optional(),
      })
    )
    .output(couponSchema)
    .mutation(async ({ ctx, input }) => {
      const { expires_at, ...rest } = input;
      const [data] = await db
        .insert(coupons)
        .values({
          ...rest,
          expires_at: expires_at ? new Date(expires_at) : null,
          user_uid: ctx.user.id,
        })
        .returning();
      return data;
    }),

  update: protectedProcedure
    .meta({ openapi: { method: "PATCH", path: "/coupons/{id}", tags: ["Coupons"], summary: "Update a coupon" } })
    .input(
      z.object({
        id: z.number(),
        code: z.string().min(1).optional(),
        type: z.enum(["percentage", "fixed"]).optional(),
        value: z.number().int().min(0).optional(),
        min_amount: z.number().int().min(0).optional(),
        max_uses: z.number().int().min(0).optional(),
        expires_at: z.string().optional(),
        active: z.boolean().optional(),
      })
    )
    .output(couponSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, expires_at, ...data } = input;
      const setData: Record<string, unknown> = { ...data };
      if (expires_at !== undefined) {
        setData.expires_at = expires_at ? new Date(expires_at) : null;
      }
      const [updated] = await db
        .update(coupons)
        .set(setData)
        .where(and(eq(coupons.id, id), eq(coupons.user_uid, ctx.user.id)))
        .returning();
      return updated;
    }),

  delete: protectedProcedure
    .meta({ openapi: { method: "DELETE", path: "/coupons/{id}", tags: ["Coupons"], summary: "Delete a coupon" } })
    .input(z.object({ id: z.number() }))
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      await db
        .delete(coupons)
        .where(and(eq(coupons.id, input.id), eq(coupons.user_uid, ctx.user.id)));
      return { success: true };
    }),
});
