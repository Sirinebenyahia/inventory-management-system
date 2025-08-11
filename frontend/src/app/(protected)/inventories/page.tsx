'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type Inventory = {
  id: string;
  name: string;
  location: string;
  description?: string;
};

export default function InventoryListPage() {
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', location: '' });
  const [loading, setLoading] = useState(true);

  // Inline edit
  const [editMap, setEditMap] = useState<Record<string, boolean>>({});
  const [drafts, setDrafts] = useState<Record<string, { name: string; location: string }>>({});

  const token = () => (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

  const fetchInventories = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/inventories', {
        headers: { Authorization: `Bearer ${token()}` },
      });
      const data = await res.json();
      setInventories(Array.isArray(data) ? data : []);
    } catch {
      setInventories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return inventories;
    return inventories.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        (i.location || '').toLowerCase().includes(q) ||
        i.id.toLowerCase().includes(q)
    );
  }, [inventories, search]);

  const addInventory = async () => {
    if (!form.name) return;
    const res = await fetch('/api/inventories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token()}`,
      },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setForm({ name: '', location: '' });
      setIsModalOpen(false);
      fetchInventories();
    }
  };

  const removeInventory = async (id: string) => {
    const res = await fetch(`/api/inventories/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token()}` },
    });
    if (res.ok) fetchInventories();
  };

  const saveInventory = async (id: string, name: string, location: string) => {
    await fetch(`/api/inventories/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token()}`,
      },
      body: JSON.stringify({ name, location }),
    });
    setEditMap((m) => ({ ...m, [id]: false }));
    fetchInventories();
  };

  return (
    <div className="min-h-screen w-full">
      {/* ===== HERO (bandeau) ===== */}
      <section
        className="relative z-0 px-6 py-10 text-white"
        style={{
          background: 'linear-gradient(120deg,#1256a0 0%, #1f75d1 45%, #b91c1c 100%)',
        }}
      >
        {/* overlay d’ombre, doit rester derrière */}
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            boxShadow: 'inset 0 40px 80px rgba(0,0,0,.12), inset 0 -40px 80px rgba(0,0,0,.12)',
          }}
        />
        <div className="max-w-6xl mx-auto relative z-10">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-wide flex items-center gap-3">
            <span>📦</span> Liste des Inventaires
          </h1>
          <p className="opacity-90 mt-1">
            Recherchez, ajoutez, modifiez et consultez vos emplacements.
          </p>
        </div>
      </section>

      {/* ===== CONTENU (remonte au-dessus du bandeau) ===== */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 -mt-8 pb-12 relative z-20">
        {/* Toolbar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-4 flex items-center gap-3"
        >
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par nom, emplacement ou ID…"
              className="
                h-11 w-full pl-10 pr-4
                rounded-full
                bg-white/95 backdrop-blur
                text-gray-900 placeholder:text-gray-500
                border border-gray-200 shadow-lg
                focus:outline-none focus:ring-2 focus:ring-[#1f75d1]
              "
            />
          </div>

          <Button
            onClick={() => setIsModalOpen(true)}
            className="h-11 rounded-full bg-emerald-600 hover:bg-emerald-700 shadow-lg"
          >
            ➕ Ajouter
          </Button>
        </motion.div>

        {/* Table Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
        >
          <Card className="border-0 rounded-none">
            <div className="max-h-[60vh] overflow-auto">
              <Table>
                <TableHeader className="bg-gray-50 sticky top-0 z-10">
                  <TableRow className="text-gray-700 text-sm font-semibold">
                    <TableCell>Nom</TableCell>
                    <TableCell>Emplacement</TableCell>
                    <TableCell className="min-w-[280px]">ID</TableCell>
                    <TableCell>Détails</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="p-6 text-center text-gray-500">
                        Chargement…
                      </TableCell>
                    </TableRow>
                  ) : filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="p-6 text-center text-gray-500 italic">
                        Aucun inventaire disponible.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((inv, i) => {
                      const editing = !!editMap[inv.id];
                      const draft = drafts[inv.id] ?? {
                        name: inv.name,
                        location: inv.location,
                      };

                      return (
                        <TableRow
                          key={inv.id}
                          className={`transition-colors ${
                            i % 2 ? 'bg-white' : 'bg-gray-50'
                          } hover:bg-gray-100/60`}
                        >
                          <TableCell>
                            {editing ? (
                              <Input
                                value={draft.name}
                                onChange={(e) =>
                                  setDrafts((d) => ({
                                    ...d,
                                    [inv.id]: { ...draft, name: e.target.value },
                                  }))
                                }
                                className="rounded-xl"
                              />
                            ) : (
                              <span
                                onClick={() =>
                                  setEditMap((m) => ({ ...m, [inv.id]: true }))
                                }
                                className="cursor-pointer hover:underline"
                              >
                                {inv.name}
                              </span>
                            )}
                          </TableCell>

                          <TableCell>
                            {editing ? (
                              <Input
                                value={draft.location}
                                onChange={(e) =>
                                  setDrafts((d) => ({
                                    ...d,
                                    [inv.id]: { ...draft, location: e.target.value },
                                  }))
                                }
                                className="rounded-xl"
                              />
                            ) : (
                              <span
                                onClick={() =>
                                  setEditMap((m) => ({ ...m, [inv.id]: true }))
                                }
                                className="cursor-pointer hover:underline"
                              >
                                {inv.location}
                              </span>
                            )}
                          </TableCell>

                          <TableCell className="text-xs text-gray-500">{inv.id}</TableCell>

                          <TableCell>
                            <Link
                              href={`/inventories/${inv.id}`}
                              className="text-[#1256a0] hover:underline font-medium"
                            >
                              Voir
                            </Link>
                          </TableCell>

                          <TableCell className="space-x-2">
                            {editing ? (
                              <>
                                <Button
                                  size="sm"
                                  className="rounded-full bg-[#1256a0] hover:bg-[#0e4d92]"
                                  onClick={() =>
                                    saveInventory(inv.id, draft.name, draft.location)
                                  }
                                >
                                  Enregistrer
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="rounded-full"
                                  onClick={() =>
                                    setEditMap((m) => ({ ...m, [inv.id]: false }))
                                  }
                                >
                                  Annuler
                                </Button>
                              </>
                            ) : (
                              <Button
                                variant="destructive"
                                size="sm"
                                className="rounded-full"
                                onClick={() => removeInventory(inv.id)}
                              >
                                Supprimer
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* ===== Modal création ===== */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="rounded-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              ➕ Ajouter un nouvel inventaire
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              Renseignez un nom et un emplacement.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <Input
              placeholder="Nom de l'inventaire"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="rounded-xl"
            />
            <Input
              placeholder="Emplacement"
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              className="rounded-xl"
            />
          </div>

          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => setIsModalOpen(false)}
            >
              Annuler
            </Button>
            <Button
              onClick={addInventory}
              className="rounded-full bg-emerald-600 hover:bg-emerald-700"
            >
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
