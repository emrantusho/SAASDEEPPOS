import { z } from "zod/v4";
import { protectedProcedure, router } from "../init";
import { db } from "@/lib/db";
import { storeSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const storeSettingsSchema = z.object({
  id: z.number(),
  user_uid: z.string(),
  store_name: z.string().nullable(),
  store_description: z.string().nullable(),
  logo_url: z.string().nullable(),
  favicon_url: z.string().nullable(),
  footer_text: z.string().nullable(),
  primary_color: z.string().nullable(),
  secondary_color: z.string().nullable(),
  background_color: z.string().nullable(),
  text_color: z.string().nullable(),
  accent_color: z.string().nullable(),
  font_family: z.string().nullable(),
  currency: z.string().nullable(),
  locale: z.string().nullable(),
  payment_methods: z.array(z.string()).nullable(),
  delivery_fee: z.number().nullable(),
  free_delivery_min: z.number().nullable(),
  created_at: z.date().nullable(),
  updated_at: z.date().nullable(),
});

export const storeSettingsRouter = router({
  get: protectedProcedure
    .input(z.void())
    .output(storeSettingsSchema.nullable())
    .query(async ({ ctx }) => {
      return db.query.storeSettings.findFirst({
        where: eq(storeSettings.user_uid, ctx.user.id),
      }) ?? null;
    }),

  upsert: protectedProcedure
    .input(
      z.object({
        store_name: z.string().optional(),
        store_description: z.string().optional(),
        logo_url: z.string().optional(),
        favicon_url: z.string().optional(),
        footer_text: z.string().optional(),
        primary_color: z.string().optional(),
        secondary_color: z.string().optional(),
        background_color: z.string().optional(),
        text_color: z.string().optional(),
        accent_color: z.string().optional(),
        font_family: z.string().optional(),
        currency: z.string().optional(),
        locale: z.string().optional(),
        payment_methods: z.array(z.string()).optional(),
        delivery_fee: z.number().optional(),
        free_delivery_min: z.number().optional(),
      })
    )
    .output(storeSettingsSchema)
    .mutation(async ({ ctx, input }) => {
      const existing = await db.query.storeSettings.findFirst({
        where: eq(storeSettings.user_uid, ctx.user.id),
      });

      if (existing) {
        const [updated] = await db
          .update(storeSettings)
          .set({ ...input, updated_at: new Date() })
          .where(eq(storeSettings.user_uid, ctx.user.id))
          .returning();
        return updated;
      }

      const [created] = await db
        .insert(storeSettings)
        .values({ ...input, user_uid: ctx.user.id })
        .returning();
      return created;
    }),
});
