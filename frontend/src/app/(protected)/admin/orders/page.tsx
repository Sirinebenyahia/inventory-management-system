"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

type Order = {
  id: string;
  destination: string;
  state: number;        // 0=en attente, 1=validée, 2=refusée
  created_at: string;
};

const stateBadge = (state: number) => {
  const common =
    "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold";
  switch (state) {
    case 0:
      return (
        <span className={`${common} bg-yellow-100 text-yellow-800`}>
          <span className="h-2 w-2 rounded-full bg-yellow-500" /> En attente
        </span>
      );
    case 1:
      return (
        <span className={`${common} bg-green-100 text-green-800`}>
          <span className="h-2 w-2 rounded-full bg-green-500" /> Validée
        </span>
      );
    case 2:
      return (
        <span className={`${common} bg-red-100 text-red-700`}>
          <span className="h-2 w-2 rounded-full bg-red-500" /> Refusée
        </span>
      );
    default:
      return <span className={`${common} bg-gray-100 text-gray-700`}>Inconnu</span>;
  }
};

export default function AdminOrdersPage() {
  const router = useRouter();

  // UI state
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // outils
  const token = () => localStorage.getItem("token") || "";

  // filtres
  const [tab, setTab] = useState<0 | 1 | 2>(0); // on reste focus “à traiter”, mais tu peux naviguer
  const [q, setQ] = useState("");

  const fetchOrders = async (state: 0 | 1 | 2) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/orders?state=${state}`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      const data = await res.json();
      if (Array.isArray(data)) setOrders(data);
      else setError("Réponse serveur invalide.");
    } catch (e) {
      setError("Erreur de chargement.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(tab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return orders;
    return orders.filter((o) =>
      [o.destination, new Date(o.created_at).toLocaleString()]
        .join(" ")
        .toLowerCase()
        .includes(s)
    );
  }, [orders, q]);

  const declineOrder = async (id: string) => {
    const res = await fetch(`/api/orders/${id}/decline`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token()}` },
    });
    if (res.ok) {
      setOrders((prev) => prev.filter((o) => o.id !== id));
    } else {
      alert("Erreur lors du refus de la commande.");
    }
  };

  return (
    <div className="min-h-screen w-full">
      {/* HERO */}
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
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-wide">
            Commandes à traiter
          </h1>
          <p className="opacity-90 mt-1">
            Consultez, filtrez et accédez au traitement des commandes.
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
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
              <div className="flex items-center gap-2">
                {(
                  [
                    { key: 0, label: "En attente" },
                    { key: 1, label: "Validées" },
                    { key: 2, label: "Refusées" },
                  ] as const
                ).map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setTab(key)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition shadow-sm ${
                      tab === key
                        ? "bg-[#1256a0] text-white"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="relative flex-1 md:max-w-sm md:ml-auto">
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="🔍 Rechercher (destination, date)…"
                  className="rounded-full border border-gray-200 shadow-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#1f75d1]"
                />
              </div>

              <Button
                onClick={() => fetchOrders(tab)}
                variant="outline"
                className="rounded-full"
              >
                ↻ Actualiser
              </Button>
            </div>

            {/* Table */}
            {error && (
              <p className="text-red-600 mb-3 bg-red-50 border border-red-200 rounded px-3 py-2">
                {error}
              </p>
            )}

            <div className="max-h-[60vh] overflow-auto border border-gray-100 rounded-xl">
              <table className="w-full border-collapse">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr className="text-gray-700 text-sm">
                    <th className="p-3 text-left">Destination</th>
                    <th className="p-3 text-left">Statut</th>
                    <th className="p-3 text-left">Date</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-gray-500">
                        Chargement…
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-gray-500 italic">
                        {tab === 0
                          ? "✅ Aucune commande en attente."
                          : "Aucune commande."}
                      </td>
                    </tr>
                  ) : (
                    filtered.map((o, i) => (
                      <tr
                        key={o.id}
                        className={`transition-colors ${
                          i % 2 ? "bg-white" : "bg-gray-50"
                        } hover:bg-gray-100/60`}
                      >
                        <td className="p-3">{o.destination}</td>
                        <td className="p-3">{stateBadge(o.state)}</td>
                        <td className="p-3">
                          {new Date(o.created_at).toLocaleString()}
                        </td>
                        <td className="p-3 text-right">
                          <div className="inline-flex gap-2">
                            <Button
                              className="rounded-full bg-[#1256a0] hover:bg-[#0e4d92]"
                              onClick={() =>
                                router.push(`/admin/orders/${o.id}/process`)
                              }
                            >
                              Traiter
                            </Button>
                            {o.state === 0 && (
                              <Button
                                variant="destructive"
                                className="rounded-full"
                                onClick={() => declineOrder(o.id)}
                              >
                                Refuser
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
