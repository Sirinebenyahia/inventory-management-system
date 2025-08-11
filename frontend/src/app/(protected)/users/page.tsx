"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type User = {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: "admin" | "user" | string;
  phoneNumber?: string;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // search + stats
  const [search, setSearch] = useState("");

  // edit modal
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    role: "user",
  });
  const [saving, setSaving] = useState(false);

  // who am I
  const [currentUserRole, setCurrentUserRole] = useState<"admin" | "user" | string>("user");

  const token = () => localStorage.getItem("token") || "";

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/users", {
        headers: { Authorization: `Bearer ${token()}` }, // <-- backticks!
      });
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // lire le rôle depuis le token
    const t = token();
    if (t) {
      try {
        const decoded: any = JSON.parse(atob(t.split(".")[1]));
        setCurrentUserRole(decoded.role);
      } catch {}
    }
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) =>
      [u.email, u.username, u.firstName, u.lastName, u.phoneNumber, u.role]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [users, search]);

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cet utilisateur ?")) return;
    await fetch(`/api/users/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token()}` },
    });
    fetchUsers();
  };

  const handleOpenEdit = (u: User) => {
    setEditingUser(u);
    setForm({
      firstName: u.firstName || "",
      lastName: u.lastName || "",
      phoneNumber: u.phoneNumber || "",
      role: (u.role as any) || "user",
    });
    setOpen(true);
  };

  const handleSave = async () => {
    const phoneRegex = /^\+?[0-9]{6,15}$/;
    if (form.phoneNumber && !phoneRegex.test(form.phoneNumber)) {
      alert("Numéro invalide. Ex: +21612345678 ou 12345678");
      return;
    }

    const payload: any = {};
    if (form.firstName.trim()) payload.firstName = form.firstName.trim();
    if (form.lastName.trim()) payload.lastName = form.lastName.trim();
    if (form.phoneNumber.trim()) payload.phoneNumber = form.phoneNumber.trim();
    if (currentUserRole === "admin" && form.role) payload.role = form.role;

    try {
      setSaving(true);
      await fetch(`/api/users/${editingUser?.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify(payload),
      });
      setOpen(false);
      setEditingUser(null);
      fetchUsers();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen w-full">
      {/* HERO */}
      <section
        className="relative px-6 py-10 text-white"
        style={{ background: "linear-gradient(120deg,#1256a0 0%, #1f75d1 45%, #b91c1c 100%)" }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ boxShadow: "inset 0 40px 80px rgba(0,0,0,.12), inset 0 -40px 80px rgba(0,0,0,.12)" }}
        />
        <div className="max-w-6xl mx-auto relative">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-wide">
            Gestion des utilisateurs
          </h1>
          <p className="opacity-90 mt-1">Consultez, recherchez et modifiez les profils.</p>
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
            <div className="mb-4 flex flex-col md:flex-row gap-3 md:items-center">
              <div className="relative flex-1">
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="🔍 Rechercher (email, nom, rôle, téléphone)…"
                  className="rounded-full border border-gray-200 shadow-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#1f75d1]"
                />
              </div>
              <div className="text-sm text-gray-500">
                Total: <span className="font-medium text-gray-700">{users.length}</span> &nbsp;|&nbsp;
                Affichés: <span className="font-medium text-gray-700">{filtered.length}</span>
              </div>
            </div>

            {/* Table */}
            <div className="max-h-[60vh] overflow-auto border border-gray-100 rounded-xl">
              <table className="w-full border-collapse">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr className="text-gray-700 text-sm">
                    <th className="p-3 text-left">Email</th>
                    <th className="p-3 text-left">Nom</th>
                    <th className="p-3 text-left">Prénom</th>
                    <th className="p-3 text-left">Téléphone</th>
                    <th className="p-3 text-left">Rôle</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-gray-500">
                        Chargement…
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-gray-500 italic">
                        Aucun utilisateur.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((u, i) => (
                      <tr
                        key={u.id}
                        className={`transition-colors ${
                          i % 2 ? "bg-white" : "bg-gray-50"
                        } hover:bg-gray-100/60`}
                      >
                        <td className="p-3">{u.email}</td>
                        <td className="p-3">{u.lastName || "-"}</td>
                        <td className="p-3">{u.firstName || "-"}</td>
                        <td className="p-3">{u.phoneNumber || "-"}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              u.role === "admin"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="inline-flex gap-2">
                            <Button
                              size="sm"
                              className="rounded-full bg-[#1256a0] hover:bg-[#0e4d92]"
                              onClick={() => handleOpenEdit(u)}
                            >
                              ✏️ Modifier
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="rounded-full"
                              onClick={() => handleDelete(u.id)}
                            >
                              🗑 Supprimer
                            </Button>
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

      {/* MODALE */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Modifier l’utilisateur</DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              Email : {editingUser?.email}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div>
              <label className="text-sm text-gray-700">Prénom</label>
              <Input
                value={form.firstName}
                onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                className="mt-1 rounded-xl"
                placeholder="Prénom"
              />
            </div>
            <div>
              <label className="text-sm text-gray-700">Nom</label>
              <Input
                value={form.lastName}
                onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                className="mt-1 rounded-xl"
                placeholder="Nom"
              />
            </div>
            <div>
              <label className="text-sm text-gray-700">Téléphone</label>
              <Input
                value={form.phoneNumber}
                onChange={(e) => setForm((f) => ({ ...f, phoneNumber: e.target.value }))}
                className="mt-1 rounded-xl"
                placeholder="+21612345678"
              />
            </div>

            {currentUserRole === "admin" && (
              <div>
                <label className="text-sm text-gray-700">Rôle</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1f75d1]"
                >
                  <option value="user">user</option>
                  <option value="admin">admin</option>
                </select>
              </div>
            )}
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" className="rounded-full" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="rounded-full bg-emerald-600 hover:bg-emerald-700"
            >
              {saving ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
