"use client";

import { useState, useEffect } from 'react';
import { ArrowLeft, Settings, Bell, Shield, Palette, Volume2, Mic } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/ui/Header';
import { supabase } from '@/lib/supabase';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      learning_reminders: true,
      achievement_alerts: true
    },
    privacy: {
      profile_visibility: 'public',
      learning_data_sharing: true,
      analytics_tracking: true
    },
    learning: {
      voice_enabled: true,
      auto_speak_responses: true,
      difficulty_adaptation: true,
      personalized_content: true
    }
  });
  const [loading, setLoading] = useState(false);

  const updateSetting = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value
      }
    }));
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('user_settings')
          .upsert({
            user_id: user.id,
            settings: settings,
            updated_at: new Date().toISOString()
          });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from('user_settings')
            .select('settings')
            .eq('user_id', user.id)
            .single();
          
          if (data?.settings) {
            setSettings(data.settings);
          }
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };
    
    loadSettings();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Header variant="dashboard" />
        
        {/* Back Navigation */}
        <div className="mb-8 pt-20">
          <Link 
            href="/dashboard"
            className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Dashboard
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Settings</h1>
          <p className="text-gray-600 dark:text-gray-300">Customize your learning experience</p>
        </div>

        <div className="space-y-8">
          {/* Notifications */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Bell className="w-6 h-6 text-blue-500" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Notifications</h2>
            </div>
            
            <div className="space-y-4">
              {[
                { key: 'email', label: 'Email Notifications', desc: 'Receive updates via email' },
                { key: 'push', label: 'Push Notifications', desc: 'Browser notifications for important updates' },
                { key: 'learning_reminders', label: 'Learning Reminders', desc: 'Daily reminders to continue learning' },
                { key: 'achievement_alerts', label: 'Achievement Alerts', desc: 'Notifications when you earn badges' }
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{item.label}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications[item.key as keyof typeof settings.notifications]}
                      onChange={(e) => updateSetting('notifications', item.key, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Learning Preferences */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Volume2 className="w-6 h-6 text-green-500" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Learning Preferences</h2>
            </div>
            
            <div className="space-y-4">
              {[
                { key: 'voice_enabled', label: 'Voice Learning', desc: 'Enable voice input and output features' },
                { key: 'auto_speak_responses', label: 'Auto-Speak Responses', desc: 'Automatically read AI responses aloud' },
                { key: 'difficulty_adaptation', label: 'Adaptive Difficulty', desc: 'Automatically adjust content difficulty' },
                { key: 'personalized_content', label: 'Personalized Content', desc: 'Customize content based on your progress' }
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{item.label}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.learning[item.key as keyof typeof settings.learning]}
                      onChange={(e) => updateSetting('learning', item.key, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Privacy */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Shield className="w-6 h-6 text-purple-500" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Privacy & Security</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Profile Visibility</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Control who can see your profile</p>
                </div>
                <select
                  value={settings.privacy.profile_visibility}
                  onChange={(e) => updateSetting('privacy', 'profile_visibility', e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                  <option value="friends">Friends Only</option>
                </select>
              </div>

              {[
                { key: 'learning_data_sharing', label: 'Learning Data Sharing', desc: 'Share anonymized data to improve AI' },
                { key: 'analytics_tracking', label: 'Analytics Tracking', desc: 'Allow usage analytics for better experience' }
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{item.label}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.privacy[item.key as keyof typeof settings.privacy]}
                      onChange={(e) => updateSetting('privacy', item.key, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={saveSettings}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
            >
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}