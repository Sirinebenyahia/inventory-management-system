"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Package } from "lucide-react";

// ➜ ajuste ce type si ton route handler diffère,
//   mais ça devrait coller à ce que tu utilises déjà
type OrderItem = {
  quantity: number;
  item?: { name?: string } | null;
};

type GetOrderByIDResponse = {
  id: string;
  destination: string;
  state: number; // 0 en attente, 1 validée, 2 refusée
  created_at: string; // ISO string
  orderItems: OrderItem[];
};

const stateConfig: Record<
  number,
  { label: string; chip: string; dot: string; text: string }
> = {
  0: {
    label: "En attente",
    chip: "bg-yellow-100 text-yellow-800 ring-1 ring-yellow-200",
    dot: "bg-yellow-500",
    text: "text-yellow-800",
  },
  1: {
    label: "Validée",
    chip: "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200",
    dot: "bg-emerald-500",
    text: "text-emerald-800",
  },
  2: {
    label: "Refusée",
    chip: "bg-rose-100 text-rose-800 ring-1 ring-rose-200",
    dot: "bg-rose-500",
    text: "text-rose-800",
  },
};

export default function OrderDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<GetOrderByIDResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/orders/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Échec du chargement de la commande");
        const data = (await res.json()) as GetOrderByIDResponse;
        if (mounted) {
          setOrder(data);
          setErr(null);
        }
      } catch (e: any) {
        if (mounted) setErr(e?.message ?? "Erreur inconnue");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchOrder();
    return () => {
      mounted = false;
    };
  }, [id]);

  const status = useMemo(() => {
    if (!order) return stateConfig[0];
    return stateConfig[order.state] ?? stateConfig[0];
  }, [order]);

  return (
    <div className="min-h-screen w-full">
      {/* ===== HERO BAND ===== */}
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
        <div className="max-w-5xl mx-auto relative">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 rounded-full bg-white/15 hover:bg-white/25 px-3 py-1.5 text-sm transition"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </button>
            <span className="ml-2 rounded-full px-2.5 py-1 text-xs font-semibold bg-white/15">
              Commande #{id?.toString().slice(0, 8)}
            </span>
          </div>

          <h1 className="mt-4 text-3xl md:text-4xl font-extrabold tracking-wide">
            Détails de la commande
          </h1>
          <p className="opacity-90 mt-1">
            Consultez la destination, le statut, la date et les items demandés.
          </p>
        </div>
      </section>

      {/* ===== CONTENT CARD ===== */}
      <div className="max-w-5xl mx-auto px-4 md:px-6 -mt-8 pb-16">
        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl border border-gray-100 p-6 md:p-8">
          {/* Loading */}
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-6 w-56 bg-gray-200 rounded"></div>
              <div className="h-4 w-80 bg-gray-200 rounded"></div>
              <div className="h-4 w-64 bg-gray-200 rounded"></div>
              <div className="h-4 w-72 bg-gray-200 rounded"></div>
              <div className="mt-6 h-40 w-full bg-gray-100 rounded-xl"></div>
            </div>
          ) : err ? (
            <p className="text-red-600">{err}</p>
          ) : !order ? (
            <p className="text-gray-500">Commande introuvable.</p>
          ) : (
            <>
              {/* Info header */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="rounded-xl border border-gray-100 p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Destination
                  </p>
                  <p className="mt-1 text-lg font-semibold text-[#0b2f57]">
                    {order.destination}
                  </p>
                </div>

                <div className="rounded-xl border border-gray-100 p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Statut
                  </p>
                  <span
                    className={`mt-1 inline-flex items-center gap-2 w-fit rounded-full px-3 py-1 text-sm font-medium ${status.chip}`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${status.dot}`}
                    ></span>
                    {status.label}
                  </span>
                </div>

                <div className="rounded-xl border border-gray-100 p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Date
                  </p>
                  <p className="mt-1 text-lg font-semibold text-[#0b2f57]">
                    {order.created_at
                      ? new Date(order.created_at).toLocaleString()
                      : "—"}
                  </p>
                </div>
              </div>

              {/* Items list */}
              <div className="mt-8">
                <h2 className="text-lg md:text-xl font-extrabold mb-3 flex items-center gap-2 text-[#0b2f57]">
                  <Package className="h-5 w-5" />
                  Items demandés
                </h2>

                {order.orderItems?.length ? (
                  <div className="overflow-hidden rounded-xl border border-gray-100">
                    <table className="w-full">
                      <thead className="bg-gray-50 text-gray-700">
                        <tr>
                          <th className="text-left p-3">Article</th>
                          <th className="text-left p-3 w-40">Quantité</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.orderItems.map((oi, i) => (
                          <tr
                            key={i}
                            className={i % 2 ? "bg-white" : "bg-gray-50/60"}
                          >
                            <td className="p-3">
                              {oi.item?.name ?? (
                                <span className="italic text-gray-500">
                                  Inconnu
                                </span>
                              )}
                            </td>
                            <td className="p-3">
                              <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-sm font-medium text-gray-800">
                                {oi.quantity} unité(s)
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">
                    Aucun item n’est associé à cette commande.
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
