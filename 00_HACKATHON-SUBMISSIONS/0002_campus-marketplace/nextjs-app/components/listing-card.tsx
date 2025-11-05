"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ImageIcon } from "lucide-react";
import type { Listing } from "./types";

interface ListingCardProps {
  listing: Listing;
  onClick: () => void;
}

export function ListingCard({ listing, onClick }: ListingCardProps) {
  const coverImage = listing.images && listing.images.length > 0 ? listing.images[0] : null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'PHP',
    }).format(price);
  };

  return (
    <motion.div 
      className="card h-full flex flex-col cursor-pointer p-0" 
      onClick={onClick}
      whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
    >
      {/* Image container with 1:1 aspect ratio */}
      <div className="relative w-full aspect-square overflow-hidden rounded-t-xl">
        {coverImage ? (
          <Image 
            src={coverImage} 
            alt={listing.title} 
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-surface flex items-center justify-center">
            <ImageIcon className="w-12 h-12 text-text-secondary opacity-50" />
          </div>
        )}
        {/* Gradient Overlay for Text Legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
        {/* Content Overlay */}
        <div className="absolute inset-0 p-6 flex flex-col justify-end">
          <h3 className="font-bold text-lg text-text-primary line-clamp-2 leading-tight">
            {listing.title}
          </h3>
          <div className="flex justify-between items-center mt-2">
            <p className="text-sm text-text-secondary">{listing.seller.name}</p>
            <p className="font-semibold text-lg text-primary-accent">{formatPrice(listing.price)}</p>
          </div>
        </div>
      </div>

      {/* Subtle border that appears on hover */}
      <div className="absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-primary-accent transition-colors duration-300" />

    </motion.div>
  );
}