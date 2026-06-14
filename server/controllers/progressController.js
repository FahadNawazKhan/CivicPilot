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
        activeJourneys: [],
        documentVault: []
      });
    }

    res.json({
      userId: progress.userId,
      completedSteps: progress.completedSteps || {},
      verifiedDocs: progress.verifiedDocs || {},
      activeJourneys: progress.activeJourneys || [],
      documentVault: progress.documentVault || []
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
    const { completedSteps, verifiedDocs, activeJourneys, documentVault } = req.body;

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
    const sanitizedDocumentVault = Array.isArray(documentVault) ? documentVault : [];

    const progress = await Progress.findOneAndUpdate(
      { userId },
      {
        completedSteps: sanitizedCompletedSteps,
        verifiedDocs: sanitizedVerifiedDocs,
        activeJourneys: sanitizedActiveJourneys,
        documentVault: sanitizedDocumentVault
      },
      { returnDocument: 'after', upsert: true, runValidators: true }
    );

    res.json({
      success: true,
      userId: progress.userId,
      completedSteps: progress.completedSteps,
      verifiedDocs: progress.verifiedDocs,
      activeJourneys: progress.activeJourneys,
      documentVault: progress.documentVault
    });
  } catch (error) {
    // TODO(security): Log detailed diagnostics safely, display generic sanitized message to user
    console.error('Error saving progress:', error);
    res.status(500).json({ error: 'Error saving user progress.' });
  }
};

/**
 * Generates advanced document health and renewal insights using a MongoDB Aggregation Pipeline.
 * Performs nested unwinding, conditional date casting, segment tagging, and readiness scores.
 */
export const getVaultInsights = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User is not authenticated.' });
    }

    if (!/^[a-zA-Z0-9\-_]{2,100}$/.test(userId.toString())) {
      return res.status(400).json({ error: 'Invalid user ID format.' });
    }

    // Run the aggregation pipeline
    const result = await Progress.aggregate([
      { $match: { userId } },
      { $unwind: { path: "$documentVault", preserveNullAndEmptyArrays: false } },
      {
        $project: {
          doc: "$documentVault",
          hasExpiry: {
            $and: [
              { $eq: ["$documentVault.isPermanent", false] },
              { $ne: ["$documentVault.expiry", ""] },
              { $ne: ["$documentVault.expiry", null] }
            ]
          }
        }
      },
      {
        $project: {
          doc: 1,
          hasExpiry: 1,
          expiryDate: {
            $cond: {
              if: "$hasExpiry",
              then: { $toDate: "$doc.expiry" },
              else: null
            }
          }
        }
      },
      {
        $group: {
          _id: null,
          totalDocs: { $sum: 1 },
          permanentCount: {
            $sum: { $cond: [{ $eq: ["$doc.isPermanent", true] }, 1, 0] }
          },
          expiredCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    "$hasExpiry",
                    { $lt: ["$expiryDate", new Date()] }
                  ]
                },
                1,
                0
              ]
            }
          },
          criticalCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    "$hasExpiry",
                    { $gte: ["$expiryDate", new Date()] },
                    { $lte: ["$expiryDate", new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)] }
                  ]
                },
                1,
                0
              ]
            }
          },
          warningCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    "$hasExpiry",
                    { $gt: ["$expiryDate", new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)] },
                    { $lte: ["$expiryDate", new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)] }
                  ]
                },
                1,
                0
              ]
            }
          },
          validCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    "$hasExpiry",
                    { $gt: ["$expiryDate", new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)] }
                  ]
                },
                1,
                0
              ]
            }
          },
          // Get the document details of the next expiring one
          expiringDocuments: {
            $push: {
              $cond: {
                if: "$hasExpiry",
                then: {
                  id: "$doc.id",
                  typeName: "$doc.typeName",
                  holder: "$doc.holder",
                  number: "$doc.number",
                  expiry: "$doc.expiry",
                  linkProcess: "$doc.linkProcess",
                  daysLeft: {
                    $divide: [
                      { $subtract: ["$expiryDate", new Date()] },
                      1000 * 60 * 60 * 24
                    ]
                  }
                },
                else: "$$REMOVE"
              }
            }
          }
        }
      }
    ]);

    // If there is no document, return empty stats
    if (!result || result.length === 0) {
      return res.json({
        totalDocs: 0,
        healthScore: 100,
        expiredCount: 0,
        criticalCount: 0,
        warningCount: 0,
        validCount: 0,
        permanentCount: 0,
        nextRenewal: null
      });
    }

    const stats = result[0];
    
    // Sort expiring documents by days remaining to find the next expiry
    let nextRenewal = null;
    if (stats.expiringDocuments && stats.expiringDocuments.length > 0) {
      stats.expiringDocuments.sort((a, b) => a.daysLeft - b.daysLeft);
      // Floor/ceil the daysLeft
      stats.expiringDocuments.forEach(d => {
        d.daysLeft = Math.ceil(d.daysLeft);
      });
      nextRenewal = stats.expiringDocuments[0];
    }

    // Compute readiness score (Health Score)
    // Formula: validDocs + permanentDocs + 0.5 * warningDocs / totalDocs * 100
    const totalDocs = stats.totalDocs;
    const penaltyScore = (stats.expiredCount * 100) + (stats.criticalCount * 70) + (stats.warningCount * 30);
    const healthScore = Math.max(0, Math.min(100, Math.round(100 - (penaltyScore / totalDocs))));

    res.json({
      totalDocs,
      healthScore,
      expiredCount: stats.expiredCount,
      criticalCount: stats.criticalCount,
      warningCount: stats.warningCount,
      validCount: stats.validCount,
      permanentCount: stats.permanentCount,
      nextRenewal
    });
  } catch (error) {
    console.error('Error generating vault insights:', error);
    res.status(500).json({ error: 'Error generating MongoDB document vault insights.' });
  }
};