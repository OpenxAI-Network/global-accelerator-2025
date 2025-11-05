"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { ArrowLeft, Upload, AlertCircle, CheckCircle, Loader, X } from "lucide-react";
import { UserProfile, Listing } from "./marketplace";

interface ListingFormProps {
  userProfile: UserProfile;
  onListingCreated: (listing: Listing) => void;
  onCancel: () => void;
}

export function ListingForm({ userProfile, onListingCreated, onCancel }: ListingFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    condition: "",
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [moderationStatus, setModerationStatus] = useState<'idle' | 'checking' | 'approved' | 'rejected'>('idle');
  const [moderationReason, setModerationReason] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    { id: "books", name: "Books & Study Materials" },
    { id: "electronics", name: "Electronics & Gadgets" },
    { id: "clothing", name: "Clothing & Uniforms" },
    { id: "accessories", name: "Accessories & Personal Items" },
    { id: "furniture", name: "Furniture & Room Items" },
    { id: "sports", name: "Sports & Recreation" },
    { id: "other", name: "Other" },
  ];

  const conditions = [
    { id: "excellent", name: "Excellent - Like new" },
    { id: "good", name: "Good - Minor wear" },
    { id: "fair", name: "Fair - Some wear" },
    { id: "poor", name: "Poor - Significant wear" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setModerationStatus('checking');

    const formDataToSubmit = new FormData();
    formDataToSubmit.append('title', formData.title);
    formDataToSubmit.append('description', formData.description);
    formDataToSubmit.append('price', formData.price);
    formDataToSubmit.append('category', formData.category);
    formDataToSubmit.append('condition', formData.condition);
    formDataToSubmit.append('seller', JSON.stringify(userProfile));
    formDataToSubmit.append('school', userProfile.school);

    imageFiles.forEach(file => {
        formDataToSubmit.append('images', file);
    });

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('You must be logged in to create a listing.');
        setLoading(false);
        setModerationStatus('idle');
        return;
      }

      const response = await fetch('/api/listings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSubmit,
      });

      const result = await response.json();

      if (response.ok) {
        setModerationStatus('approved');
        onListingCreated(result.listing);
      } else {
        if (result.moderationResult && !result.moderationResult.approved) {
          setModerationStatus('rejected');
          setModerationReason(result.moderationResult.reason || 'Content violates community guidelines');
        } else {
          setError(result.error || 'Failed to create listing');
          setModerationStatus('idle');
        }
      }
    } catch (error) {
      console.error('Error creating listing:', error);
      setError('Failed to create listing. Please try again.');
      setModerationStatus('idle');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const newImageFiles = [...imageFiles, ...files].slice(0, 8);
      setImageFiles(newImageFiles);

      const newImagePreviews = newImageFiles.map(file => URL.createObjectURL(file));
      setImagePreviews(newImagePreviews);
    }
  };

  const removeImage = (index: number) => {
    const newImageFiles = imageFiles.filter((_, i) => i !== index);
    const newImagePreviews = imagePreviews.filter((_, i) => i !== index);
    setImageFiles(newImageFiles);
    setImagePreviews(newImagePreviews);
  };


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={onCancel}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mr-4"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Marketplace</span>
            </button>
            <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400">List Your Item</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Item Details</h2>
            <p className="text-gray-600">
              Provide accurate information about your item. All listings are moderated for appropriateness.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2 text-red-700">
                <AlertCircle className="w-4 h-4" />
                <span className="font-medium">Error</span>
              </div>
              <p className="text-red-600 mt-1">{error}</p>
            </div>
          )}

          {moderationStatus === 'checking' && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2 text-blue-700">
                <Loader className="w-4 h-4 animate-spin" />
                <span className="font-medium">Checking content for appropriateness...</span>
              </div>
            </div>
          )}

          {moderationStatus === 'rejected' && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2 text-red-700">
                <AlertCircle className="w-4 h-4" />
                <span className="font-medium">Listing Rejected</span>
              </div>
              <p className="text-red-600 mt-1">{moderationReason}</p>
              <p className="text-sm text-red-500 mt-2">
                Please review your listing and make sure it complies with our community guidelines.
              </p>
            </div>
          )}

          {moderationStatus === 'approved' && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2 text-green-700">
                <CheckCircle className="w-4 h-4" />
                <span className="font-medium">Listing Approved!</span>
              </div>
              <p className="text-green-600 mt-1">Your item has been successfully listed.</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Item Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Calculus Textbook, MacBook Pro, School Uniform"
                className="input-field"
                required
                disabled={loading}
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your item in detail. Include any defects, usage history, or special features."
                rows={4}
                className="input-field"
                required
                disabled={loading}
              />
            </div>

            {/* Price and Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                  Price (PHP) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₱</span>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="input-field pl-8"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                  disabled={loading}
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Condition */}
            <div>
              <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-2">
                Condition *
              </label>
              <select
                id="condition"
                name="condition"
                value={formData.condition}
                onChange={handleInputChange}
                className="input-field"
                required
                disabled={loading}
              >
                <option value="">Select condition</option>
                {conditions.map((condition) => (
                  <option key={condition.id} value={condition.id}>
                    {condition.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Guidelines */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-medium text-yellow-800 mb-2">Community Guidelines</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• No illegal items (drugs, weapons, etc.)</li>
                <li>• No inappropriate or offensive content</li>
                <li>• No fake or misleading listings</li>
                <li>• Be honest about item condition</li>
                <li>• Use respectful language</li>
              </ul>
            </div>

            {/* Media */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Images</label>
              <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {imagePreviews.map((src, index) => (
                  <div key={index} className="relative group aspect-w-1 aspect-h-1">
                    <Image src={src} alt={`Preview ${index + 1}`} width={500} height={500} className="w-full h-full object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full p-1 group-hover:opacity-100 opacity-0 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {imagePreviews.length < 8 && (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center w-full h-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-primary-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="text-center">
                      <Upload className="mx-auto h-8 w-8 text-gray-400" />
                      <p className="mt-1 text-xs text-gray-500">Upload Image</p>
                    </div>
                  </div>
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden"
                multiple
                accept="image/*"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-2">You can add up to 8 images. This is a demo; images are not actually uploaded.</p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onCancel}
                className="btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary flex items-center space-x-2"
                disabled={loading || moderationStatus === 'checking'}
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Creating Listing...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>List Item</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
