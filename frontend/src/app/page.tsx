'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function HomePage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  // Rediriger si déjà connecté
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) router.replace('/dashboard');
    else setChecking(false);
  }, [router]);

  if (checking) return null;

  return (
    <div className="min-h-screen w-full text-white bg-[#0b2f57]">
      {/* ================= HERO ================= */}
      <section
        className="relative flex items-center justify-center text-center px-6 py-28"
        style={{
          background:
            'linear-gradient(120deg,#1256a0 0%, #1f75d1 45%, #b91c1c 100%)',
        }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{
          boxShadow:
            'inset 0 60px 120px rgba(0,0,0,.15), inset 0 -60px 120px rgba(0,0,0,.15)',
        }} />
        <div className="max-w-5xl mx-auto relative">
          <motion.h1
            initial={{ opacity: 0, y: -18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-[44px] sm:text-[56px] md:text-[72px] font-extrabold leading-tight tracking-tight"
          >
            
            <span className="text-transparent bg-clip-text"
              style={{ backgroundImage: 'linear-gradient(90deg,#ffffff,#f5f5f5)' }}>
              InventoryApp
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: .2, duration: .6 }}
            className="mt-5 text-lg md:text-xl opacity-90"
          >
            Gérez vos stocks, articles et commandes en temps réel.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: .35, duration: .6 }}
            className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button
              onClick={() => router.push('/login')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black font-semibold shadow hover:bg-gray-200 transition"
            >
              🚀 Se connecter
            </button>
            <button
              onClick={() => router.push('/signup')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/80 hover:bg-white hover:text-black transition"
            >
              📝 Créer un compte
            </button>
          </motion.div>
        </div>
      </section>

      {/* ============== DÉCOUVERTE / PITCH ================= */}
      <section className="relative bg-[#2c5c83] bg-opacity-80 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white text-[#0b2f57] rounded-2xl shadow-2xl p-8 md:p-10 flex flex-col md:flex-row gap-8">
            <div className="flex-1">
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
                <span className="mr-2">📦</span> Découvrez{' '}
                <span className="text-[#1f75d1]">InventoryApp</span>
              </h2>
              <p className="text-[15px] leading-7 opacity-90">
                InventoryApp centralise vos <b>inventaires</b>, <b>articles</b>,
                <b> commandes</b> et <b>utilisateurs</b> dans une interface simple,
                rapide et sécurisée. Suivez les niveaux de stock, recevez des
                alertes de seuil, gérez vos mouvements et analysez vos performances
                via des rapports clairs.
              </p>
              <p className="mt-4 text-[15px] leading-7 opacity-90">
                Import/export CSV, API REST et tableaux de bord en temps réel
                vous aident à garder le contrôle et à gagner du temps.
              </p>
            </div>

            {/* Badges modules */}
            <div className="flex-1 grid grid-cols-2 gap-3 content-start">
              {[
                '📦 Inventaires',
                '🏷️ Articles',
                '🧾 Commandes',
                '👥 Utilisateurs',
                '🔔 Alertes stock',
                '📈 Rapports',
              ].map((b) => (
                <span
                  key={b}
                  className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-[#1256a0] text-white shadow"
                >
                  {b}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================== FONCTIONNALITÉS ================== */}
      <section className="relative py-12 px-4"
        style={{
          background:
            'rgba(24,69,110,.85)',
        }}>
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl md:text-4xl font-extrabold text-center mb-8">
            Fonctionnalités essentielles :
          </h3>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: 'Suivi de stock en temps réel',
                points: [
                  'Réservations et mouvements',
                  'Seuils et alertes de rupture',
                  'Historique par item & entrepôt',
                ],
                icon: '📊',
              },
              {
                title: 'Gestion des articles',
                points: [
                  'Variantes (taille, couleur, etc.)',
                  'Codes barres & SKU',
                  'Import/export CSV rapide',
                ],
                icon: '🏷️',
              },
              {
                title: 'Commandes & préparations',
                points: [
                  'Création et suivi des commandes',
                  'Statuts & validations',
                  'Historique Admin Orders',
                ],
                icon: '🧾',
              },
              {
                title: 'Inventaires & audits',
                points: [
                  'Comptages cycliques',
                  'Écarts et ajustements',
                  'Journal d’audit détaillé',
                ],
                icon: '📦',
              },
              {
                title: 'Utilisateurs & rôles',
                points: [
                  'Admins, opérateurs, viewers',
                  'Permissions fines par module',
                  'SSO / token JWT',
                ],
                icon: '👥',
              },
              {
                title: 'Rapports & KPI',
                points: [
                  'Export PDF/CSV',
                  'Tops ruptures / rotation',
                  'Performance opérationnelle',
                ],
                icon: '📈',
              },
            ].map((card) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: .5 }}
                className="bg-white/95 text-[#0b2f57] rounded-2xl shadow-xl p-6"
              >
                <div className="text-3xl mb-2">{card.icon}</div>
                <h4 className="text-xl font-extrabold mb-3">{card.title}</h4>
                <ul className="list-disc ml-5 space-y-2 text-[15px]">
                  {card.points.map((p) => <li key={p}>{p}</li>)}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================== SÉCURITÉ ================== */}
      <section className="relative py-14 px-4 bg-[#1b4167]">
        <div className="max-w-5xl mx-auto bg-white/95 text-[#0b2f57] rounded-2xl shadow-2xl p-8">
          <h3 className="text-2xl md:text-3xl font-extrabold text-center mb-6">
            🔐 Sécurité et Accès Multi‑Profils
          </h3>
          <div className="grid md:grid-cols-2 gap-6 text-[15px]">
            <ul className="list-disc ml-5 space-y-2">
              <li>Authentification par token (JWT)</li>
              <li>Traçabilité des actions (audit)</li>
              <li>Chiffrement & conformité RGPD</li>
            </ul>
            <ul className="list-disc ml-5 space-y-2">
              <li>Rôles & permissions par module</li>
              <li>Contrôles d’accès granulaires</li>
              <li>Exports et partages sécurisés</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ================== FOOTER ================== */}
<footer className="bg-[#0e3761] py-6 px-4 text-center text-sm opacity-90">
  <p>InventoryApp © {new Date().getFullYear()} — Aide · Documentation · Contact</p>
  <p className="mt-1 text-xs opacity-75">Développé par Sirine Ben Yahia</p>
</footer>
    </div>
  );
}
