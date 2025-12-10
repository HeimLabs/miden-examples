"use client";

import { useState } from "react";

interface CreatorProfileFormProps {
  initialName?: string;
  initialBio?: string;
  onSubmit: (name: string, bio: string | null) => Promise<void>;
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
          className="block text-sm font-semibold text-gray-200 mb-3"
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
          className="w-full px-5 py-3 bg-gray-900/70 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 disabled:opacity-50 transition-all duration-200"
        />
      </div>

      <div>
        <label
          htmlFor="bio"
          className="block text-sm font-semibold text-gray-200 mb-3"
        >
          Bio <span className="text-gray-500 text-xs font-normal">(optional)</span>
        </label>
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell your supporters about yourself..."
          rows={5}
          disabled={isSubmitting}
          className="w-full px-5 py-3 bg-gray-900/70 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 disabled:opacity-50 resize-none transition-all duration-200"
        />
      </div>

      {error && (
        <div className="p-4 bg-gradient-to-r from-red-900/30 to-red-800/30 border border-red-700/50 rounded-xl backdrop-blur-sm">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-400 text-sm font-medium">{error}</p>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || !name.trim()}
        className="w-full px-6 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 disabled:from-gray-700 disabled:to-gray-600 text-white rounded-xl disabled:cursor-not-allowed font-bold text-lg transition-all duration-300 shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 disabled:shadow-none hover:scale-[1.02] active:scale-[0.98]"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center space-x-2">
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Saving...</span>
          </span>
        ) : (
          "Save Profile"
        )}
      </button>
    </form>
  );
}
