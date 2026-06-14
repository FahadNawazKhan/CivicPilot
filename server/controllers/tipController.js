import Tip from '../models/Tip.js';

/**
 * Retrieves all tips for a process and calculates average statistics via MongoDB Aggregation.
 */
export const getTipsByProcess = async (req, res) => {
  try {
    const { processId } = req.params;

    if (!processId || !/^[a-zA-Z0-9\-_]{2,100}$/.test(processId)) {
      return res.status(400).json({ error: 'Invalid process identifier.' });
    }

    // 1. Run Aggregation Pipeline to get stats
    const statsResult = await Tip.aggregate([
      { $match: { processId } },
      {
        $group: {
          _id: "$processId",
          avgDays: { $avg: "$estimatedDays" },
          totalReviews: { $sum: 1 },
          minDays: { $min: "$estimatedDays" },
          maxDays: { $max: "$estimatedDays" }
        }
      }
    ]);

    const stats = statsResult[0] || {
      avgDays: 0,
      totalReviews: 0,
      minDays: 0,
      maxDays: 0
    };

    // Round the avgDays
    stats.avgDays = Math.round(stats.avgDays * 10) / 10;

    // 2. Query individual tips
    const tips = await Tip.find({ processId }).sort({ upvotes: -1, createdAt: -1 });

    res.json({
      stats,
      tips
    });
  } catch (error) {
    console.error('Error fetching tips:', error);
    res.status(500).json({ error: 'Error loading citizen tips.' });
  }
};

/**
 * Creates a new citizen tip/review in the MongoDB collection.
 */
export const createTip = async (req, res) => {
  try {
    const { processId, officeName, experienceText, estimatedDays, rating } = req.body;
    const username = req.user?.username || "Citizen Guest";

    if (!processId || !officeName || !experienceText || estimatedDays === undefined) {
      return res.status(400).json({ error: 'Please provide all required review fields.' });
    }

    const days = parseInt(estimatedDays);
    if (isNaN(days) || days < 0) {
      return res.status(400).json({ error: 'Estimated processing days must be a positive number.' });
    }

    const stars = parseInt(rating) || 5;

    const newTip = new Tip({
      processId,
      officeName,
      experienceText,
      estimatedDays: days,
      rating: Math.max(1, Math.min(5, stars)),
      username
    });

    await newTip.save();

    res.status(201).json({ success: true, tip: newTip });
  } catch (error) {
    console.error('Error creating tip:', error);
    res.status(500).json({ error: 'Error submitting citizen tip.' });
  }
};

/**
 * Upvotes a tip securely by tracking user identifier / IP address.
 */
export const upvoteTip = async (req, res) => {
  try {
    const { tipId } = req.params;
    const identifier = req.user?.userId || req.ip;

    const tip = await Tip.findById(tipId);
    if (!tip) {
      return res.status(404).json({ error: 'Tip not found.' });
    }

    if (tip.upvotedUsers.includes(identifier)) {
      return res.status(400).json({ error: 'You have already upvoted this tip.' });
    }

    tip.upvotes += 1;
    tip.upvotedUsers.push(identifier);
    await tip.save();

    res.json({ success: true, upvotes: tip.upvotes });
  } catch (error) {
    console.error('Error upvoting tip:', error);
    res.status(500).json({ error: 'Error processing upvote.' });
  }
};
