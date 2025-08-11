"use client";
import { useRef, useState, useEffect } from "react";

export default function ImageUpload({
  onUpload,
  defaultUrl = "",
}: {
  onUpload: (url: string) => void;
  defaultUrl?: string;
}) {
  const [previewUrl, setPreviewUrl] = useState(defaultUrl);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreviewUrl(defaultUrl);
  }, [defaultUrl]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setIsUploading(true); // 🟡 Start loader
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data: { url: string } = await res.json();
      setPreviewUrl(data.url);
      onUpload(data.url);
    } catch (err) {
      console.error("Erreur upload:", err);
    } finally {
      setIsUploading(false); // ✅ End loader
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="text-sm text-blue-600 underline hover:text-blue-800 w-fit"
      >
        📎 {isUploading ? "Chargement..." : "Ajouter une image"}
      </button>

      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleImageUpload}
        className="text-xs text-gray-400 file:hidden"
      />

      {isUploading && (
        <span className="text-xs text-gray-500 animate-pulse ml-1">
          📤 Envoi en cours...
        </span>
      )}

      {previewUrl && !isUploading && (
        <img
          src={previewUrl}
          alt="Prévisualisation"
          className="w-24 h-24 mt-2 object-cover rounded shadow border"
        />
      )}
    </div>
  );
}
