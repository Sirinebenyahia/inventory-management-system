'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion } from 'framer-motion';

type Order = {
  id: string;
  destination: string;
  state: number;        // 0: pending, 1: validated, 2: refused
  created_at: string;
};

const stateLabel = (s: number) =>
  s === 1 ? 'Validée' : s === 2 ? 'Refusée' : 'En attente';

const stateChip = (s: number) => {
  const base =
    'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold';
  if (s === 1) return `${base} bg-green-100 text-green-700`;
  if (s === 2) return `${base} bg-red-100 text-red-700`;
  return `${base} bg-yellow-100 text-yellow-700`;
};

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<'all' | '0' | '1' | '2'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/orders', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    return orders
      .filter((o) =>
        status === 'all' ? true : String(o.state) === status
      )
      .filter((o) =>
        q.trim()
          ? o.destination.toLowerCase().includes(q.toLowerCase()) ||
            stateLabel(o.state).toLowerCase().includes(q.toLowerCase())
          : true
      )
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
  }, [orders, q, status]);

  return (
    <div className="min-h-screen w-full">
      {/* HERO */}
      <section
        className="relative px-6 py-10 text-white"
        style={{
          background:
            'linear-gradient(120deg,#1256a0 0%, #1f75d1 45%, #b91c1c 100%)',
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            boxShadow:
              'inset 0 40px 80px rgba(0,0,0,.12), inset 0 -40px 80px rgba(0,0,0,.12)',
          }}
        />
        <div className="max-w-6xl mx-auto relative">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-wide">
            Mes commandes
          </h1>
          <p className="opacity-90 mt-1">
            Consultez, filtrez et accédez aux détails des commandes.
          </p>
        </div>
      </section>

      {/* CONTENT */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 -mt-8 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl border border-gray-100 p-4 md:p-6"
        >
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between mb-4">
            <div className="flex gap-2">
              <button
                className={`px-3 py-1.5 rounded-full text-sm ${
                  status === 'all'
                    ? 'bg-[#1256a0] text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
                onClick={() => setStatus('all')}
              >
                Tous
              </button>
              <button
                className={`px-3 py-1.5 rounded-full text-sm ${
                  status === '0'
                    ? 'bg-yellow-500 text-white'
                    : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                }`}
                onClick={() => setStatus('0')}
              >
                En attente
              </button>
              <button
                className={`px-3 py-1.5 rounded-full text-sm ${
                  status === '1'
                    ? 'bg-green-600 text-white'
                    : 'bg-green-100 text-green-800 hover:bg-green-200'
                }`}
                onClick={() => setStatus('1')}
              >
                Validées
              </button>
              <button
                className={`px-3 py-1.5 rounded-full text-sm ${
                  status === '2'
                    ? 'bg-red-600 text-white'
                    : 'bg-red-100 text-red-800 hover:bg-red-200'
                }`}
                onClick={() => setStatus('2')}
              >
                Refusées
              </button>
            </div>

            <div className="relative">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Rechercher (destination, statut)…"
                className="w-full md:w-80 rounded-full border border-gray-200 shadow-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#1f75d1]"
              />
            </div>
          </div>

          {/* Table */}
          <div className="mt-2 bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="max-h-[60vh] overflow-auto">
              <table className="w-full border-collapse">
                <thead className="bg-gray-50 text-gray-700 sticky top-0 z-10">
                  <tr>
                    <th className="border-b p-3 text-left">Destination</th>
                    <th className="border-b p-3 text-left">Statut</th>
                    <th className="border-b p-3 text-left">Date</th>
                    <th className="border-b p-3 text-left">Actions</th>
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
                      <td colSpan={4} className="p-6 text-center text-gray-500">
                        Aucune commande trouvée.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((order) => (
                      <tr
                        key={order.id}
                        className="hover:bg-gray-50 transition-all duration-150"
                      >
                        <td className="border-b p-3">{order.destination}</td>
                        <td className="border-b p-3">
                          <span className={stateChip(order.state)}>
                            {stateLabel(order.state)}
                          </span>
                        </td>
                        <td className="border-b p-3">
                          {format(
                            new Date(order.created_at),
                            'dd/MM/yyyy HH:mm',
                            { locale: fr }
                          )}
                        </td>
                        <td className="border-b p-3">
                          <button
                            className="text-[#1256a0] hover:underline font-medium"
                            onClick={() => router.push(`/orders/${order.id}`)}
                          >
                            Voir détails
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
