"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { X, Mail } from "lucide-react";
import { Listing, UserProfile } from "./types";

interface ListingDetailsProps {
  listing: Listing;
  onClose: () => void;
  user: UserProfile | null;
  onUpdate: () => void;
  onRemove: () => void;
}

export function ListingDetails({ listing, onClose, user, onUpdate, onRemove }: ListingDetailsProps) {
  const isOwner = user?.id === listing.seller.id;

  const handleMarkAsSold = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
      const response = await fetch(`/api/listings`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ id: listing.id, status: 'sold' }),
        });

      if (response.ok) {
        onUpdate();
      } else {
        console.error("Failed to mark as sold");
      }
    } catch (error) {
      console.error("An error occurred", error);
    }
  };

  const handleRemove = async () => {
    if (!window.confirm("Are you sure you want to remove this listing?")) {
      return;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
      const response = await fetch(`/api/listings`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ id: listing.id }),
        });

      if (response.ok) {
        onRemove();
      } else {
        console.error("Failed to remove listing");
      }
    } catch (error) {
      console.error("An error occurred", error);
    }
  };


  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-lg shadow-xl w-full max-w-4xl h-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-surface p-4 border-b border-border flex justify-between items-center">
          <h2 className="text-2xl font-bold">{listing.title}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-border">
            <X />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              {listing.images && listing.images.length > 0 ? (
                <Image
                  src={listing.images[0]}
                  alt={listing.title}
                  width={500}
                  height={500}
                  className="w-full aspect-square object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-64 bg-border rounded-lg flex items-center justify-center">
                  No Image
                </div>
              )}
            </div>
            <div>
              <p className="text-3xl font-bold text-primary-accent mb-4">
                ₱{listing.price.toLocaleString()}
              </p>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">Description</h3>
                  <p className="text-text-secondary">{listing.description}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Category</h3>
                  <p className="text-text-secondary">{listing.category}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Condition</h3>
                  <p className="text-text-secondary">{listing.condition}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-border">
            <h3 className="text-xl font-bold mb-4">Seller Information</h3>
            <div className="flex items-center space-x-4">
              <div>
                <p className="font-semibold">{listing.seller.name}</p>
                <p className="text-sm text-text-secondary">{listing.seller.school}</p>
              </div>
            </div>

            {isOwner && (
              <div className="mt-6 flex items-center gap-4">
                <button
                  onClick={handleMarkAsSold}
                  className="btn-secondary"
                  disabled={listing.status === 'sold'}
                >
                  {listing.status === 'sold' ? 'Sold' : 'Mark as Sold'}
                </button>
                <button
                  onClick={handleRemove}
                  className="btn-danger"
                >
                  Remove Listing
                </button>
              </div>
            )}


            <div className="mt-4 p-4 bg-blue-900/50 rounded-lg">
                <p className="text-sm text-blue-200">
                    Please contact this email for safe and proper transaction:
                </p>
                <a href={`https://mail.google.com/mail/?view=cm&fs=1&to=${listing.seller.email}&su=${encodeURIComponent(listing.title)}`} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-lg font-semibold text-white mt-2">
                    <Mail className="w-5 h-5" />
                    <span>{listing.seller.email}</span>
                </a>
            </div>
            <a href={`https://mail.google.com/mail/?view=cm&fs=1&to=${listing.seller.email}&su=${encodeURIComponent(listing.title)}`} target="_blank" rel="noopener noreferrer" className="mt-4 btn-primary inline-flex items-center space-x-2">
                <Mail className="w-5 h-5" />
                <span>Contact Seller</span>
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
