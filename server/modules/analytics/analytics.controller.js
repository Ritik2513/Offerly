import redisQueueConnection from "../../config/redisQueue.js";

//get /api/analytics/today
export const getTodayStats = async (req, res) => {
  try {
    const date = new Date().toISOString().slice(0, 10);

    const stats = await redisQueueConnection.hgetall(`stats:click:${date}`);

    res.json({
      success: true,
      data: stats || {},
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching stats" });
  }
};

//GET /api/analytics/countries
export const getCountryStats = async (req, res) => {
  try {
    const keys = await redisQueueConnection.keys("stats:country:*");

    const result = {};

    for (const key of keys) {
      const country = key.split(":")[2];
      const clicks = await redisQueueConnection.hget(key, "clicks");
      result[country] = clicks;
    }

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ message: "Error fetching country stats" });
  }
};

// GET /api/analytics/offers
export const getOfferStats = async (req, res) => {
  try {
    const keys = await redisQueueConnection.keys("stats:offer:*");

    const result = {};

    for (const key of keys) {
      const offerId = key.split(":")[2];
      const clicks = await redisQueueConnection.hget(key, "clicks");
      result[offerId] = clicks;
    }

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ message: "Error fetching offer stats" });
  }
};

//Get /api/analytics/affiliates
export const getAffiliateStats = async (req, res) => {
  try {
    const keys = await redisQueueConnection.keys("stats:affiliate:*");
    const result = {};

    for (const key of keys) {
      const affId = key.split(":")[2];
      const clicks = await redisQueueConnection.hget(key, "clicks");
      result[affId] = clicks;
    }

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ message: "Error fetching affiliate stats" });
  }
};

export const getClickTrends = async (req, res) => {
  try {
    const trendData = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);

      const date = d.toISOString().slice(0, 10);
      const total =
        (await redisQueueConnection.hget(`stats:click:${date}`, "total")) || 0;

      trendData.push({
        date: date.slice(5),
        clicks: Number(total),
      });
    }

    res.json({
      success: true,
      data: trendData,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching trends" });
  }
};
