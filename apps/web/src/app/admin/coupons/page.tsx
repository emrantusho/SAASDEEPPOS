"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod/v4";
import { Card, CardContent, CardHeader } from "@saasdeep/ui/components/card";
import { PlusCircle, TrashIcon, TagIcon } from "lucide-react";
import { Button } from "@saasdeep/ui/components/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@saasdeep/ui/components/dialog";
import { Input } from "@saasdeep/ui/components/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@saasdeep/ui/components/select";
import { Label } from "@saasdeep/ui/components/label";
import { Badge } from "@saasdeep/ui/components/badge";
import { Skeleton } from "@saasdeep/ui/components/skeleton";
import { useTRPC } from "@/lib/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { useCrudMutation } from "@/hooks/use-crud-mutation";
import { DataTable, TableActions, TableActionButton, type Column } from "@saasdeep/ui/components/data-table";
import type { RouterOutputs } from "@/lib/trpc/router";
import { useTranslations, useLocale } from "next-intl";
import { formatCurrency } from "@/lib/utils";

type Coupon = RouterOutputs["coupons"]["list"][number];

export default function CouponsPage() {
  const trpc = useTRPC();
  const { data: coupons = [], isLoading, error } = useQuery(trpc.coupons.list.queryOptions());
  const t = useTranslations("coupons");
  const tc = useTranslations("common");
  const locale = useLocale();

  const couponSchema = z.object({
    code: z.string().min(1, "Code is required"),
    type: z.enum(["percentage", "fixed"]),
    value: z.number().int().min(0),
    min_amount: z.number().int().min(0),
    max_uses: z.number().int().min(0),
    expires_at: z.string(),
  });

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const invalidateKeys = trpc.coupons.list.queryOptions().queryKey;

  const createMutation = useCrudMutation({
    mutationOptions: trpc.coupons.create.mutationOptions(),
    invalidateKeys,
    successMessage: "Coupon created",
    errorMessage: "Failed to create coupon",
    onSuccess: () => setIsCreateOpen(false),
  });

  const deleteMutation = useCrudMutation({
    mutationOptions: trpc.coupons.delete.mutationOptions(),
    invalidateKeys,
    successMessage: "Coupon deleted",
    errorMessage: "Failed to delete coupon",
  });

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const form = useForm({
    defaultValues: { code: "", type: "percentage" as "percentage" | "fixed", value: 0, min_amount: 0, max_uses: 0, expires_at: "" },
    validators: { onSubmit: couponSchema },
    onSubmit: ({ value }) => {
      createMutation.mutate({
        code: value.code,
        type: value.type,
        value: value.value,
        min_amount: value.min_amount || undefined,
        max_uses: value.max_uses || undefined,
        expires_at: value.expires_at || undefined,
      });
    },
  });

  const handleDelete = () => {
    if (deleteId !== null) {
      deleteMutation.mutate({ id: deleteId });
      setIsDeleteOpen(false);
      setDeleteId(null);
    }
  };

  const columns: Column<Coupon>[] = [
    { key: "code", header: t("code"), sortable: true, className: "font-mono font-medium" },
    {
      key: "type",
      header: t("type"),
      sortable: true,
      render: (row) => (
        <Badge variant={row.type === "percentage" ? "default" : "secondary"}>
          {row.type === "percentage" ? "%" : "$"}
        </Badge>
      ),
    },
    {
      key: "value",
      header: t("value"),
      sortable: true,
      render: (row) => (row.type === "percentage" ? `${row.value}%` : formatCurrency(row.value, locale)),
    },
    {
      key: "used_count",
      header: t("uses"),
      sortable: true,
      render: (row) => `${row.used_count ?? 0}${row.max_uses ? ` / ${row.max_uses}` : ""}`,
    },
    {
      key: "expires_at",
      header: t("expires"),
      sortable: true,
      hideOnMobile: true,
      render: (row) => row.expires_at ? new Date(row.expires_at).toLocaleDateString() : "-",
    },
    {
      key: "active",
      header: tc("status"),
      sortable: true,
      render: (row) => (
        <Badge variant={row.active ? "default" : "secondary"}>
          {row.active ? tc("active") : tc("inactive")}
        </Badge>
      ),
    },
  ];

  const actionsColumn: Column<Coupon> = {
    key: "actions",
    header: tc("actions"),
    render: (row) => (
      <TableActions>
        <TableActionButton
          variant="danger"
          onClick={() => { setDeleteId(row.id); setIsDeleteOpen(true); }}
          icon={<TrashIcon className="w-4 h-4" />}
          label={tc("delete")}
        />
      </TableActions>
    ),
  };

  if (isLoading) {
    return (
      <Card className="flex flex-col gap-6 p-6">
        <CardHeader className="p-0"><div className="flex items-center justify-between"><Skeleton className="h-10 w-48" /><Skeleton className="h-9 w-32" /></div></CardHeader>
        <CardContent className="p-0 space-y-3">{Array.from({ length: 4 }).map((_, i) => (<div key={i} className="flex items-center gap-4"><Skeleton className="h-4 w-24" /><Skeleton className="h-4 w-16" /><Skeleton className="h-4 w-16" /><Skeleton className="h-4 w-20" /><Skeleton className="h-4 w-24" /><Skeleton className="h-8 w-20" /></div>))}</CardContent>
      </Card>
    );
  }

  if (error) { return <Card><CardContent><p className="text-red-500">{error.message}</p></CardContent></Card>; }

  return (
    <Card className="flex flex-col gap-4 p-3 sm:gap-6 sm:p-6">
      <CardHeader className="p-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <TagIcon className="w-5 h-5" />
            <span className="text-sm">{coupons.length} coupon(s)</span>
          </div>
          <Button size="sm" onClick={() => { setIsCreateOpen(true); form.reset(); }}>
            <PlusCircle className="w-4 h-4 mr-2" />{t("addCoupon")}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <DataTable
          data={coupons}
          columns={[...columns, actionsColumn]}
          emptyMessage={t("noCoupons")}
          emptyIcon={<TagIcon className="w-8 h-8" />}
          defaultSort={[{ id: "code", desc: false }]}
        />
      </CardContent>

      <Dialog open={isCreateOpen} onOpenChange={(open) => { if (!open) setIsCreateOpen(false); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t("addCoupon")}</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); form.handleSubmit(); }}>
            <div className="grid gap-4 py-4">
              <form.Field name="code">
                {(field) => (
                  <div className="flex flex-col sm:grid sm:grid-cols-4 sm:items-center gap-2 sm:gap-4">
                    <Label htmlFor="code">{t("code")}</Label>
                    <div className="col-span-3">
                      <Input id="code" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} onBlur={field.handleBlur} placeholder="SUMMER20" error={field.state.meta.errors.length > 0 ? field.state.meta.errors.map(e => e?.message ?? e).join(", ") : undefined} />
                    </div>
                  </div>
                )}
              </form.Field>
              <form.Field name="type">
                {(field) => (
                  <div className="flex flex-col sm:grid sm:grid-cols-4 sm:items-center gap-2 sm:gap-4">
                    <Label htmlFor="type">{t("type")}</Label>
                    <Select value={field.state.value} onValueChange={(v) => field.handleChange(v as "percentage" | "fixed")}>
                      <SelectTrigger id="type" className="col-span-3"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">{t("percentage")}</SelectItem>
                        <SelectItem value="fixed">{t("fixed")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </form.Field>
              <form.Field name="value">
                {(field) => (
                  <div className="flex flex-col sm:grid sm:grid-cols-4 sm:items-center gap-2 sm:gap-4">
                    <Label htmlFor="value">{t("value")}</Label>
                    <div className="col-span-3">
                      <Input id="value" type="number" min="0" value={field.state.value} onChange={(e) => field.handleChange(Number(e.target.value))} onBlur={field.handleBlur} error={field.state.meta.errors.length > 0 ? field.state.meta.errors.map(e => e?.message ?? e).join(", ") : undefined} />
                    </div>
                  </div>
                )}
              </form.Field>
              <form.Field name="min_amount">
                {(field) => (
                  <div className="flex flex-col sm:grid sm:grid-cols-4 sm:items-center gap-2 sm:gap-4">
                    <Label htmlFor="min_amount">{t("minAmount")}</Label>
                    <Input id="min_amount" type="number" min="0" value={field.state.value} onChange={(e) => field.handleChange(Number(e.target.value))} className="col-span-3" />
                  </div>
                )}
              </form.Field>
              <form.Field name="max_uses">
                {(field) => (
                  <div className="flex flex-col sm:grid sm:grid-cols-4 sm:items-center gap-2 sm:gap-4">
                    <Label htmlFor="max_uses">{t("maxUses")}</Label>
                    <Input id="max_uses" type="number" min="0" value={field.state.value} onChange={(e) => field.handleChange(Number(e.target.value))} className="col-span-3" />
                  </div>
                )}
              </form.Field>
              <form.Field name="expires_at">
                {(field) => (
                  <div className="flex flex-col sm:grid sm:grid-cols-4 sm:items-center gap-2 sm:gap-4">
                    <Label htmlFor="expires_at">{t("expires")}</Label>
                    <Input id="expires_at" type="date" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} className="col-span-3" />
                  </div>
                )}
              </form.Field>
            </div>
            <DialogFooter>
              <Button variant="secondary" onClick={() => setIsCreateOpen(false)}>{tc("cancel")}</Button>
              <form.Subscribe selector={(state) => state.isSubmitting}>
                {(isSubmitting) => (
                  <Button type="submit" disabled={isSubmitting || createMutation.isPending}>{tc("create")}</Button>
                )}
              </form.Subscribe>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{tc("confirmDeletion")}</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">{t("deleteMessage")}</p>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsDeleteOpen(false)}>{tc("cancel")}</Button>
            <Button variant="destructive" onClick={handleDelete}>{tc("delete")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
