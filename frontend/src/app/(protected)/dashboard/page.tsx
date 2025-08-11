"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

type RecentOrder = { id: string; destination: string; status: number; created_at: string };
type LowStock = { id: string; name: string; stock: number; threshold: number; image_url?: string };
type Stats = { items: number; inventories: number; ordersPending: number; ordersValidated: number; alerts: number };

export default function Dashboard() {
  const router = useRouter();

  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [lowStock, setLowStock] = useState<LowStock[]>([]);
  const [loading, setLoading] = useState(true);

  // Contact info
  const CONTACT_NAME = "Sirine Ben Yahia";
  const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "sirine@votre-domaine.tn"; // ← change si besoin

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      router.replace("/login");
      return;
    }

    const ctrl = new AbortController();

    fetch("/api/dashboard", {
      headers: { Authorization: `Bearer ${token}` },
      signal: ctrl.signal,
    })
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json().catch(() => ({})))?.error || "API error");
        return r.json();
      })
      .then((data) => {
        setStats(data.stats);
        setRecentOrders(data.recentOrders || []);
        setLowStock(data.lowStock || []);
      })
      .catch((e: any) => {
        if (e.name === "AbortError") return;
        console.error(e);
        router.replace("/login");
      })
      .finally(() => setLoading(false));

    return () => ctrl.abort();
  }, [router]);

  const kpis = useMemo(
    () => [
      { label: "Articles", value: stats?.items ?? 0 },
      { label: "Alertes stock", value: stats?.alerts ?? 0, tone: "danger" },
      { label: "Cmd. en attente", value: stats?.ordersPending ?? 0 },
      { label: "Cmd. validées", value: stats?.ordersValidated ?? 0, tone: "success" },
      { label: "Inventaires", value: stats?.inventories ?? 0 },
    ],
    [stats]
  );

  return (
    <div className="p-6 space-y-6">
      {/* 🔹 Bloc Contact / Développé par */}
<Card className="p-5 bg-gradient-to-r from-blue-600 via-blue-500 to-red-500 text-white shadow-lg rounded-2xl">
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
    <div className="flex items-center gap-4">
      <div className="h-12 w-12 rounded-full bg-white/20 text-white grid place-items-center font-bold shadow">
        S
      </div>
      <div>
        <h3 className="text-lg font-semibold">
          Sirine Ben Yahia
        </h3>
        <p className="text-sm opacity-90">
          Pour toute information, veuillez contacter.
        </p>
        <p className="text-xs italic opacity-75">
          Développé par Sirine Ben Yahia
        </p>
      </div>
    </div>
    <div className="flex items-center gap-3">
      <Button asChild variant="secondary" className="rounded-full bg-white text-blue-600 hover:bg-gray-200">
        <a href="tel:28490595">
          📞 Appeler : 28490595
        </a>
      </Button>
    </div>
  </div>
</Card>

      {/* 🔹 Header principal */}
      <header className="rounded-2xl p-6 bg-gradient-to-r from-blue-600 via-blue-500 to-red-500 text-white shadow">
        <h1 className="text-3xl font-extrabold">Tableau de bord</h1>
        <p className="opacity-90">Vue d’ensemble des stocks, commandes et inventaires.</p>
      </header>

      {/* 🔹 KPIs */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpis.map((k, i) => (
          <Card key={i} className="p-4">
            <div className="text-sm text-muted-foreground">{k.label}</div>
            <div
              className={`text-3xl font-bold ${
                k.tone === "danger"
                  ? "text-red-600"
                  : k.tone === "success"
                  ? "text-green-600"
                  : ""
              }`}
            >
              {loading ? "—" : k.value}
            </div>
          </Card>
        ))}
      </section>

      {/* 🔹 Tableau des commandes récentes */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Commandes */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Dernières commandes</h2>
            <Button variant="outline" size="sm" onClick={() => router.push("/orders")}>
              Voir tout
            </Button>
          </div>
          <div className="rounded-lg overflow-hidden border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3">Destination</th>
                  <th className="text-left p-3">Statut</th>
                  <th className="text-left p-3">Date</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {(loading ? Array.from({ length: 5 }) : recentOrders).map((o: any, idx: number) => (
                  <tr key={o?.id ?? idx} className="border-t">
                    <td className="p-3">{loading ? "…" : o.destination}</td>
                    <td className="p-3">
                      {loading ? "…" : (
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            o.status === 1
                              ? "bg-green-100 text-green-700"
                              : o.status === 0
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {o.status === 1 ? "Validée" : o.status === 0 ? "En attente" : "Refusée"}
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      {loading ? "…" : new Date(o.created_at).toLocaleString()}
                    </td>
                    <td className="p-3 text-right">
                      {!loading && (
                        <Button variant="ghost" size="sm" onClick={() => router.push(`/orders/${o.id}`)}>
                          Voir
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!loading && recentOrders.length === 0 && (
              <div className="p-4 text-center text-muted-foreground">Aucune commande récente.</div>
            )}
          </div>
        </Card>

        {/* Alertes stock */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Alertes de stock (sous seuil)</h2>
            <Button variant="outline" size="sm" onClick={() => router.push("/items")}>
              Gérer
            </Button>
          </div>
          <div className="rounded-lg overflow-hidden border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3">Article</th>
                  <th className="text-left p-3">Stock</th>
                  <th className="text-left p-3">Seuil</th>
                </tr>
              </thead>
              <tbody>
                {(loading ? Array.from({ length: 5 }) : lowStock).map((it: any, idx: number) => (
                  <tr key={it?.id ?? idx} className="border-t">
                    <td className="p-3 flex items-center gap-2">
                      {loading ? "…" : (
                        <>
                          {it.image_url ? (
                            <img src={it.image_url} className="w-8 h-8 rounded object-cover" alt="" />
                          ) : (
                            <div className="w-8 h-8 rounded bg-muted" />
                          )}
                          <span>{it.name}</span>
                        </>
                      )}
                    </td>
                    <td className="p-3">{loading ? "…" : it.stock}</td>
                    <td className="p-3">{loading ? "…" : it.threshold}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!loading && lowStock.length === 0 && (
              <div className="p-4 text-center text-muted-foreground">Aucune alerte de stock 🎉</div>
            )}
          </div>
        </Card>
      </section>
    </div>
  );
}
