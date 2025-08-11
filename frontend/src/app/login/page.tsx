'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Échec de connexion.');
      } else if (data.token) {
        localStorage.setItem('token', data.token);
        if (rememberMe) localStorage.setItem('remember', '1');
        router.replace('/dashboard');
      } else {
        setError('Token manquant dans la réponse du serveur.');
      }
    } catch {
      setError('Erreur de connexion au serveur.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="min-h-screen w-full relative flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(120deg,#1256a0 0%, #1f75d1 45%, #b91c1c 100%)' }}
    >
      {/* ombre douce top/bottom pour matcher le hero */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ boxShadow: 'inset 0 60px 120px rgba(0,0,0,.15), inset 0 -60px 120px rgba(0,0,0,.15)' }}
      />

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: .5 }}
        className="relative w-full max-w-md rounded-2xl bg-white/95 backdrop-blur text-[#0b2f57] shadow-2xl p-7"
      >
        {/* Titre */}
        <h1 className="text-3xl font-extrabold text-center">
          Connexion{' '}
          <span
            className="text-transparent bg-clip-text"
            style={{ backgroundImage: 'linear-gradient(90deg,#1f75d1,#1256a0)' }}
          >
            InventoryApp
          </span>
        </h1>
        <p className="mt-2 text-center text-sm text-[#0b2f57]/80">
          Accédez à vos inventaires, articles et commandes.
        </p>

        {/* Champs */}
        <div className="mt-6 space-y-4">
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
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(c) => setRememberMe(!!c)}
              />
              <span>Se souvenir de moi</span>
            </label>
            <a href="#" className="text-[#1f75d1] hover:underline">
              Mot de passe oublié ?
            </a>
          </div>

          {error && (
            <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded p-2">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#1256a0] hover:bg-[#0e4d92]"
          >
            {loading ? 'Connexion…' : 'Se connecter'}
          </Button>
        </div>

        {/* Divider */}
        <div className="my-5 h-px bg-gray-200" />

        {/* CTA secondaire */}
        <div className="text-center text-sm">
          Pas de compte ?{' '}
          <button
            type="button"
            onClick={() => router.push('/signup')}
            className="font-semibold text-[#1256a0] hover:underline"
          >
            Créer un compte
          </button>
        </div>
      </motion.form>
    </main>
  );
}
