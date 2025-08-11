"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Plus, Wrench, Trash2 } from "lucide-react";

interface Item {
  id: string;
  name: string;
  desc: string;
  image_url: string;
  stock: number;
  threshold: number;
  alerte: boolean;
}

interface Inventory {
  name: string;
  location: string;
}

export default function InventoryDetailPage() {
  const params = useParams<{ id: string }>();
  const inventoryId = params?.id as string;

  const [items, setItems] = useState<Item[]>([]);
  const [allItems, setAllItems] = useState<Item[]>([]);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [stock, setStock] = useState<number>(0);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [editStocks, setEditStocks] = useState<Record<string, number>>({});
  const [inventoryInfo, setInventoryInfo] = useState<Inventory | null>(null);
  const [loading, setLoading] = useState(true);

  const token = () => localStorage.getItem("token");

  const fetchInventoryItems = async () => {
    const t = token();
    if (!t || !inventoryId) return;
    try {
      const res = await fetch(`/api/inventories/${inventoryId}/items`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchInventoryInfo = async () => {
    const t = token();
    if (!t || !inventoryId) return;
    try {
      const res = await fetch(`/api/inventories/${inventoryId}`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      const data = await res.json();
      setInventoryInfo(data ?? null);
    } catch {
      setInventoryInfo(null);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchInventoryItems();
    fetchInventoryInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inventoryId]);

  useEffect(() => {
    const t = token();
    if (!t) return;
    fetch("/api/items", { headers: { Authorization: `Bearer ${t}` } })
      .then((r) => r.json())
      .then((d) => setAllItems(Array.isArray(d) ? d : []))
      .catch(() => setAllItems([]));
  }, []);

  const handleAddStock = async () => {
    const t = token();
    if (!t || !selectedItemId || !stock) return;

    const res = await fetch(`/api/inventories/${inventoryId}/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${t}`,
      },
      body: JSON.stringify({ itemId: selectedItemId, stock }),
    });

    if (res.ok) {
      await fetchInventoryItems();
      setSelectedItemId("");
      setStock(0);
    } else {
      alert("Erreur lors de l’ajout du stock");
    }
  };

  const handleUpdateStock = async (itemId: string, newStock: number) => {
    const t = token();
    if (!t) return;

    const res = await fetch(`/api/inventories/${inventoryId}/items/${itemId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${t}`,
      },
      body: JSON.stringify({ stock: newStock }),
    });

    if (res.ok) {
      setItems((prev) =>
        prev.map((it) =>
          it.id === itemId
            ? { ...it, stock: newStock, alerte: newStock < it.threshold }
            : it
        )
      );
      setEditStocks((prev) => ({ ...prev, [itemId]: 0 }));
    } else {
      alert("Erreur lors de la modification du stock");
    }
  };

  const handleDeleteStock = async (itemId: string) => {
    const t = token();
    if (!t) return;

    const res = await fetch(`/api/inventories/${inventoryId}/items/${itemId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${t}` },
    });

    if (res.ok) fetchInventoryItems();
    else alert("Erreur lors de la suppression du stock");
  };

  const headerSubtitle = useMemo(() => {
    if (!inventoryInfo) return "";
    const name = inventoryInfo.name ?? "—";
    const loc = inventoryInfo.location || "Non spécifiée";
    return `📝 ${name} • 📍 ${loc}`;
  }, [inventoryInfo]);

  return (
    <div className="min-h-screen w-full">
      {/* ===== HERO ===== */}
      <section
        className="relative px-6 py-10 text-white"
        style={{
          background:
            "linear-gradient(120deg,#1256a0 0%, #1f75d1 45%, #b91c1c 100%)",
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            boxShadow:
              "inset 0 40px 80px rgba(0,0,0,.12), inset 0 -40px 80px rgba(0,0,0,.12)",
          }}
        />
        <div className="max-w-6xl mx-auto relative">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-wide flex items-center gap-2">
            <span>📦</span> Détails de l’inventaire
            <span className="text-white/70 text-sm font-normal ml-2">
              (ID: {inventoryId?.slice(0, 8)}…)
            </span>
          </h1>
          {inventoryInfo && (
            <p className="opacity-95 mt-1">{headerSubtitle}</p>
          )}
        </div>
      </section>

      {/* ===== CONTENT ===== */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 -mt-8 pb-16">
        {/* Toolbar */}
        <div className="mb-4 flex items-center justify-end">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full bg-emerald-600 hover:bg-emerald-700">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter stock
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogHeader>
                <DialogTitle>Ajouter un item à l’inventaire</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <select
                  className="h-10 px-3 py-2 border rounded-xl text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#1f75d1]"
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                >
                  <option value="">Sélectionner un item</option>
                  {allItems.map((it) => (
                    <option key={it.id} value={it.id}>
                      {it.name}
                    </option>
                  ))}
                </select>
                <Input
                  type="number"
                  placeholder="Quantité"
                  value={stock || ""}
                  min={1}
                  onChange={(e) => setStock(Number(e.target.value))}
                  className="rounded-xl"
                />
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={() => setDialogOpen(false)}
                >
                  Annuler
                </Button>
                <Button
                  className="rounded-full bg-emerald-600 hover:bg-emerald-700"
                  onClick={() =>
                    handleAddStock().then(() => setDialogOpen(false))
                  }
                >
                  Ajouter
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Card + Table */}
        <Card className="border border-gray-100 bg-white/95 backdrop-blur shadow-2xl rounded-2xl overflow-hidden">
          {/* Skeleton */}
          {loading ? (
            <div className="p-6 animate-pulse">
              <div className="h-6 w-64 bg-gray-200 rounded mb-4" />
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded" />
                ))}
              </div>
            </div>
          ) : (
            <div className="max-h-[65vh] overflow-auto">
              <Table>
                <TableHeader className="bg-gray-50 sticky top-0 z-10">
                  <TableRow className="text-gray-700 text-sm font-semibold">
                    <TableCell>Nom</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Image</TableCell>
                    <TableCell>Stock</TableCell>
                    <TableCell>Seuil</TableCell>
                    <TableCell>Alerte</TableCell>
                    <TableCell className="min-w-[220px]">Actions</TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {items.length ? (
                    items.map((item, i) => {
                      const warn =
                        item.alerte ||
                        (typeof item.threshold === "number" &&
                          item.stock < item.threshold);
                      return (
                        <TableRow
                          key={item.id}
                          className={`transition-colors ${
                            i % 2 ? "bg-white" : "bg-gray-50/60"
                          } ${warn ? "ring-1 ring-rose-200 bg-rose-50/60" : ""}`}
                        >
                          <TableCell className="align-top">
                            <div className="font-medium text-[#0b2f57]">
                              {item.name}
                            </div>
                          </TableCell>

                          <TableCell className="align-top text-sm">
                            <div className="max-w-[720px] leading-relaxed">
                              {item.desc}
                            </div>
                          </TableCell>

                          <TableCell className="align-top">
                            {item.image_url ? (
                              <img
                                src={item.image_url}
                                alt={item.name}
                                className="h-12 w-12 object-cover rounded-lg border"
                              />
                            ) : (
                              <span className="text-xs text-gray-400">
                                Pas d’image
                              </span>
                            )}
                          </TableCell>

                          <TableCell className="align-top">
                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-sm font-medium text-gray-800">
                              {item.stock}
                            </span>
                          </TableCell>

                          <TableCell className="align-top">
                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-sm font-medium text-gray-800">
                              {item.threshold}
                            </span>
                          </TableCell>

                          <TableCell className="align-top">
                            {warn ? (
                              <span className="inline-flex items-center gap-2 rounded-full bg-rose-100 text-rose-800 ring-1 ring-rose-200 px-2.5 py-1 text-xs font-semibold">
                                <span className="h-2 w-2 rounded-full bg-rose-500" />
                                Alerte
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200 px-2.5 py-1 text-xs font-semibold">
                                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                OK
                              </span>
                            )}
                          </TableCell>

                          <TableCell className="align-top">
                            <div className="flex flex-wrap items-center gap-2">
                              <Input
                                type="number"
                                min={0}
                                placeholder="Quantité à retirer"
                                className="w-32 rounded-xl"
                                value={editStocks[item.id] ?? ""}
                                onChange={(e) =>
                                  setEditStocks((prev) => ({
                                    ...prev,
                                    [item.id]: Number(e.target.value),
                                  }))
                                }
                              />
                              <Button
                                variant="secondary"
                                className="rounded-full"
                                disabled={!editStocks[item.id]}
                                onClick={() => {
                                  const decrement = editStocks[item.id] ?? 0;
                                  if (decrement <= 0) {
                                    alert(
                                      "Veuillez saisir une quantité positive."
                                    );
                                    return;
                                  }
                                  const newStock = item.stock - decrement;
                                  if (newStock < 0) {
                                    alert(
                                      "Le stock ne peut pas être négatif."
                                    );
                                    return;
                                  }
                                  handleUpdateStock(item.id, newStock);
                                }}
                              >
                                <Wrench className="h-4 w-4 mr-1" />
                                Ajuster
                              </Button>
                              <Button
                                variant="destructive"
                                className="rounded-full"
                                onClick={() => handleDeleteStock(item.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Supprimer
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center text-gray-500 italic p-6"
                      >
                        Aucun item trouvé.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
