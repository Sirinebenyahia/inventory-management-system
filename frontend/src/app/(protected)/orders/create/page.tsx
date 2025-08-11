'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

type ItemEntry = { item_id: string; quantity: number };
type ItemOption = { id: string; name: string };

export default function CreateOrderPage() {
  const [destination, setDestination] = useState('');
  const [note, setNote] = useState('');
  const [rows, setRows] = useState<ItemEntry[]>([{ item_id: '', quantity: 1 }]);
  const [availableItems, setAvailableItems] = useState<ItemOption[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Fetch items
  useEffect(() => {
    (async () => {
      try {
        setLoadingItems(true);
        const token = localStorage.getItem('token') || '';
        const res = await fetch('/api/items', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setAvailableItems(Array.isArray(data) ? data : []);
      } catch (e) {
        setAvailableItems([]);
      } finally {
        setLoadingItems(false);
      }
    })();
  }, []);

  const addRow = () => setRows((r) => [...r, { item_id: '', quantity: 1 }]);
  const removeRow = (idx: number) =>
    setRows((r) => (r.length === 1 ? r : r.filter((_, i) => i !== idx)));

  const updateRow = (idx: number, patch: Partial<ItemEntry>) =>
    setRows((r) => r.map((row, i) => (i === idx ? { ...row, ...patch } : row)));

  const resetForm = () => {
    setDestination('');
    setNote('');
    setRows([{ item_id: '', quantity: 1 }]);
  };

  const invalidReason = useMemo(() => {
    if (!destination.trim()) return '⚠️ La destination est requise.';
    for (const r of rows) {
      if (!r.item_id) return '⚠️ Chaque ligne doit avoir un article.';
      if (!Number.isFinite(r.quantity) || r.quantity <= 0)
        return '⚠️ Les quantités doivent être des nombres positifs.';
    }
    return '';
  }, [destination, rows]);

  const lineCount = rows.reduce((acc, r) => acc + (r.item_id ? 1 : 0), 0);
  const totalQty = rows.reduce((acc, r) => acc + (Number(r.quantity) || 0), 0);

  const handleSubmit = async () => {
    setSuccessMsg('');
    setErrorMsg('');

    if (invalidReason) {
      setErrorMsg(invalidReason);
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token') || '';
      const payload = {
        destination: destination.trim(),
        items: rows.map((r) => ({ item_id: r.item_id, quantity: Number(r.quantity) })),
        note: note.trim() || undefined,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || 'Erreur lors de la création de la commande.');
      }

      setSuccessMsg('✅ Commande créée avec succès !');
      resetForm();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Une erreur est survenue.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full">
      {/* HERO (même style que tes autres pages) */}
      <section
        className="relative px-6 py-10 text-white"
        style={{ background: 'linear-gradient(120deg,#1256a0 0%, #1f75d1 45%, #b91c1c 100%)' }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ boxShadow: 'inset 0 40px 80px rgba(0,0,0,.12), inset 0 -40px 80px rgba(0,0,0,.12)' }}
        />
        <div className="max-w-6xl mx-auto relative">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-wide">Créer une commande</h1>
          <p className="opacity-90 mt-1">
            Renseignez une destination, sélectionnez vos articles et envoyez en un clic.
          </p>
        </div>
      </section>

      {/* CONTENU */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 -mt-8 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
        >
          <Card className="border-0 rounded-none p-6 md:p-8">
            {/* Top bar: destination + résumé */}
            <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-6">
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700">Destination (ville)</label>
                <Input
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Ex : Sfax, Nabeul, Sousse…"
                  className="mt-1 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="text-xs text-gray-500">
                  <div className="font-semibold text-gray-700">Lignes</div>
                  <div className="mt-1 text-base">{lineCount}</div>
                </div>
                <div className="text-xs text-gray-500">
                  <div className="font-semibold text-gray-700">Qté totale</div>
                  <div className="mt-1 text-base">{totalQty}</div>
                </div>
              </div>
            </div>

            {/* Note optionnelle */}
            <div className="mt-4">
              <label className="text-sm font-medium text-gray-700">Note (optionnelle)</label>
              <Input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Infos complémentaires pour le préparateur…"
                className="mt-1 rounded-xl"
              />
            </div>

            {/* Tableau des lignes */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold">Articles demandés</h2>
                <Button
                  onClick={addRow}
                  className="rounded-full bg-emerald-600 hover:bg-emerald-700"
                  type="button"
                >
                  ➕ Ajouter une ligne
                </Button>
              </div>

              <div className="max-h-[50vh] overflow-auto border border-gray-100 rounded-xl">
                <table className="w-full border-collapse">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr className="text-left text-gray-700 text-sm">
                      <th className="p-3">Article</th>
                      <th className="p-3 w-32">Quantité</th>
                      <th className="p-3 w-32 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, idx) => (
                      <tr key={idx} className="border-t hover:bg-gray-50/60">
                        <td className="p-3">
                          <select
                            value={row.item_id}
                            onChange={(e) => updateRow(idx, { item_id: e.target.value })}
                            className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1f75d1]"
                          >
                            <option value="">{loadingItems ? 'Chargement…' : '— Sélectionner —'}</option>
                            {availableItems.map((opt) => (
                              <option key={opt.id} value={opt.id}>
                                {opt.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="p-3">
                          <Input
                            type="number"
                            min={1}
                            value={String(row.quantity)}
                            onChange={(e) =>
                              updateRow(idx, { quantity: Math.max(1, Number(e.target.value || 0)) })
                            }
                            className="rounded-xl"
                          />
                        </td>
                        <td className="p-3 text-right">
                          <Button
                            type="button"
                            variant="destructive"
                            className="rounded-full"
                            onClick={() => removeRow(idx)}
                            disabled={rows.length === 1}
                            title={rows.length === 1 ? "Au moins une ligne est requise" : "Supprimer"}
                          >
                            🗑 Supprimer
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Messages */}
              {errorMsg && (
                <p className="mt-4 text-red-600 bg-red-50 border border-red-200 p-2 rounded">
                  {errorMsg}
                </p>
              )}
              {successMsg && (
                <p className="mt-4 text-emerald-700 bg-emerald-50 border border-emerald-200 p-2 rounded">
                  {successMsg}
                </p>
              )}

              {/* Actions */}
              <div className="mt-6 flex flex-wrap gap-3 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full"
                  onClick={resetForm}
                  disabled={submitting}
                >
                  Réinitialiser
                </Button>
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!!invalidReason || submitting}
                  className="rounded-full bg-[#1256a0] hover:bg-[#0e4d92]"
                >
                  {submitting ? 'Envoi…' : '✅ Envoyer la commande'}
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
