import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface AccessibilitySettings {
  // Visual accessibility
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  
  // Navigation accessibility
  keyboardNavigation: boolean;
  screenReader: boolean;
  focusIndicators: boolean;
  
  // Language and localization
  language: string;
  region: string;
  currency: string;
  timezone: string;
  
  // Cognitive accessibility
  simplifiedMode: boolean;
  autoSave: boolean;
  confirmationDialogs: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSettings: (newSettings: Partial<AccessibilitySettings>) => void;
  resetSettings: () => void;
  isHighContrast: boolean;
  isLargeText: boolean;
  isReducedMotion: boolean;
  getText: (key: string, params?: Record<string, any>) => string;
  formatCurrency: (amount: number, currency?: string) => string;
  formatDate: (date: Date, format?: string) => string;
  formatNumber: (number: number, options?: Intl.NumberFormatOptions) => string;
}

const defaultSettings: AccessibilitySettings = {
  highContrast: false,
  largeText: false,
  reducedMotion: false,
  colorBlindMode: 'none',
  keyboardNavigation: true,
  screenReader: false,
  focusIndicators: true,
  language: 'en',
  region: 'US',
  currency: 'USD',
  timezone: 'UTC',
  simplifiedMode: false,
  autoSave: true,
  confirmationDialogs: true,
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

interface AccessibilityProviderProps {
  children: ReactNode;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  const [settings, setSettings] = useLocalStorage('aegis-accessibility', defaultSettings);
  const [translations, setTranslations] = useState<Record<string, Record<string, string>>>({});

  // Load translations on mount
  useEffect(() => {
    loadTranslations();
  }, [settings.language]);

  // Apply accessibility settings to document
  useEffect(() => {
    applyAccessibilitySettings();
  }, [settings]);

  // Load translations for the current language
  const loadTranslations = async () => {
    try {
      const response = await fetch(`/api/translations/${settings.language}`);
      if (response.ok) {
        const data = await response.json();
        setTranslations(data);
      }
    } catch (err) {
      console.warn('Failed to load translations:', err);
      // Fallback to English
      if (settings.language !== 'en') {
        setSettings(prev => ({ ...prev, language: 'en' }));
      }
    }
  };

  // Apply accessibility settings to the document
  const applyAccessibilitySettings = () => {
    const root = document.documentElement;
    
    // High contrast mode
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    // Large text mode
    if (settings.largeText) {
      root.classList.add('large-text');
    } else {
      root.classList.remove('large-text');
    }
    
    // Reduced motion
    if (settings.reducedMotion) {
      root.style.setProperty('--animation-duration', '0.01ms');
    } else {
      root.style.removeProperty('--animation-duration');
    }
    
    // Color blind mode
    root.classList.remove('protanopia', 'deuteranopia', 'tritanopia');
    if (settings.colorBlindMode !== 'none') {
      root.classList.add(settings.colorBlindMode);
    }
    
    // Focus indicators
    if (settings.focusIndicators) {
      root.classList.add('show-focus');
    } else {
      root.classList.remove('show-focus');
    }
    
    // Simplified mode
    if (settings.simplifiedMode) {
      root.classList.add('simplified-mode');
    } else {
      root.classList.remove('simplified-mode');
    }
  };

  // Update accessibility settings
  const updateSettings = (newSettings: Partial<AccessibilitySettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // Reset settings to defaults
  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  // Get translated text
  const getText = (key: string, params?: Record<string, any>): string => {
    const translation = translations[settings.language]?.[key] || translations['en']?.[key] || key;
    
    if (params) {
      return translation.replace(/\{(\w+)\}/g, (match, param) => {
        return params[param] || match;
      });
    }
    
    return translation;
  };

  // Format currency
  const formatCurrency = (amount: number, currency?: string): string => {
    const targetCurrency = currency || settings.currency;
    const region = settings.region;
    
    try {
      return new Intl.NumberFormat(`${region}-${targetCurrency}`, {
        style: 'currency',
        currency: targetCurrency,
      }).format(amount);
    } catch (err) {
      // Fallback formatting
      return `${targetCurrency} ${amount.toFixed(2)}`;
    }
  };

  // Format date
  const formatDate = (date: Date, format?: string): string => {
    const region = settings.region;
    
    try {
      if (format === 'short') {
        return new Intl.DateTimeFormat(region, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }).format(date);
      } else if (format === 'long') {
        return new Intl.DateTimeFormat(region, {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }).format(date);
      } else {
        return new Intl.DateTimeFormat(region).format(date);
      }
    } catch (err) {
      // Fallback formatting
      return date.toLocaleDateString();
    }
  };

  // Format number
  const formatNumber = (number: number, options?: Intl.NumberFormatOptions): string => {
    const region = settings.region;
    
    try {
      return new Intl.NumberFormat(region, options).format(number);
    } catch (err) {
      // Fallback formatting
      return number.toLocaleString();
    }
  };

  const contextValue: AccessibilityContextType = {
    settings,
    updateSettings,
    resetSettings,
    isHighContrast: settings.highContrast,
    isLargeText: settings.largeText,
    isReducedMotion: settings.reducedMotion,
    getText,
    formatCurrency,
    formatDate,
    formatNumber,
  };

  return (
    <AccessibilityContext.Provider value={contextValue}>
      {children}
    </AccessibilityContext.Provider>
  );
};

// Custom hook to use accessibility context
export const useAccessibility = (): AccessibilityContextType => {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

// Higher-order component for accessibility features
export const withAccessibility = <P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> => {
  return (props: P) => {
    const accessibility = useAccessibility();
    return <Component {...props} accessibility={accessibility} />;
  };
};
