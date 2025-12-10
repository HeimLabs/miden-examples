"use client";

import { useState } from "react";

interface CreatorProfileFormProps {
  initialName?: string;
  initialBio?: string;
  onSubmit: (name: string, bio: string) => Promise<void>;
  isSubmitting?: boolean;
}

export function CreatorProfileForm({
  initialName = "",
  initialBio = "",
  onSubmit,
  isSubmitting = false,
}: CreatorProfileFormProps) {
  const [name, setName] = useState(initialName);
  const [bio, setBio] = useState(initialBio || "");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    try {
      await onSubmit(name.trim(), bio.trim() || null);
    } catch (err: any) {
      setError(err.message || "Failed to save profile");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-300 mb-2"
        >
          Name <span className="text-red-400">*</span>
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          required
          disabled={isSubmitting}
          className="w-full px-4 py-2 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
        />
      </div>

      <div>
        <label
          htmlFor="bio"
          className="block text-sm font-medium text-gray-300 mb-2"
        >
          Bio <span className="text-gray-500 text-xs">(optional)</span>
        </label>
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell your supporters about yourself..."
          rows={4}
          disabled={isSubmitting}
          className="w-full px-4 py-2 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 resize-none"
        />
      </div>

      {error && (
        <div className="p-3 bg-red-900/20 border border-red-700 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || !name.trim()}
        className="w-full px-6 py-3 bg-transparent border-2 border-orange-600 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
      >
        {isSubmitting ? "Saving..." : "Save Profile"}
      </button>
    </form>
  );
}
