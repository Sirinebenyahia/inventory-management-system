"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

type UserLite = {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
};

type Order = {
  id: string;
  destination: string;
  state: number;        // 1 = validée, 2 = refusée
  created_at: string;
  posted_by: string;
  processedBy: UserLite | null;
};

const badge = (state: number) => {
  const base = "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold";
  if (state === 1)
    return (
      <span className={`${base} bg-green-100 text-green-800`}>
        <span className="h-2 w-2 rounded-full bg-green-500" />
        Validée
      </span>
    );
  if (state === 2)
    return (
      <span className={`${base} bg-red-100 text-red-700`}>
        <span className="h-2 w-2 rounded-full bg-red-500" />
        Refusée
      </span>
    );
  return <span className={`${base} bg-gray-100 text-gray-700`}>Inconnu</span>;
};

export default function OrderHistoryPage() {
  // filters
  const [tab, setTab] = useState<0 | 1 | 2>(0); // 0=Tout, 1=Validées, 2=Refusées
  const [q, setQ] = useState("");

  // data
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const token = () => localStorage.getItem("token") || "";

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      // l’API accepte state=1,2 pour l’historique
      const res = await fetch("/api/orders?state=1,2", {
        headers: { Authorization: `Bearer ${token()}` },
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        // on garde seulement validées/refusées par sécurité
        setOrders(data.filter((o: Order) => o.state === 1 || o.state === 2));
      } else {
        setError("Format de données inattendu.");
      }
    } catch (e) {
      setError("Erreur lors du chargement.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const displayed = useMemo(() => {
    let arr = orders;
    if (tab === 1) arr = arr.filter((o) => o.state === 1);
    if (tab === 2) arr = arr.filter((o) => o.state === 2);
    const s = q.trim().toLowerCase();
    if (!s) return arr;
    return arr.filter((o) =>
      [
        o.destination,
        new Date(o.created_at).toLocaleString(),
        o.posted_by,
        (o.processedBy?.firstName ?? "") +
          " " +
          (o.processedBy?.lastName ?? "") +
          " " +
          (o.processedBy?.email ?? ""),
      ]
        .join(" ")
        .toLowerCase()
        .includes(s)
    );
  }, [orders, tab, q]);

  const exportCSV = () => {
    const header = [
      "Destination",
      "Statut",
      "Date",
      "Créée par",
      "Traitée par",
    ];
    const rows = displayed.map((o) => [
      o.destination,
      o.state === 1 ? "Validée" : "Refusée",
      new Date(o.created_at).toLocaleString(),
      o.posted_by,
      o.processedBy
        ? `${o.processedBy.firstName ?? ""} ${o.processedBy.lastName ?? ""}`.trim() ||
          o.processedBy.email ||
          ""
        : "",
    ]);
    const csv =
      [header, ...rows].map((r) =>
        r.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")
      ).join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `historique_commandes_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
            Historique des commandes traitées
          </h1>
          <p className="opacity-90 mt-1">
            Visualisez les commandes validées ou refusées, filtrez, exportez.
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
                    { key: 0, label: "Tout" },
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
                  placeholder="🔍 Rechercher (dest, date, auteur, traiteur)…"
                  className="rounded-full border border-gray-200 shadow-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#1f75d1]"
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="rounded-full" onClick={fetchOrders}>
                  ↻ Actualiser
                </Button>
                <Button className="rounded-full bg-emerald-600 hover:bg-emerald-700" onClick={exportCSV}>
                  ⬇️ Export CSV
                </Button>
              </div>
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
                    <th className="p-3 text-left">Créée par</th>
                    <th className="p-3 text-left">Traitée par</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-gray-500">
                        Chargement…
                      </td>
                    </tr>
                  ) : displayed.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-gray-500 italic">
                        Aucun historique pour le moment.
                      </td>
                    </tr>
                  ) : (
                    displayed.map((o, i) => (
                      <tr
                        key={o.id}
                        className={`transition-colors ${
                          i % 2 ? "bg-white" : "bg-gray-50"
                        } hover:bg-gray-100/60`}
                      >
                        <td className="p-3">{o.destination}</td>
                        <td className="p-3">{badge(o.state)}</td>
                        <td className="p-3">{new Date(o.created_at).toLocaleString()}</td>
                        <td className="p-3">{o.posted_by}</td>
                        <td className="p-3">
                          {o.processedBy
                            ? (
                                `${o.processedBy.firstName ?? ""} ${o.processedBy.lastName ?? ""}`.trim() ||
                                o.processedBy.email ||
                                "—"
                              )
                            : <em>—</em>}
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
