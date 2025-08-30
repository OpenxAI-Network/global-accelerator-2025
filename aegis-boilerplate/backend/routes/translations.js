import express from 'express';

const router = express.Router();

// Get translations for a language
router.get('/:language', async (req, res) => {
  try {
    const { language } = req.params;
    
    // Mock translations
    const translations = {
      en: {
        'connect_wallet': 'Connect Wallet',
        'portfolio': 'Portfolio',
        'security': 'Security',
        'notifications': 'Notifications'
      },
      es: {
        'connect_wallet': 'Conectar Billetera',
        'portfolio': 'Portafolio',
        'security': 'Seguridad',
        'notifications': 'Notificaciones'
      },
      fr: {
        'connect_wallet': 'Connecter le Portefeuille',
        'portfolio': 'Portefeuille',
        'security': 'Sécurité',
        'notifications': 'Notifications'
      }
    };
    
    const langTranslations = translations[language] || translations.en;
    res.json({ success: true, data: langTranslations });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
