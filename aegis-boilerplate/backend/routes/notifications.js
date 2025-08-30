import express from 'express';

const router = express.Router();

// Get user notifications
router.get('/', async (req, res) => {
  try {
    const notifications = [
      { id: 1, type: 'info', message: 'Portfolio updated successfully', read: false, timestamp: new Date().toISOString() },
      { id: 2, type: 'warning', message: 'High gas fees on Ethereum network', read: true, timestamp: new Date().toISOString() },
      { id: 3, type: 'success', message: 'Transaction completed successfully', read: true, timestamp: new Date().toISOString() }
    ];
    
    res.json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Mark notification as read
router.put('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    // Mock update
    res.json({ success: true, message: `Notification ${id} marked as read` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
