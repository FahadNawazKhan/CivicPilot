import Progress from '../models/Progress.js';

/**
 * Retrieves progress for a specific user.
 * Returns default empty states if the user record does not exist in the database.
 */
export const getProgress = async (req, res) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'User is not authenticated.' });
    }

    if (!/^[a-zA-Z0-9\-_]{2,100}$/.test(userId.toString())) {
      return res.status(400).json({ error: 'Invalid user ID format.' });
    }

    const progress = await Progress.findOne({ userId });
    
    if (!progress) {
      return res.json({
        userId,
        completedSteps: {},
        verifiedDocs: {},
        activeJourneys: []
      });
    }

    res.json({
      userId: progress.userId,
      completedSteps: progress.completedSteps || {},
      verifiedDocs: progress.verifiedDocs || {},
      activeJourneys: progress.activeJourneys || []
    });
  } catch (error) {
    // TODO(security): Log detailed diagnostics safely, display generic sanitized message to user
    console.error('Error fetching progress:', error);
    res.status(500).json({ error: 'Error loading user progress.' });
  }
};

/**
 * Saves or updates progress for a specific user.
 * Uses findOneAndUpdate (upsert) to safely write progress payload details.
 */
export const saveProgress = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { completedSteps, verifiedDocs, activeJourneys } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'User is not authenticated.' });
    }

    // Validate userId to prevent malicious injection
    if (!/^[a-zA-Z0-9\-_]{2,100}$/.test(userId.toString())) {
      return res.status(400).json({ error: 'Invalid user ID format.' });
    }

    // Sanitize input payload types to avoid NoSQL schema-pollution or unexpected nesting
    const sanitizedCompletedSteps = (completedSteps && typeof completedSteps === 'object' && !Array.isArray(completedSteps)) ? completedSteps : {};
    const sanitizedVerifiedDocs = (verifiedDocs && typeof verifiedDocs === 'object' && !Array.isArray(verifiedDocs)) ? verifiedDocs : {};
    const sanitizedActiveJourneys = Array.isArray(activeJourneys) ? activeJourneys.filter(item => typeof item === 'string') : [];

    const progress = await Progress.findOneAndUpdate(
      { userId },
      {
        completedSteps: sanitizedCompletedSteps,
        verifiedDocs: sanitizedVerifiedDocs,
        activeJourneys: sanitizedActiveJourneys
      },
      { returnDocument: 'after', upsert: true, runValidators: true }
    );

    res.json({
      success: true,
      userId: progress.userId,
      completedSteps: progress.completedSteps,
      verifiedDocs: progress.verifiedDocs,
      activeJourneys: progress.activeJourneys
    });
  } catch (error) {
    // TODO(security): Log detailed diagnostics safely, display generic sanitized message to user
    console.error('Error saving progress:', error);
    res.status(500).json({ error: 'Error saving user progress.' });
  }
};