'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import ImageUpload from '@/components/ui/ImageUpload';
import { Button } from '@/components/ui/button';

type Item = {
  id: string;
  name: string;
  desc: string;
  metadata: any;
  image_url?: string;
  createdBy: string;
  createdAt: string;
};

type FormState = {
  name: string;
  desc: string;
  metadata: string;
  image_url: string;
};

export default function ItemManager() {
  const [items, setItems] = useState<Item[]>([]);
  const [form, setForm] = useState<FormState>({
    name: '',
    desc: '',
    metadata: '',
    image_url: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [canSubmit, setCanSubmit] = useState(false);
  const [jsonError, setJsonError] = useState<string>('');

  useEffect(() => {
    fetchItems();
  }, []);

  const getToken = () => localStorage.getItem('token');

  const fetchItems = async () => {
    try {
      const token = getToken();
      const res = await fetch('/api/items', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur inconnue');
      setItems(data);
    } catch (error) {
      console.error('Erreur de chargement des items:', error);
      setItems([]);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));

    if (name === 'metadata') {
      // validate JSON live to enable/disable submit
      try {
        if (value.trim() !== '') JSON.parse(value);
        setJsonError('');
        setCanSubmit(true);
      } catch {
        setJsonError('JSON invalide');
        setCanSubmit(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = getToken();
      const parsedMetadata =
        form.metadata && !jsonError ? JSON.parse(form.metadata) : {};
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `/api/items/${editingId}` : '/api/items';

      await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name,
          desc: form.desc,
          metadata: parsedMetadata,
          image_url: form.image_url,
        }),
      });

      setForm({ name: '', desc: '', metadata: '', image_url: '' });
      setEditingId(null);
      setCanSubmit(false);
      setJsonError('');
      fetchItems();
    } catch (error) {
      console.error("Erreur d'envoi:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const token = getToken();
      await fetch(`/api/items/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchItems();
    } catch (error) {
      console.error('Erreur suppression:', error);
    }
  };

  const handleEdit = (item: Item) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      desc: item.desc,
      metadata: JSON.stringify(item.metadata, null, 2),
      image_url: item.image_url ?? '',
    });
    setCanSubmit(true);
    setJsonError('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({ name: '', desc: '', metadata: '', image_url: '' });
    setCanSubmit(false);
    setJsonError('');
  };

  const handleImageRemove = () => {
    setForm((f) => ({ ...f, image_url: '' }));
    setCanSubmit(false);
  };

  return (
    <div className="min-h-screen w-full">
      {/* HERO STRIP (same palette as landing) */}
      <section
        className="relative px-6 py-10 text-white"
        style={{
          background:
            'linear-gradient(120deg,#1256a0 0%, #1f75d1 45%, #b91c1c 100%)',
        }}
      >
        <div className="absolute inset-0 pointer-events-none"
             style={{ boxShadow: 'inset 0 40px 80px rgba(0,0,0,.12), inset 0 -40px 80px rgba(0,0,0,.12)' }} />
        <div className="max-w-6xl mx-auto relative">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-wide">
            GESTION DES ARTICLES D’INVENTAIRE
          </h1>
          <p className="opacity-90 mt-1">
            Créez, modifiez et suivez vos articles avec leurs métadonnées et images.
          </p>
        </div>
      </section>

      {/* CONTENT */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 -mt-8 pb-12">
        {/* FORM CARD (glass-like) */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-6 bg-white/95 backdrop-blur rounded-2xl shadow-2xl border border-gray-100 p-6 md:p-7"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Nom"
              className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1f75d1] shadow-sm"
            />
            <input
              name="desc"
              value={form.desc}
              onChange={handleChange}
              placeholder="Description"
              className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1f75d1] shadow-sm"
            />
          </div>

          <div>
            <textarea
              name="metadata"
              value={form.metadata}
              onChange={handleChange}
              placeholder='Metadata JSON (ex: {"taille": "1.5L"})'
              className={`w-full p-3 rounded-xl border focus:outline-none focus:ring-2 shadow-sm ${
                jsonError
                  ? 'border-red-300 focus:ring-red-300'
                  : 'border-gray-200 focus:ring-[#1f75d1]'
              }`}
              rows={4}
            />
            {jsonError && (
              <p className="text-red-600 text-sm mt-1">{jsonError}</p>
            )}
          </div>

          <fieldset className="border border-dashed border-[#1f75d1]/50 p-4 rounded-xl relative">
            <legend className="text-sm font-medium text-[#1256a0] px-2">
              Ajouter une image
            </legend>

            <ImageUpload
              onUpload={(url) => {
                setCanSubmit(true);
                setForm((f) => ({ ...f, image_url: url }));
              }}
              defaultUrl={form.image_url}
            />

            {form.image_url && (
              <div className="mt-2 text-right">
                <button
                  type="button"
                  onClick={handleImageRemove}
                  className="text-red-600 text-sm hover:underline"
                >
                  Supprimer l'image
                </button>
              </div>
            )}
          </fieldset>

          <div className="flex flex-wrap gap-3 justify-end">
            <Button
              type="submit"
              className="rounded-full bg-[#1256a0] hover:bg-[#0e4d92] px-6"
              disabled={!canSubmit}
            >
              {editingId ? 'Mettre à jour' : 'Ajouter'}
            </Button>
            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="rounded-full bg-gray-500 hover:bg-gray-600 text-white px-6 py-2"
              >
                Annuler
              </button>
            )}
          </div>
        </motion.form>

        {/* TABLE CARD */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.4 }}
          className="mt-8 bg-white/95 backdrop-blur rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
        >
          <div className="max-h-[60vh] overflow-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50 text-gray-700 sticky top-0 z-10">
                <tr>
                  <th className="border-b p-3 text-left">Nom</th>
                  <th className="border-b p-3 text-left">Description</th>
                  <th className="border-b p-3 text-left">Metadata</th>
                  <th className="border-b p-3 text-left">Image</th>
                  <th className="border-b p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-gray-500">
                      Aucun article pour l’instant.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50 transition-all duration-150"
                    >
                      <td className="border-b p-3 align-top">{item.name}</td>
                      <td className="border-b p-3 align-top">{item.desc}</td>
                      <td className="border-b p-3 text-sm whitespace-pre-wrap align-top">
                        {JSON.stringify(item.metadata)}
                      </td>
                      <td className="border-b p-3 align-top">
                        {item.image_url && (
                          <img
                            src={item.image_url}
                            alt="Item"
                            className="w-20 h-20 object-cover rounded-xl shadow"
                          />
                        )}
                      </td>
                      <td className="border-b p-3 align-top">
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-[#1256a0] hover:underline font-medium"
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-red-600 hover:underline font-medium"
                          >
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
