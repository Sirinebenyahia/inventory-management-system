'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // ✅ App Router
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

export default function Signup() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accept, setAccept] = useState(false);

  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};

    if (!/^[A-Za-z0-9@._-]{2,20}$/.test(username)) {
      e.username =
        'Username: 2–20 caractères (lettres/chiffres) et @ . _ - autorisés.';
    }

    if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
        password
      )
    ) {
      e.password =
        'Mot de passe: min 8, 1 majuscule, 1 chiffre, 1 symbole.';
    }

    if (password !== confirmPassword) {
      e.confirmPassword = 'Les mots de passe ne correspondent pas.';
    }

    if (!accept) {
      e.accept = 'Vous devez accepter les conditions.';
    }

    return e;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;

    try {
      setLoading(true);
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors({ server: data.error || 'Erreur côté serveur' });
      } else {
        // Inscription OK → vers login
        router.replace('/login');
      }
    } catch {
      setErrors({ server: 'Erreur de connexion au serveur.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="min-h-screen w-full relative flex items-center justify-center px-4"
      style={{
        background:
          'linear-gradient(120deg,#1256a0 0%, #1f75d1 45%, #b91c1c 100%)',
      }}
    >
      {/* Ombres internes pour matcher le hero */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          boxShadow:
            'inset 0 60px 120px rgba(0,0,0,.15), inset 0 -60px 120px rgba(0,0,0,.15)',
        }}
      />

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-lg rounded-2xl bg-white/95 backdrop-blur text-[#0b2f57] shadow-2xl p-7"
      >
        {/* Titre */}
        <h1 className="text-3xl font-extrabold text-center">
          Créer un compte{' '}
          <span
            className="text-transparent bg-clip-text"
            style={{ backgroundImage: 'linear-gradient(90deg,#1f75d1,#1256a0)' }}
          >
            InventoryApp
          </span>
        </h1>
        <p className="mt-2 text-center text-sm text-[#0b2f57]/80">
          Unifiez vos inventaires, articles et commandes.
        </p>

        <div className="mt-6 space-y-4">
          <div>
            <Label htmlFor="username">Nom d’utilisateur</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ex: sbYahia"
              required
            />
            {errors.username && (
              <p className="text-red-600 text-sm mt-1">{errors.username}</p>
            )}
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="vous@entreprise.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="password">Mot de passe</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
              >
                {showPwd ? 'Masquer' : 'Afficher'}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-600 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="pr-12"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
              >
                {showConfirm ? 'Masquer' : 'Afficher'}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-600 text-sm mt-1">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2">
              <Checkbox
                id="accept"
                checked={accept}
                onCheckedChange={(c) => setAccept(!!c)}
              />
              <span>J’accepte les conditions d’utilisation</span>
            </label>
            {errors.accept && (
              <span className="text-red-600">{errors.accept}</span>
            )}
          </div>

          {errors.server && (
            <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded p-2">
              {errors.server}
            </p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#1256a0] hover:bg-[#0e4d92]"
          >
            {loading ? 'Création…' : 'Créer mon compte'}
          </Button>
        </div>

        {/* Divider */}
        <div className="my-5 h-px bg-gray-200" />

        {/* CTA secondaire */}
        <div className="text-center text-sm">
          Déjà un compte ?{' '}
          <button
            type="button"
            onClick={() => router.push('/login')}
            className="font-semibold text-[#1256a0] hover:underline"
          >
            Se connecter
          </button>
        </div>
      </motion.form>
    </main>
  );
}
