"use client";

import { useState } from "react";
import { User, GraduationCap, Mail, CheckCircle, AlertCircle } from "lucide-react";
import { UserProfile } from "./marketplace";

interface ProfileSetupProps {
  onProfileCreated: (profile: UserProfile) => void;
}

export function ProfileSetup({ onProfileCreated }: ProfileSetupProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    school: "",
    customSchool: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCustomSchool, setShowCustomSchool] = useState(false);

  const schools = [
    "Adamson University",
    "Ago Medical and Educational Center - Bicol Christian College of Medicine",
    "Aklan State University",
    "Ama Computer University",
    "Angeles University Foundation",
    "Araullo University",
    "Arellano University",
    "Ateneo de Davao University",
    "Ateneo de Manila University",
    "Ateneo de Naga University",
    "Ateneo de Zamboanga University",
    "Ateneo School of Medicine and Public Health",
    "Aurora State College of Technology",
    "Baguio Central University",
    "Bataan Peninsula State University",
    "Batangas State University",
    "Benguet State University",
    "Bicol University",
    "Bohol Island State University",
    "Bulacan State University",
    "Cagayan State University",
    "Cagayan de Oro College",
    "Capiz State University",
    "Caraga State University",
    "Cavite State University",
    "Cebu Institute of Technology - University",
    "Cebu Institute of Medicine",
    "Cebu Normal University",
    "Cebu Technological University",
    "Central Luzon State University",
    "Central Mindanao University",
    "Central Philippine University",
    "Centro Escolar University",
    "Chiang Kai Shek College",
    "Colegio de San Juan de Letran",
    "Colegio de San Lorenzo Ruiz de Manila",
    "De La Salle University",
    "De La Salle University - Dasmariñas",
    "De La Salle Medical and Health Sciences Institute",
    "Don Bosco Technical College",
    "Don Mariano Marcos Memorial State University",
    "Eastern Samar State University",
    "Emilio Aguinaldo College",
    "Far Eastern University",
    "Far Eastern University - Dr. Nicanor Reyes Medical Foundation",
    "Father Saturnino Urios University",
    "Foundation University",
    "Holy Cross of Davao College",
    "Ifugao State University",
    "Ilocos Sur Polytechnic State College",
    "Iloilo Science and Technology University",
    "Isabela State University",
    "Jose Rizal University",
    "La Consolacion College",
    "Laguna State Polytechnic University",
    "Leyte Normal University",
    "Liceo de Cagayan University",
    "Lyceum of the Philippines University",
    "Lyceum of the Philippines University - Batangas",
    "Lyceum of the Philippines University - Cavite",
    "Manila Central University",
    "Mapúa University",
    "Mariano Marcos State University",
    "Mindanao State University",
    "Mindanao State University - Iligan Institute of Technology",
    "Mindanao University of Science and Technology",
    "Miriam College",
    "National University",
    "Negros Oriental State University",
    "Northwestern University",
    "Nueva Ecija University of Science and Technology",
    "Pamantasan ng Lungsod ng Maynila",
    "Pamantasan ng Lungsod ng Valenzuela",
    "Pampanga State Agricultural University",
    "Philippine Christian University",
    "Philippine Military Academy",
    "Philippine Merchant Marine Academy",
    "Philippine National Police Academy",
    "Philippine Normal University",
    "Philippine State College of Aeronautics",
    "Philippine Women's College of Davao",
    "Polytechnic University of the Philippines",
    "Polytechnic University of the Philippines - Cavite",
    "Polytechnic University of the Philippines - Mandaluyong",
    "Polytechnic University of the Philippines - Navotas",
    "Polytechnic University of the Philippines - Parañaque",
    "Polytechnic University of the Philippines - Pasay",
    "Polytechnic University of the Philippines - Pateros",
    "Polytechnic University of the Philippines - Rizal",
    "Polytechnic University of the Philippines - Taguig",
    "Quezon City University",
    "Rizal Technological University",
    "Saint Louis University",
    "San Beda University",
    "Silliman University",
    "Southwestern University",
    "St. Luke's Medical Center College of Medicine",
    "St. Paul University Manila",
    "St. Scholastica's College",
    "St. Theresa's College",
    "Surigao del Sur State University",
    "Tarlac State University",
    "Technological Institute of the Philippines",
    "Technological University of the Philippines",
    "Trinity University of Asia",
    "University of Asia and the Pacific",
    "University of Batangas",
    "University of Baguio",
    "University of Caloocan City",
    "University of Cebu",
    "University of Cebu School of Medicine",
    "University of the Cordilleras",
    "University of the East",
    "University of the East - Ramon Magsaysay Memorial Medical Center",
    "University of Makati",
    "University of Mindanao",
    "University of Nueva Caceres",
    "University of Northern Philippines",
    "University of Perpetual Help System",
    "University of Perpetual Help System - Las Piñas",
    "University of Rizal System",
    "University of Rizal System - Marikina",
    "University of Rizal System - Pasig",
    "University of San Agustin",
    "University of San Carlos",
    "University of Santo Tomas",
    "University of Santo Tomas - Faculty of Medicine and Surgery",
    "University of Southeastern Philippines",
    "University of the Philippines Baguio",
    "University of the Philippines Cebu",
    "University of the Philippines Diliman",
    "University of the Philippines Los Baños",
    "University of the Philippines Manila",
    "University of the Philippines Mindanao",
    "University of the Philippines Open University",
    "University of the Philippines Tacloban",
    "University of the Philippines Visayas",
    "University of the Visayas",
    "University of Zamboanga",
    "Western Mindanao State University",
    "West Visayas State University",
    "Xavier University - Ateneo de Cagayan",
    "Xavier University School of Medicine",
    "Zamboanga State College of Marine Sciences and Technology",
    "Other"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const schoolValue = formData.school === "Other" ? formData.customSchool : formData.school;
      
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          school: schoolValue,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        onProfileCreated(result.profile);
      } else {
        setError(result.error || 'Failed to create profile');
      }
    } catch (error) {
      console.error('Error creating profile:', error);
      setError('Failed to create profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (name === 'school') {
      setShowCustomSchool(value === 'Other');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 sm:h-12 sm:w-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
            <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600 dark:text-primary-400" />
          </div>
          <h2 className="mt-4 sm:mt-6 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Welcome to Campus Marketplace
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            Set up your profile to start buying and selling with fellow students
          </p>
        </div>

        <div className="card">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2 text-red-700">
                <AlertCircle className="w-4 h-4" />
                <span className="font-medium">Error</span>
              </div>
              <p className="text-red-600 mt-1">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className="input-field pl-10"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your.email@university.edu"
                  className="input-field pl-10"
                  required
                  disabled={loading}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Use your university email address for verification
              </p>
            </div>

            {/* School */}
            <div>
              <label htmlFor="school" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                School/University *
              </label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  id="school"
                  name="school"
                  value={formData.school}
                  onChange={handleInputChange}
                  className="input-field pl-10"
                  required
                  disabled={loading}
                >
                  <option value="">Select your school</option>
                  {schools.map((school) => (
                    <option key={school} value={school}>
                      {school}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Custom School Input */}
              {showCustomSchool && (
                <div className="mt-3">
                  <label htmlFor="customSchool" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Enter your school name *
                  </label>
                  <input
                    type="text"
                    id="customSchool"
                    name="customSchool"
                    value={formData.customSchool}
                    onChange={handleInputChange}
                    placeholder="Enter your school or university name"
                    className="input-field"
                    required={showCustomSchool}
                    disabled={loading}
                  />
                </div>
              )}
            </div>

            {/* Benefits */}
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
              <h3 className="font-medium text-primary-800 mb-2 flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                Why join Campus Marketplace?
              </h3>
              <ul className="text-sm text-primary-700 space-y-1">
                <li>• Buy and sell with trusted students from your school</li>
                <li>• AI-powered moderation keeps the marketplace safe</li>
                <li>• Find textbooks, electronics, and more at great prices</li>
                <li>• Support your local student community</li>
              </ul>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full btn-primary flex items-center justify-center space-x-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating Profile...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Create Profile</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              By creating a profile, you agree to our community guidelines and terms of service.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
