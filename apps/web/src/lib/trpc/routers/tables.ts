import { z } from "zod/v4";
import { protectedProcedure, router } from "../init";
import { db } from "@/lib/db";
import { tables } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

const tableSchema = z.object({
  id: z.number(),
  user_uid: z.string(),
  number: z.string(),
  capacity: z.number().nullable(),
  status: z.string().nullable(),
  location: z.string().nullable(),
  qr_code: z.string().nullable(),
  created_at: z.date().nullable(),
});

export const tablesRouter = router({
  list: protectedProcedure
    .meta({ openapi: { method: "GET", path: "/tables", tags: ["Tables"], summary: "List all tables" } })
    .input(z.void())
    .output(z.array(tableSchema))
    .query(async ({ ctx }) => {
      return db.select().from(tables).where(eq(tables.user_uid, ctx.user.id));
    }),

  create: protectedProcedure
    .meta({ openapi: { method: "POST", path: "/tables", tags: ["Tables"], summary: "Create a table" } })
    .input(
      z.object({
        number: z.string().min(1),
        capacity: z.number().int().min(1).optional(),
        location: z.string().optional(),
      })
    )
    .output(tableSchema)
    .mutation(async ({ ctx, input }) => {
      const [data] = await db
        .insert(tables)
        .values({ ...input, user_uid: ctx.user.id })
        .returning();
      return data;
    }),

  update: protectedProcedure
    .meta({ openapi: { method: "PATCH", path: "/tables/{id}", tags: ["Tables"], summary: "Update a table" } })
    .input(
      z.object({
        id: z.number(),
        number: z.string().min(1).optional(),
        capacity: z.number().int().min(1).optional(),
        location: z.string().optional(),
        status: z.enum(["free", "occupied", "reserved"]).optional(),
      })
    )
    .output(tableSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const [updated] = await db
        .update(tables)
        .set(data)
        .where(and(eq(tables.id, id), eq(tables.user_uid, ctx.user.id)))
        .returning();
      return updated;
    }),

  delete: protectedProcedure
    .meta({ openapi: { method: "DELETE", path: "/tables/{id}", tags: ["Tables"], summary: "Delete a table" } })
    .input(z.object({ id: z.number() }))
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      await db
        .delete(tables)
        .where(and(eq(tables.id, input.id), eq(tables.user_uid, ctx.user.id)));
      return { success: true };
    }),

  updateStatus: protectedProcedure
    .meta({ openapi: { method: "PATCH", path: "/tables/{id}/status", tags: ["Tables"], summary: "Update table status" } })
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["free", "occupied", "reserved"]),
      })
    )
    .output(tableSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, status } = input;
      const [updated] = await db
        .update(tables)
        .set({ status })
        .where(and(eq(tables.id, id), eq(tables.user_uid, ctx.user.id)))
        .returning();
      return updated;
    }),
});
