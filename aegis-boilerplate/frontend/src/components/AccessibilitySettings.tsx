import React, { useState } from 'react';
import { useAccessibility } from './AccessibilityProvider';

interface AccessibilitySettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const AccessibilitySettings: React.FC<AccessibilitySettingsProps> = ({
  isOpen,
  onClose
}) => {
  const { settings, updateSettings, resetSettings, getText } = useAccessibility();
  const [activeTab, setActiveTab] = useState<'visual' | 'navigation' | 'language' | 'cognitive'>('visual');

  if (!isOpen) return null;

  const handleSettingChange = (key: keyof typeof settings, value: any) => {
    updateSettings({ [key]: value });
  };

  const handleReset = () => {
    if (window.confirm(getText('accessibility.resetConfirm'))) {
      resetSettings();
    }
  };

  const tabs = [
    { id: 'visual', label: getText('accessibility.tabs.visual'), icon: '👁️' },
    { id: 'navigation', label: getText('accessibility.tabs.navigation'), icon: '⌨️' },
    { id: 'language', label: getText('accessibility.tabs.language'), icon: '🌐' },
    { id: 'cognitive', label: getText('accessibility.tabs.cognitive'), icon: '🧠' },
  ];

  return (
    <div className="accessibility-settings-overlay" onClick={onClose}>
      <div className="accessibility-settings-panel" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>{getText('accessibility.title')}</h2>
          <button onClick={onClose} className="btn-close" aria-label={getText('accessibility.close')}>
            ×
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="settings-tabs" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="settings-content">
          {/* Visual Accessibility Tab */}
          {activeTab === 'visual' && (
            <div className="tab-content" role="tabpanel">
              <h3>{getText('accessibility.visual.title')}</h3>
              
              <div className="setting-group">
                <label className="setting-item">
                  <input
                    type="checkbox"
                    checked={settings.highContrast}
                    onChange={(e) => handleSettingChange('highContrast', e.target.checked)}
                  />
                  <span className="setting-label">{getText('accessibility.visual.highContrast')}</span>
                  <span className="setting-description">
                    {getText('accessibility.visual.highContrastDesc')}
                  </span>
                </label>

                <label className="setting-item">
                  <input
                    type="checkbox"
                    checked={settings.largeText}
                    onChange={(e) => handleSettingChange('largeText', e.target.checked)}
                  />
                  <span className="setting-label">{getText('accessibility.visual.largeText')}</span>
                  <span className="setting-description">
                    {getText('accessibility.visual.largeTextDesc')}
                  </span>
                </label>

                <label className="setting-item">
                  <input
                    type="checkbox"
                    checked={settings.reducedMotion}
                    onChange={(e) => handleSettingChange('reducedMotion', e.target.checked)}
                  />
                  <span className="setting-label">{getText('accessibility.visual.reducedMotion')}</span>
                  <span className="setting-description">
                    {getText('accessibility.visual.reducedMotionDesc')}
                  </span>
                </label>

                <div className="setting-item">
                  <span className="setting-label">{getText('accessibility.visual.colorBlindMode')}</span>
                  <select
                    value={settings.colorBlindMode}
                    onChange={(e) => handleSettingChange('colorBlindMode', e.target.value)}
                    className="setting-select"
                  >
                    <option value="none">{getText('accessibility.visual.colorBlindNone')}</option>
                    <option value="protanopia">{getText('accessibility.visual.colorBlindProtanopia')}</option>
                    <option value="deuteranopia">{getText('accessibility.visual.colorBlindDeuteranopia')}</option>
                    <option value="tritanopia">{getText('accessibility.visual.colorBlindTritanopia')}</option>
                  </select>
                  <span className="setting-description">
                    {getText('accessibility.visual.colorBlindDesc')}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Accessibility Tab */}
          {activeTab === 'navigation' && (
            <div className="tab-content" role="tabpanel">
              <h3>{getText('accessibility.navigation.title')}</h3>
              
              <div className="setting-group">
                <label className="setting-item">
                  <input
                    type="checkbox"
                    checked={settings.keyboardNavigation}
                    onChange={(e) => handleSettingChange('keyboardNavigation', e.target.checked)}
                  />
                  <span className="setting-label">{getText('accessibility.navigation.keyboard')}</span>
                  <span className="setting-description">
                    {getText('accessibility.navigation.keyboardDesc')}
                  </span>
                </label>

                <label className="setting-item">
                  <input
                    type="checkbox"
                    checked={settings.screenReader}
                    onChange={(e) => handleSettingChange('screenReader', e.target.checked)}
                  />
                  <span className="setting-label">{getText('accessibility.navigation.screenReader')}</span>
                  <span className="setting-description">
                    {getText('accessibility.navigation.screenReaderDesc')}
                  </span>
                </label>

                <label className="setting-item">
                  <input
                    type="checkbox"
                    checked={settings.focusIndicators}
                    onChange={(e) => handleSettingChange('focusIndicators', e.target.checked)}
                  />
                  <span className="setting-label">{getText('accessibility.navigation.focusIndicators')}</span>
                  <span className="setting-description">
                    {getText('accessibility.navigation.focusIndicatorsDesc')}
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Language Tab */}
          {activeTab === 'language' && (
            <div className="tab-content" role="tabpanel">
              <h3>{getText('accessibility.language.title')}</h3>
              
              <div className="setting-group">
                <div className="setting-item">
                  <span className="setting-label">{getText('accessibility.language.language')}</span>
                  <select
                    value={settings.language}
                    onChange={(e) => handleSettingChange('language', e.target.value)}
                    className="setting-select"
                  >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                    <option value="zh">中文</option>
                    <option value="ja">日本語</option>
                    <option value="ko">한국어</option>
                  </select>
                </div>

                <div className="setting-item">
                  <span className="setting-label">{getText('accessibility.language.region')}</span>
                  <select
                    value={settings.region}
                    onChange={(e) => handleSettingChange('region', e.target.value)}
                    className="setting-select"
                  >
                    <option value="US">United States</option>
                    <option value="GB">United Kingdom</option>
                    <option value="CA">Canada</option>
                    <option value="AU">Australia</option>
                    <option value="DE">Germany</option>
                    <option value="FR">France</option>
                    <option value="JP">Japan</option>
                    <option value="KR">South Korea</option>
                  </select>
                </div>

                <div className="setting-item">
                  <span className="setting-label">{getText('accessibility.language.currency')}</span>
                  <select
                    value={settings.currency}
                    onChange={(e) => handleSettingChange('currency', e.target.value)}
                    className="setting-select"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="JPY">JPY (¥)</option>
                    <option value="KRW">KRW (₩)</option>
                    <option value="CNY">CNY (¥)</option>
                  </select>
                </div>

                <div className="setting-item">
                  <span className="setting-label">{getText('accessibility.language.timezone')}</span>
                  <select
                    value={settings.timezone}
                    onChange={(e) => handleSettingChange('timezone', e.target.value)}
                    className="setting-select"
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="Europe/London">London</option>
                    <option value="Europe/Paris">Paris</option>
                    <option value="Asia/Tokyo">Tokyo</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Cognitive Accessibility Tab */}
          {activeTab === 'cognitive' && (
            <div className="tab-content" role="tabpanel">
              <h3>{getText('accessibility.cognitive.title')}</h3>
              
              <div className="setting-group">
                <label className="setting-item">
                  <input
                    type="checkbox"
                    checked={settings.simplifiedMode}
                    onChange={(e) => handleSettingChange('simplifiedMode', e.target.checked)}
                  />
                  <span className="setting-label">{getText('accessibility.cognitive.simplifiedMode')}</span>
                  <span className="setting-description">
                    {getText('accessibility.cognitive.simplifiedModeDesc')}
                  </span>
                </label>

                <label className="setting-item">
                  <input
                    type="checkbox"
                    checked={settings.autoSave}
                    onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
                  />
                  <span className="setting-label">{getText('accessibility.cognitive.autoSave')}</span>
                  <span className="setting-description">
                    {getText('accessibility.cognitive.autoSaveDesc')}
                  </span>
                </label>

                <label className="setting-item">
                  <input
                    type="checkbox"
                    checked={settings.confirmationDialogs}
                    onChange={(e) => handleSettingChange('confirmationDialogs', e.target.checked)}
                  />
                  <span className="setting-label">{getText('accessibility.cognitive.confirmationDialogs')}</span>
                  <span className="setting-description">
                    {getText('accessibility.cognitive.confirmationDialogsDesc')}
                  </span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Settings Actions */}
        <div className="settings-actions">
          <button onClick={handleReset} className="btn-reset">
            {getText('accessibility.reset')}
          </button>
          <button onClick={onClose} className="btn-apply">
            {getText('accessibility.apply')}
          </button>
        </div>

        {/* Keyboard Shortcuts Help */}
        <div className="keyboard-help">
          <h4>{getText('accessibility.keyboardShortcuts')}</h4>
          <div className="shortcuts-grid">
            <div className="shortcut">
              <kbd>Tab</kbd>
              <span>{getText('accessibility.shortcuts.navigate')}</span>
            </div>
            <div className="shortcut">
              <kbd>Enter</kbd>
              <span>{getText('accessibility.shortcuts.activate')}</span>
            </div>
            <div className="shortcut">
              <kbd>Escape</kbd>
              <span>{getText('accessibility.shortcuts.close')}</span>
            </div>
            <div className="shortcut">
              <kbd>Ctrl + A</kbd>
              <span>{getText('accessibility.shortcuts.selectAll')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessibilitySettings;
