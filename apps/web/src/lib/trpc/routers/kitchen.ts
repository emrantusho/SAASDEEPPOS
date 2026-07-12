import { z } from "zod/v4";
import { protectedProcedure, router } from "../init";
import { db } from "@/lib/db";
import { orders, orderItems } from "@/lib/db/schema";
import { eq, and, inArray } from "drizzle-orm";

const orderItemSchema = z.object({
  id: z.number(),
  order_id: z.number().nullable(),
  product_id: z.number().nullable(),
  quantity: z.number(),
  price: z.number(),
  product: z.object({ name: z.string(), images: z.any() }).nullable(),
});

const pendingOrderSchema = z.object({
  id: z.number(),
  customer_id: z.number().nullable(),
  total_amount: z.number(),
  status: z.string().nullable(),
  user_uid: z.string(),
  table_number: z.string().nullable(),
  customer_name: z.string().nullable(),
  notes: z.string().nullable(),
  created_at: z.date().nullable(),
  orderItems: z.array(orderItemSchema),
});

export const kitchenRouter = router({
  pendingOrders: protectedProcedure
    .meta({ openapi: { method: "GET", path: "/kitchen/pending", tags: ["Kitchen"], summary: "List pending & preparing orders" } })
    .input(z.void())
    .output(z.array(pendingOrderSchema))
    .query(async ({ ctx }) => {
      return db.query.orders.findMany({
        where: and(
          eq(orders.user_uid, ctx.user.id),
          inArray(orders.status, ["pending", "preparing"])
        ),
        with: {
          orderItems: {
            with: {
              product: { columns: { name: true, images: true } },
            },
          },
        },
        orderBy: (orders, { asc }) => [asc(orders.created_at)],
      });
    }),

  updateStatus: protectedProcedure
    .meta({ openapi: { method: "PATCH", path: "/kitchen/orders/{id}/status", tags: ["Kitchen"], summary: "Update order status in kitchen" } })
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["pending", "preparing", "ready"]),
      })
    )
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      await db
        .update(orders)
        .set({ status: input.status })
        .where(and(eq(orders.id, input.id), eq(orders.user_uid, ctx.user.id)));
      return { success: true };
    }),
});
