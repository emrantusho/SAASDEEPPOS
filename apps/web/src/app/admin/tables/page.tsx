"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod/v4";
import { Button } from "@saasdeep/ui/components/button";
import { Card, CardContent, CardHeader } from "@saasdeep/ui/components/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@saasdeep/ui/components/dialog";
import { Input } from "@saasdeep/ui/components/input";
import { Label } from "@saasdeep/ui/components/label";
import { Badge } from "@saasdeep/ui/components/badge";
import { Skeleton } from "@saasdeep/ui/components/skeleton";
import { PlusIcon, TrashIcon, FilePenIcon } from "lucide-react";
import { useTRPC } from "@/lib/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { useCrudMutation } from "@/hooks/use-crud-mutation";
import type { RouterOutputs } from "@/lib/trpc/router";
import { useTranslations } from "next-intl";

type Table = RouterOutputs["tables"]["list"][number];
type TableStatus = "free" | "occupied" | "reserved";

const statusColors: Record<TableStatus, string> = {
  free: "bg-green-100 text-green-800 border-green-300",
  occupied: "bg-red-100 text-red-800 border-red-300",
  reserved: "bg-yellow-100 text-yellow-800 border-yellow-300",
};

const statusLabels: Record<TableStatus, string> = {
  free: "Free",
  occupied: "Occupied",
  reserved: "Reserved",
};

