'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { GetOrderByIDResponse } from '@/app/api/orders/[id]/route';

type QtyMap = Record<string, number>; // key = `${itemId}_${inventoryId}`

export default function AdminOrderProcessPage() {
  const params = useParams();
  const router = useRouter();

  const [order, setOrder] = useState<GetOrderByIDResponse | null>(null);
  const [selected, setSelected] = useState<QtyMap>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ---- Fetch
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
      return;
    }
    const ctrl = new AbortController();
    (async () => {
      try {
        const res = await fetch(`/api/orders/${params.id}`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: ctrl.signal,
        });
        if (!res.ok) {
          const e = await res.json().catch(() => ({}));
          throw new Error(e?.error || 'Erreur chargement commande');
        }
        const data = (await res.json()) as GetOrderByIDResponse;
        setOrder(data);
      } catch (e: any) {
        if (e.name !== 'AbortError') {
          console.error(e);
          alert('Impossible de charger la commande.');
          router.replace('/admin/orders');
        }
      } finally {
        setLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, [params.id, router]);

  // ---- Helpers
  const keyOf = (itemId: string, inventoryId: string) => `${itemId}_${inventoryId}`;

  const clamp = (n: number, min: number, max: number) =>
    Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : min;

  // totaux par item
  const perItemDemanded: Record<string, number> = useMemo(() => {
    const m: Record<string, number> = {};
    order?.orderItems?.forEach(oi => {
      if (oi?.item?.id) m[oi.item.id] = (m[oi.item.id] ?? 0) + (oi.quantity ?? 0);
    });
    return m;
  }, [order]);

  const perItemSelected: Record<string, number> = useMemo(() => {
    const m: Record<string, number> = {};
    Object.entries(selected).forEach(([k, q]) => {
      const [itemId] = k.split('_');
      m[itemId] = (m[itemId] ?? 0) + (q ?? 0);
    });
    return m;
  }, [selected]);

  const remainingForItem = (itemId: string) =>
    Math.max(0, (perItemDemanded[itemId] ?? 0) - (perItemSelected[itemId] ?? 0));

  // ---- Events
  const onChangeQty = (itemId: string, inventoryId: string, raw: string, stock: number) => {
    const n = clamp(Number(raw), 0, stock);
    // empêche de dépasser le restant pour cet item
    const rest = remainingForItem(itemId);
    const current = selected[keyOf(itemId, inventoryId)] ?? 0;
    const otherSelectedForItem = (perItemSelected[itemId] ?? 0) - current;
    const maxAllowed = Math.max(0, (perItemDemanded[itemId] ?? 0) - otherSelectedForItem);
    const finalQty = clamp(n, 0, Math.min(stock, maxAllowed));
    setSelected(prev => ({ ...prev, [keyOf(itemId, inventoryId)]: finalQty }));
  };

  const autoDistribute = (itemId: string, stocks: { inventoryId: string; stock: number }[]) => {
    // Remplit automatiquement depuis les stocks dispo jusqu’à quantité demandée
    const target = perItemDemanded[itemId] ?? 0;
    let left = target;
    const next = { ...selected };
    for (const s of stocks) {
      const k = keyOf(itemId, s.inventoryId);
      const take = Math.min(left, s.stock);
      next[k] = take;
      left -= take;
      if (left <= 0) break;
    }
    setSelected(next);
  };

  // ---- Validation côté UI
  const canValidate = useMemo(() => {
    if (!order?.orderItems?.length) return false;
    // chaque item doit avoir total sélectionné <= demandé, et >0 si on veut strict
    for (const oi of order.orderItems) {
      const id = oi.item?.id;
      if (!id) continue;
      const demanded = oi.quantity ?? 0;
      const selectedSum = perItemSelected[id] ?? 0;
      if (selectedSum > demanded) return false; // trop
      // autoriser partiel ? Si non, décommente :
      // if (selectedSum !== demanded) return false;
    }
    return true;
  }, [order, perItemSelected]);

  // ---- Actions API
  const submitValidate = async () => {
    if (!order) return;
    if (!canValidate) {
      alert("Les quantités sélectionnées dépassent la demande ou sont invalides.");
      return;
    }
    if (!confirm("Valider cette commande ?")) return;

    const token = localStorage.getItem('token');
    const body = Object.entries(selected)
      .filter(([, q]) => (q ?? 0) > 0)
      .map(([key, quantity]) => {
        const [item_id, inventory_id] = key.split('_');
        return { item_id, inventory_id, quantity };
      });

    try {
      setSaving(true);
      const res = await fetch(`/api/orders/${params.id}/validate`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ assignments: body }),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result?.error || 'Erreur serveur');

      alert('Commande validée avec succès ✅');
      router.push('/admin/orders');
    } catch (e: any) {
      console.error(e);
      alert(`Erreur lors de la validation : ${e.message || e}`);
    } finally {
      setSaving(false);
    }
  };

  const submitDecline = async () => {
    if (!confirm('Refuser cette commande ?')) return;
    const token = localStorage.getItem('token');
    try {
      setSaving(true);
      const res = await fetch(`/api/orders/${params.id}/decline`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const out = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(out?.error || 'Erreur serveur');
      alert('Commande refusée ❌');
      router.push('/admin/orders');
    } catch (e: any) {
      console.error(e);
      alert(`Erreur lors du refus : ${e.message || e}`);
    } finally {
      setSaving(false);
    }
  };

  // ---- UI
  if (loading) return <p className="p-6">Chargement…</p>;
  if (!order || !Array.isArray(order.orderItems)) return <p className="p-6">Commande introuvable.</p>;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="rounded-2xl p-5 bg-gradient-to-r from-blue-600 via-blue-500 to-red-500 text-white shadow">
        <h1 className="text-2xl font-extrabold">Traitement de la commande</h1>
        <p className="opacity-90">
          Destination : <span className="font-semibold">{order.destination}</span> •
          Créée le :{' '}
          <span className="font-semibold">
            {order.created_at ? new Date(order.created_at as any).toLocaleString() : '—'}
          </span>
        </p>
      </div>

      {/* Items */}
      {order.orderItems.map((oi) => {
        const item = oi.item;
        if (!item) return null;

        const demanded = oi.quantity ?? 0;
        const selectedSum = perItemSelected[item.id] ?? 0;
        const remaining = Math.max(0, demanded - selectedSum);

        const invs = (item.inventoryItems || []).filter(iv => !!iv.inventory);

        return (
          <div key={item.id} className="rounded-xl border bg-white shadow-sm">
            <div className="p-4 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-lg">{item.name}</h2>
                <p className="text-sm text-gray-600">
                  Demandé : <b>{demanded}</b> • Validé : <b>{selectedSum}</b> • Restant :{' '}
                  <b className={remaining > 0 ? 'text-orange-600' : 'text-green-600'}>{remaining}</b>
                </p>
              </div>
              <button
                className="text-sm rounded-lg border px-3 py-2 hover:bg-gray-50"
                onClick={() =>
                  autoDistribute(
                    item.id,
                    invs.map(iv => ({ inventoryId: iv.inventoryId, stock: iv.stock ?? 0 }))
                  )
                }
                disabled={!invs.length || demanded === 0}
                title="Répartir automatiquement sur les inventaires"
              >
                Répartir automatiquement
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-t border-b">
                  <tr>
                    <th className="p-2 text-left">Inventaire</th>
                    <th className="p-2 text-left">Stock dispo</th>
                    <th className="p-2 text-left">Quantité à valider</th>
                  </tr>
                </thead>
                <tbody>
                  {invs.map((inv) => {
                    const k = keyOf(item.id, inv.inventoryId);
                    const current = selected[k] ?? 0;
                    const stock = inv.stock ?? 0;

                    return (
                      <tr key={k} className="border-t">
                        <td className="p-2">{inv.inventory?.name ?? '—'}</td>
                        <td className="p-2">{stock}</td>
                        <td className="p-2">
                          <input
                            type="number"
                            min={0}
                            max={stock}
                            value={current}
                            className="border rounded px-2 py-1 w-24"
                            onChange={(e) => onChangeQty(item.id, inv.inventoryId, e.target.value, stock)}
                          />
                        </td>
                      </tr>
                    );
                  })}
                  {!invs.length && (
                    <tr>
                      <td colSpan={3} className="p-3 text-center text-gray-500">
                        Aucun inventaire porteur de stock pour cet article.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      {/* Actions */}
      <div className="sticky bottom-4 bg-white/80 backdrop-blur rounded-xl border p-4 flex gap-3 justify-end shadow">
        <button
          onClick={submitDecline}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
          disabled={saving}
        >
          Refuser
        </button>
        <button
          onClick={submitValidate}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          disabled={saving || !canValidate}
          title={!canValidate ? "Corrigez les quantités sélectionnées" : undefined}
        >
          {saving ? 'Validation…' : 'Valider'}
        </button>
      </div>
    </div>
  );
}
