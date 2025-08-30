import React, { useState } from 'react';

const Settings: React.FC = () => {
  const [permissions, setPermissions] = useState({
    autoFreeze: true,
    requireConfirmation: true,
    crossChainOperations: true,
    aiAnalysis: true,
    realTimeMonitoring: true,
    emergencyStop: false,
  });

  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    telegram: false,
    discord: false,
  });

  const [security, setSecurity] = useState({
    twoFactorAuth: true,
    biometricAuth: false,
    sessionTimeout: 30,
    maxLoginAttempts: 3,
    ipWhitelist: false,
  });

  const handlePermissionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setPermissions(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setNotifications(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSecurityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setSecurity(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSessionTimeoutChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSecurity(prev => ({
      ...prev,
      sessionTimeout: parseInt(e.target.value)
    }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Security Permissions</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="autoFreeze" className="text-sm font-medium text-gray-700">
                Automatically freeze assets on critical threats
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Immediately freeze suspicious assets across all connected chains
              </p>
            </div>
            <input
              type="checkbox"
              id="autoFreeze"
              name="autoFreeze"
              checked={permissions.autoFreeze}
              onChange={handlePermissionChange}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="requireConfirmation" className="text-sm font-medium text-gray-700">
                Require confirmation for high-risk actions
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Always ask for user confirmation before executing critical security operations
              </p>
            </div>
            <input
              type="checkbox"
              id="requireConfirmation"
              name="requireConfirmation"
              checked={permissions.requireConfirmation}
              onChange={handlePermissionChange}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="crossChainOperations" className="text-sm font-medium text-gray-700">
                Allow cross-chain security operations
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Enable security actions that span multiple blockchain networks
              </p>
            </div>
            <input
              type="checkbox"
              id="crossChainOperations"
              name="crossChainOperations"
              checked={permissions.crossChainOperations}
              onChange={handlePermissionChange}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="aiAnalysis" className="text-sm font-medium text-gray-700">
                Enable AI-powered threat analysis
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Use Gemini AI for advanced threat detection and pattern recognition
              </p>
            </div>
            <input
              type="checkbox"
              id="aiAnalysis"
              name="aiAnalysis"
              checked={permissions.aiAnalysis}
              onChange={handlePermissionChange}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="realTimeMonitoring" className="text-sm font-medium text-gray-700">
                Real-time threat monitoring
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Continuously monitor blockchain transactions for security threats
              </p>
            </div>
            <input
              type="checkbox"
              id="realTimeMonitoring"
              name="realTimeMonitoring"
              checked={permissions.realTimeMonitoring}
              onChange={handlePermissionChange}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="emergencyStop" className="text-sm font-medium text-gray-700">
                Emergency stop capability
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Allow immediate halt of all cross-chain operations in emergency situations
              </p>
            </div>
            <input
              type="checkbox"
              id="emergencyStop"
              name="emergencyStop"
              checked={permissions.emergencyStop}
              onChange={handlePermissionChange}
              className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Notification Preferences</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email notifications
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Receive security alerts and reports via email
              </p>
            </div>
            <input
              type="checkbox"
              id="email"
              name="email"
              checked={notifications.email}
              onChange={handleNotificationChange}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="push" className="text-sm font-medium text-gray-700">
                Push notifications
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Get instant alerts on your device for critical threats
              </p>
            </div>
            <input
              type="checkbox"
              id="push"
              name="push"
              checked={notifications.push}
              onChange={handleNotificationChange}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="telegram" className="text-sm font-medium text-gray-700">
                Telegram notifications
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Send alerts to your Telegram channel or group
              </p>
            </div>
            <input
              type="checkbox"
              id="telegram"
              name="telegram"
              checked={notifications.telegram}
              onChange={handleNotificationChange}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="discord" className="text-sm font-medium text-gray-700">
                Discord notifications
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Send alerts to your Discord server
              </p>
            </div>
            <input
              type="checkbox"
              id="discord"
              name="discord"
              checked={notifications.discord}
              onChange={handleNotificationChange}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Authentication & Security</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="twoFactorAuth" className="text-sm font-medium text-gray-700">
                Two-factor authentication
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Require 2FA for all security-critical operations
              </p>
            </div>
            <input
              type="checkbox"
              id="twoFactorAuth"
              name="twoFactorAuth"
              checked={security.twoFactorAuth}
              onChange={handleSecurityChange}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="biometricAuth" className="text-sm font-medium text-gray-700">
                Biometric authentication
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Use fingerprint or face recognition for additional security
              </p>
            </div>
            <input
              type="checkbox"
              id="biometricAuth"
              name="biometricAuth"
              checked={security.biometricAuth}
              onChange={handleSecurityChange}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="sessionTimeout" className="text-sm font-medium text-gray-700">
                Session timeout
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Automatically log out after inactivity
              </p>
            </div>
            <select
              id="sessionTimeout"
              value={security.sessionTimeout}
              onChange={handleSessionTimeoutChange}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
              <option value={120}>2 hours</option>
              <option value={480}>8 hours</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="ipWhitelist" className="text-sm font-medium text-gray-700">
                IP address whitelist
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Only allow access from specific IP addresses
              </p>
            </div>
            <input
              type="checkbox"
              id="ipWhitelist"
              name="ipWhitelist"
              checked={security.ipWhitelist}
              onChange={handleSecurityChange}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Advanced Settings</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">
                API Rate Limiting
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Limit API calls to prevent abuse and ensure service stability
              </p>
            </div>
            <button className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-md transition-colors">
              Configure
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Backup & Recovery
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Manage encrypted backups and recovery procedures
              </p>
            </div>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors">
              Manage
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Audit Logs
              </label>
              <p className="text-xs text-gray-500 mt-1">
                View and export security audit logs
              </p>
            </div>
            <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md transition-colors">
              View Logs
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <button className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-md transition-colors">
          Reset to Defaults
        </button>
        <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default Settings; 