export default function TablesPage() {
  const trpc = useTRPC();
  const { data: tables = [], isLoading, error } = useQuery(trpc.tables.list.queryOptions());
  const t = useTranslations("tables");
  const tc = useTranslations("common");

  const tableSchema = z.object({
    number: z.string().min(1, "Table number is required"),
    capacity: z.number().int().min(1),
    location: z.string(),
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const isEditing = editingId !== null;
  const invalidateKeys = trpc.tables.list.queryOptions().queryKey;

  const createMutation = useCrudMutation({
    mutationOptions: trpc.tables.create.mutationOptions(),
    invalidateKeys,
    successMessage: "Table created",
    errorMessage: "Failed to create table",
    onSuccess: () => setIsDialogOpen(false),
  });

  const updateMutation = useCrudMutation({
    mutationOptions: trpc.tables.update.mutationOptions(),
    invalidateKeys,
    successMessage: "Table updated",
    errorMessage: "Failed to update table",
    onSuccess: () => setIsDialogOpen(false),
  });

  const deleteMutation = useCrudMutation({
    mutationOptions: trpc.tables.delete.mutationOptions(),
    invalidateKeys,
    successMessage: "Table deleted",
    errorMessage: "Failed to delete table",
  });

  const updateStatusMutation = useCrudMutation({
    mutationOptions: trpc.tables.updateStatus.mutationOptions(),
    invalidateKeys,
    successMessage: "Status updated",
    errorMessage: "Failed to update status",
  });

  const form = useForm({
    defaultValues: { number: "", capacity: 4, location: "" },
    validators: { onSubmit: tableSchema },
    onSubmit: ({ value }) => {
      if (isEditing) {
        updateMutation.mutate({
          id: editingId,
          number: value.number,
          capacity: value.capacity,
          location: value.location || undefined,
        });
      } else {
        createMutation.mutate({
          number: value.number,
          capacity: value.capacity,
          location: value.location || undefined,
        });
      }
    },
  });

  const openCreate = () => {
    setEditingId(null);
    form.reset();
    setIsDialogOpen(true);
  };

  const openEdit = (table: Table) => {
    setEditingId(table.id);
    form.reset();
    form.setFieldValue("number", table.number);
    form.setFieldValue("capacity", table.capacity ?? 4);
    form.setFieldValue("location", table.location ?? "");
    setIsDialogOpen(true);
  };

  const handleDelete = () => {
    if (deleteId !== null) {
      deleteMutation.mutate({ id: deleteId });
      setIsDeleteOpen(false);
      setDeleteId(null);
    }
  };

  const cycleStatus = (table: Table) => {
    const order: TableStatus[] = ["free", "occupied", "reserved"];
    const current = (table.status as TableStatus) || "free";
    const nextIndex = (order.indexOf(current) + 1) % order.length;
    updateStatusMutation.mutate({ id: table.id, status: order[nextIndex] });
  };

  if (isLoading) {
    return (
      <Card className="flex flex-col gap-4 p-3 sm:gap-6 sm:p-6">
        <CardHeader className="p-0">
          <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-9 w-32" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return <Card><CardContent><p className="text-red-500">{error.message}</p></CardContent></Card>;
  }

  return (
    <Card className="flex flex-col gap-4 p-3 sm:gap-6 sm:p-6">
      <CardHeader className="p-0">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t("title")}</h2>
          <Button size="sm" onClick={openCreate}>
            <PlusIcon className="w-4 h-4 mr-2" />{t("addTable")}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {tables.map((table) => {
            const status = (table.status as TableStatus) || "free";
            return (
              <div
                key={table.id}
                className="relative flex flex-col items-center justify-center rounded-xl border-2 p-4 cursor-pointer transition-all hover:shadow-md"
                style={{ minHeight: "130px" }}
                onClick={() => cycleStatus(table)}
              >
                <div className="absolute top-2 right-2 flex gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); openEdit(table); }}
                    className="p-1 rounded hover:bg-muted"
                    title="Edit"
                  >
                    <FilePenIcon className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleteId(table.id); setIsDeleteOpen(true); }}
                    className="p-1 rounded hover:bg-muted"
                    title="Delete"
                  >
                    <TrashIcon className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                </div>
                <span className="text-3xl font-bold">{table.number}</span>
                <span className="text-xs text-muted-foreground mt-1">
                  {table.capacity} {table.capacity === 1 ? "person" : "people"}
                </span>
                {table.location && (
                  <span className="text-xs text-muted-foreground">{table.location}</span>
                )}
                <Badge className={`mt-2 text-xs ${statusColors[status]}`}>
                  {statusLabels[status]}
                </Badge>
                <span className="text-[10px] text-muted-foreground mt-1">Click to change</span>
              </div>
            );
          })}
          {tables.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-muted-foreground">
              <p>{t("noTables")}</p>
            </div>
          )}
        </div>
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) setIsDialogOpen(false); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{isEditing ? t("editTable") : t("addTable")}</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); form.handleSubmit(); }}>
            <div className="grid gap-4 py-4">
              <form.Field name="number">
                {(field) => (
                  <div className="flex flex-col sm:grid sm:grid-cols-4 sm:items-center gap-2 sm:gap-4">
                    <Label htmlFor="number">{t("tableNumber")}</Label>
                    <div className="col-span-3">
                      <Input id="number" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} onBlur={field.handleBlur} error={field.state.meta.errors.length > 0 ? field.state.meta.errors.map(e => e?.message ?? e).join(", ") : undefined} />
                    </div>
                  </div>
                )}
              </form.Field>
              <form.Field name="capacity">
                {(field) => (
                  <div className="flex flex-col sm:grid sm:grid-cols-4 sm:items-center gap-2 sm:gap-4">
                    <Label htmlFor="capacity">{t("capacity")}</Label>
                    <div className="col-span-3">
                      <Input id="capacity" type="number" min="1" value={field.state.value} onChange={(e) => field.handleChange(Number(e.target.value))} onBlur={field.handleBlur} error={field.state.meta.errors.length > 0 ? field.state.meta.errors.map(e => e?.message ?? e).join(", ") : undefined} />
                    </div>
                  </div>
                )}
              </form.Field>
              <form.Field name="location">
                {(field) => (
                  <div className="flex flex-col sm:grid sm:grid-cols-4 sm:items-center gap-2 sm:gap-4">
                    <Label htmlFor="location">{t("location")}</Label>
                    <Input id="location" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} className="col-span-3" />
                  </div>
                )}
              </form.Field>
            </div>
            <DialogFooter>
              <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>{tc("cancel")}</Button>
              <form.Subscribe selector={(state) => state.isSubmitting}>
                {(isSubmitting) => (
                  <Button type="submit" disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}>
                    {isEditing ? tc("update") : tc("create")}
                  </Button>
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
