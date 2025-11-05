"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import { ListingForm } from "./listing-form";
import { ListingCard } from "@/components/listing-card";
import { ListingCardSkeleton } from "./listing-card-skeleton";
import { ProfileSetup } from "./profile-setup";
import { ProfileCustomization } from "./profile-customization";
import { ListingDetails } from "./listing-details";
import { useAuth } from "./auth-context";
import { Header } from "./Header";
import type { Listing as ListingType } from "./types";

// Interfaces remain the same
export interface UserProfile { id: string; name: string; school: string; email: string; verified: boolean; }
export interface Listing { id: string; title: string; description: string; price: number; category: string; condition: string; seller: UserProfile; school: string; createdAt: string; status: 'active' | 'pending' | 'sold' | 'rejected'; images?: string[]; }

const categories = ["All", "books", "electronics", "clothing", "accessories"];

export function Marketplace() {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [showListingForm, setShowListingForm] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [showProfileCustomization, setShowProfileCustomization] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  const loadListings = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const query = new URLSearchParams({
        sortBy,
        category: selectedCategory === 'All' ? '' : selectedCategory,
        q: searchTerm,
      }).toString();

      const response = await fetch(`/api/listings?${query}`);
      if (!response.ok) throw new Error('Failed to fetch listings.');
      
      const data = await response.json();
      setListings(data.listings || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  }, [sortBy, selectedCategory, searchTerm]);

  useEffect(() => {
    if (user) loadListings();
    else setShowProfileSetup(true);
  }, [user, loadListings]);

  // --- Conditional full-screen overlays ---
  if (showProfileSetup) return <ProfileSetup onProfileCreated={() => setShowProfileSetup(false)} />;
  if (showProfileCustomization) return <ProfileCustomization onBack={() => setShowProfileCustomization(false)} />;
  if (showListingForm) return <ListingForm userProfile={user!} onListingCreated={(l) => { setListings(p => [l, ...p]); setShowListingForm(false); }} onCancel={() => setShowListingForm(false)} />;

  return (
    <div className="min-h-screen w-full">
      <Header 
        onListNewItem={() => setShowListingForm(true)} 
        onEditProfile={() => setShowProfileCustomization(true)} 
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {/* --- Hero Section --- */}
        <motion.section 
          className="text-center py-16 md:py-24"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-h1 font-bold tracking-tighter">
            The Campus Marketplace
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-text-secondary">
            A secure, minimalist marketplace for students. The UI gets out of the way, letting the products shine.
          </p>
        </motion.section>

        {/* --- Search and Filter Controls --- */}
        <div className="sticky top-[80px] z-20 mb-12 p-4 space-y-4">
            <div className="relative">
                <input
                    type="text"
                    placeholder="Search for anything..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-field w-full"
                />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {categories.map((category) => (
                    <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors whitespace-nowrap ${selectedCategory === category ? 'bg-primary-accent text-background' : 'bg-surface text-text-secondary hover:bg-border'}`}
                    >
                        {category}
                    </button>
                ))}
            </div>
        </div>

        {/* --- Listings Grid --- */}
        <AnimatePresence>
          {loading ? (
            <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {Array.from({ length: 8 }).map((_, i) => <ListingCardSkeleton key={i} />)}
            </motion.div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-error mb-4">{error}</p>
              <button onClick={loadListings} className="btn-primary">Try Again</button>
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-20">
              <h3 className="text-h3 font-semibold mb-2">No Items Found</h3>
              <p className="text-text-secondary mb-6">Try adjusting your search or be the first to list an item.</p>
              <button onClick={() => setShowListingForm(true)} className="btn-primary">List Your First Item</button>
            </div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} onClick={() => setSelectedListing(listing)} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {selectedListing && (
          <ListingDetails 
            listing={selectedListing} 
            onClose={() => setSelectedListing(null)} 
            user={user}
            onUpdate={() => {
              setSelectedListing(null);
              loadListings();
            }}
            onRemove={() => {
              setSelectedListing(null);
              loadListings();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}