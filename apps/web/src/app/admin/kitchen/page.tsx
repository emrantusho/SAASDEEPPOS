"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@saasdeep/ui/components/card";
import { Button } from "@saasdeep/ui/components/button";
import { Badge } from "@saasdeep/ui/components/badge";
import { Skeleton } from "@saasdeep/ui/components/skeleton";
import { ChefHatIcon, ClockIcon } from "lucide-react";
import { useTRPC } from "@/lib/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { useCrudMutation } from "@/hooks/use-crud-mutation";
import type { RouterOutputs } from "@/lib/trpc/router";

type PendingOrder = RouterOutputs["kitchen"]["pendingOrders"][number];

function timeSince(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}

export default function KitchenPage() {
  const trpc = useTRPC();
  const [now, setNow] = useState(Date.now());

  const queryOpts = trpc.kitchen.pendingOrders.queryOptions();
  const { data: orders = [], isLoading, error } = useQuery({
    ...queryOpts,
    refetchInterval: 10000,
  });

  const invalidateKeys = queryOpts.queryKey;

  const updateStatusMutation = useCrudMutation({
    mutationOptions: trpc.kitchen.updateStatus.mutationOptions(),
    invalidateKeys,
    successMessage: "Status updated",
    errorMessage: "Failed to update status",
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const pendingOrders = orders.filter((o) => o.status === "pending");
  const preparingOrders = orders.filter((o) => o.status === "preparing");

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 3 }).map((_, j) => (
                <Skeleton key={j} className="h-4 w-full" />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return <Card><CardContent><p className="text-red-500">{error.message}</p></CardContent></Card>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <ChefHatIcon className="w-6 h-6" />
          Kitchen Display
        </h2>
        <span className="text-sm text-muted-foreground">
          Refreshing every 10s...
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Orders */}
        <div>
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Badge variant="secondary" className="text-base px-3 py-1">
              {pendingOrders.length}
            </Badge>
            Pending
          </h3>
          <div className="space-y-4">
            {pendingOrders.map((order) => (
              <KitchenOrderCard
                key={order.id}
                order={order}
                now={now}
                onStatusChange={(status) =>
                  updateStatusMutation.mutate({ id: order.id, status })
                }
              />
            ))}
            {pendingOrders.length === 0 && (
              <p className="text-muted-foreground text-center py-8">No pending orders</p>
            )}
          </div>
        </div>

        {/* Preparing Orders */}
        <div>
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Badge variant="default" className="text-base px-3 py-1">
              {preparingOrders.length}
            </Badge>
            Preparing
          </h3>
          <div className="space-y-4">
            {preparingOrders.map((order) => (
              <KitchenOrderCard
                key={order.id}
                order={order}
                now={now}
                onStatusChange={(status) =>
                  updateStatusMutation.mutate({ id: order.id, status })
                }
              />
            ))}
            {preparingOrders.length === 0 && (
              <p className="text-muted-foreground text-center py-8">No orders in preparation</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function KitchenOrderCard({
  order,
  now,
  onStatusChange,
}: {
  order: PendingOrder;
  now: number;
  onStatusChange: (status: "pending" | "preparing" | "ready") => void;
}) {
  const elapsed = order.created_at ? timeSince(new Date(order.created_at)) : "-";

  return (
    <Card className="border-2">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="text-lg font-bold">Order #{order.id}</h4>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <ClockIcon className="w-4 h-4" />
              <span className="font-mono text-base">{elapsed}</span>
              {order.table_number && <span>| Table {order.table_number}</span>}
            </div>
          </div>
          <Badge className="text-sm px-3 py-1" variant={order.status === "preparing" ? "default" : "secondary"}>
            {order.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {order.customer_name && (
          <p className="text-sm text-muted-foreground mb-2">Customer: {order.customer_name}</p>
        )}
        <ul className="space-y-1 mb-4">
          {order.orderItems.map((item) => (
            <li key={item.id} className="flex items-center justify-between text-base">
              <span>
                <span className="font-bold">{item.quantity}x</span>{" "}
                {item.product?.name ?? `Product #${item.product_id}`}
              </span>
            </li>
          ))}
        </ul>
        {order.notes && (
          <p className="text-sm italic text-muted-foreground mb-3 border-t pt-2">
            Note: {order.notes}
          </p>
        )}
        <div className="flex gap-2 mt-2">
          {order.status === "pending" && (
            <Button
              size="lg"
              className="flex-1 text-base"
              onClick={() => onStatusChange("preparing")}
            >
              Start Preparing
            </Button>
          )}
          {order.status === "preparing" && (
            <Button
              size="lg"
              className="flex-1 text-base"
              variant="default"
              onClick={() => onStatusChange("ready")}
            >
              Mark Ready
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
