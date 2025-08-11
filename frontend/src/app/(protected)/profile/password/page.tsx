'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

type UserInfo = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  role: string;
};

export default function ChangePasswordPage() {
  const router = useRouter();

  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // ===== Fetch user info
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const res = await fetch('/api/users/me', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (!res.ok) throw new Error('Erreur lors du chargement.');
        setUserInfo(await res.json());
      } catch {
        setError("Impossible de récupérer les informations.");
      }
    };
    fetchUserInfo();
  }, []);

  // ===== Password strength (simple heuristique)
  const strength = useMemo(() => {
    let s = 0;
    if (newPassword.length >= 8) s++;
    if (/[A-Z]/.test(newPassword)) s++;
    if (/[0-9]/.test(newPassword)) s++;
    if (/[@$!%*?&]/.test(newPassword)) s++;
    return s; // 0..4
  }, [newPassword]);

  const strengthLabel =
    ['Très faible', 'Faible', 'Moyen', 'Bon', 'Excellent'][strength];

  const strengthColor =
    ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-emerald-600'][strength];

  // ===== Submit
  const handleChangePassword = async () => {
    setError('');
    setSuccess('');

    if (!newPassword || !confirm) {
      setError('Veuillez remplir tous les champs.');
      return;
    }
    if (newPassword !== confirm) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    // règle minimale de sécurité
    if (strength < 3) {
      setError('Mot de passe trop faible (8+ caractères, majuscule, chiffre, symbole).');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/users/password', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ newPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Une erreur est survenue.');
        return;
      }

      setSuccess('Mot de passe mis à jour !');
      setNewPassword('');
      setConfirm('');

      setTimeout(() => router.push('/dashboard'), 1200);
    } catch {
      setError('Erreur réseau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full">
      {/* HERO bandeau */}
      <section
        className="relative px-6 py-10 text-white"
        style={{ background: 'linear-gradient(120deg,#1256a0 0%, #1f75d1 45%, #b91c1c 100%)' }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ boxShadow: 'inset 0 40px 80px rgba(0,0,0,.12), inset 0 -40px 80px rgba(0,0,0,.12)' }}
        />
        <div className="max-w-4xl mx-auto relative">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-wide">
            Profil & Sécurité
          </h1>
          <p className="opacity-90 mt-1">Mettez à jour votre mot de passe.</p>
        </div>
      </section>

      {/* Contenu */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 -mt-8 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl border border-gray-100 p-6 md:p-7"
        >
          {/* Carte infos utilisateur */}
          {userInfo && (
            <div className="mb-6 grid md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <h3 className="font-bold text-[#0b2f57] mb-2">Informations</h3>
                <div className="text-sm space-y-1 text-gray-700">
                  <p><span className="font-medium">Nom :</span> {userInfo.lastName}</p>
                  <p><span className="font-medium">Prénom :</span> {userInfo.firstName}</p>
                  <p><span className="font-medium">Email :</span> {userInfo.email}</p>
                  <p><span className="font-medium">Téléphone :</span> {userInfo.phoneNumber || '-'}</p>
                  <p><span className="font-medium">Rôle :</span> {userInfo.role}</p>
                </div>
              </div>

              {/* Conseils de sécurité */}
              <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                <h3 className="font-bold text-[#0b2f57] mb-2">Conseils de sécurité</h3>
                <ul className="list-disc ml-5 text-sm text-[#0b2f57]/90 space-y-1">
                  <li>Minimum 8 caractères</li>
                  <li>Au moins une majuscule, un chiffre et un symbole</li>
                  <li>Évitez les mots de passe réutilisés</li>
                </ul>
              </div>
            </div>
          )}

          {/* Formulaire */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="col-span-1">
              <label htmlFor="new-password" className="block mb-2 font-medium">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <input
                  id="new-password"
                  type={showPwd ? 'text' : 'password'}
                  placeholder="Nouveau mot de passe"
                  autoComplete="new-password"
                  className="w-full border rounded-xl p-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1f75d1] border-gray-200 pr-24"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
                >
                  {showPwd ? 'Masquer' : 'Afficher'}
                </button>
              </div>

              {/* Barre de force */}
              <div className="mt-2">
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-2 ${strengthColor}`}
                    style={{ width: `${(strength / 4) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600 mt-1">Force : {strengthLabel}</p>
              </div>
            </div>

            <div className="col-span-1">
              <label htmlFor="confirm-password" className="block mb-2 font-medium">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <input
                  id="confirm-password"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Confirmer le mot de passe"
                  autoComplete="new-password"
                  className="w-full border rounded-xl p-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1f75d1] border-gray-200 pr-24"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
                >
                  {showConfirm ? 'Masquer' : 'Afficher'}
                </button>
              </div>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
              {error}
            </p>
          )}
          {success && (
            <p className="mt-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded p-2">
              {success}
            </p>
          )}

          {/* Actions */}
          <div className="mt-5 flex justify-end">
            <Button
              onClick={handleChangePassword}
              disabled={loading}
              className="rounded-full bg-[#1256a0] hover:bg-[#0e4d92] px-6"
            >
              {loading ? 'Traitement…' : 'Valider'}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
