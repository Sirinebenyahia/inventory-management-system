"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type UserInfo = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  role: string;
};

export default function ChangePasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const res = await fetch("/api/users/me", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (!res.ok) throw new Error("Erreur lors du chargement.");
        const data = await res.json();
        setUserInfo(data);
      } catch (err) {
        setError("Impossible de récupérer les informations.");
      }
    };

    fetchUserInfo();
  }, []);

  const handleChangePassword = async () => {
    setError("");
    setSuccess("");

    if (!newPassword || !confirm) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    if (newPassword !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/users/password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Une erreur est survenue.");
        return;
      }

      setSuccess("Mot de passe mis à jour !");
      setNewPassword("");
      setConfirm("");

      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (err) {
      setError("Erreur réseau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 mt-10 border border-gray-300 rounded-lg shadow-lg bg-white">
      <h1 className="text-2xl font-semibold mb-5 text-center">
        Changer le mot de passe
      </h1>

      {userInfo && (
        <div className="mb-6 text-sm text-gray-700 space-y-1 border rounded p-3 bg-gray-50">
          <p><strong>Nom :</strong> {userInfo.lastName}</p>
          <p><strong>Prénom :</strong> {userInfo.firstName}</p>
          <p><strong>Email :</strong> {userInfo.email}</p>
          <p><strong>Téléphone :</strong> {userInfo.phoneNumber || "-"}</p>
          <p><strong>Rôle :</strong> {userInfo.role}</p>
        </div>
      )}

      <label className="block mb-2 font-medium" htmlFor="new-password">
        Nouveau mot de passe
      </label>
      <input
        id="new-password"
        type="password"
        placeholder="Nouveau mot de passe"
        autoComplete="new-password"
        className="w-full mb-4 border p-2 rounded"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />

      <label className="block mb-2 font-medium" htmlFor="confirm-password">
        Confirmer le mot de passe
      </label>
      <input
        id="confirm-password"
        type="password"
        placeholder="Confirmer le mot de passe"
        autoComplete="new-password"
        className="w-full mb-4 border p-2 rounded"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
      />

      <Button onClick={handleChangePassword} className="w-full" disabled={loading}>
        {loading ? "Traitement..." : "Valider"}
      </Button>

      {error && <p className="text-red-600 mt-3">{error}</p>}
      {success && <p className="text-green-600 mt-3">{success}</p>}
    </div>
  );
}
