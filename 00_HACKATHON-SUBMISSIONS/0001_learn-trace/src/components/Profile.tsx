"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";

interface UserProfile {
  id: string;
  username: string | null;
  created_at: string;
}

interface ProfileProps {
  collapsed: boolean;
}

export default function Profile({ collapsed }: ProfileProps) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getProfile = async () => {
      // Get authenticated user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUser(user);

        // Fetch user profile from public.users table
        const { data: profileData, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileData) {
          setProfile(profileData);
          setUsername(profileData.username || "");
        }
      }

      setLoading(false);
    };

    getProfile();
  }, []);

  const updateUsername = async () => {
    if (!user || !username.trim()) return;

    const { data, error } = await supabase
      .from("users")
      .update({ username: username.trim() })
      .eq("id", user.id)
      .select()
      .single();

    if (data) {
      setProfile(data);
      setShowModal(false);
    } else {
      alert("Failed to update username");
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
      window.location.href = "/";
    }
  };

  const getInitials = (name: string) => {
    return name.split("_")[0].substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="p-2 border-t border-gray-700">
        <div className="animate-pulse">
          {collapsed ? (
            <div className="w-8 h-8 bg-gray-600 rounded-full mx-auto"></div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-600 rounded-full"></div>
              <div className="h-4 bg-gray-600 rounded flex-1"></div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-2 border-t border-gray-700">
        <button
          onClick={() => setShowModal(true)}
          className="w-full hover:bg-gray-800 rounded-lg p-2 transition-colors"
        >
          {collapsed ? (
            <div className="flex justify-center">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">
                {profile?.username ? getInitials(profile.username) : "U"}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">
                {profile?.username ? getInitials(profile.username) : "U"}
              </div>
              <div className="flex-1 text-left">
                <div className="text-sm font-medium truncate">
                  {profile?.username || "Anonymous User"}
                </div>
                <div className="text-xs text-gray-400">Click to edit</div>
              </div>
            </div>
          )}
        </button>
      </div>

      {/* Profile Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-80 max-w-90vw">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Edit Profile
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-xl font-semibold text-white">
                  {username ? getInitials(username) : "U"}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  maxLength={30}
                />
              </div>

              <div className="text-xs text-gray-500">
                <p>User ID: {profile?.id}</p>
                <p>
                  Created:{" "}
                  {profile?.created_at
                    ? new Date(profile.created_at).toLocaleDateString()
                    : "Unknown"}
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={updateUsername}
                disabled={!username.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Save
              </button>
            </div>
            <div className="flex mt-6">
              <button
                className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={handleSignOut}
              >
                Signout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
