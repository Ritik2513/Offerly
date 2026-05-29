import Conversion from "../conversions/conversion.model.js";
import Payout from "./payout.model.js";

export const createPayout = async (req, res) => {
  try {
    const { affiliateId } = req.body;

    const conversions = await Conversion.find({
      affiliate: affiliateId,
      payout: { $gt: 0 },
      payoutStatus: {
        $ne: "paid",
      },
    });

    if (!conversions.length) {
      return res.status(400).json({
        success: false,
        message: "No payable conversions",
      });
    }

    const totalAmount = conversions.reduce((acc, curr) => acc + curr.payout, 0);

    const payout = await Payout.create({
      affiliate: affiliateId,
      amount: totalAmount,
      conversions: conversions.map((c) => c._id),
    });

    await Conversion.updateMany(
      {
        _id: {
          $in: conversions.map((c) => c._id),
        },
      },
      { payoutStatus: "paid" },
    );

    res.status(201).json({ success: true, payout });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to create payout" });
  }
};

export const getPayout = async (req, res) => {
  try {
    const payouts = await Payout.find()
      .populate("affiliate", "name email")
      .sort({
        createdAt: -1,
      });

    // analytics
    const totalPaid = payouts.reduce(
      (acc, curr) => (curr.status === "paid" ? acc + curr.amount : acc),
      0,
    );

    const totalPending = payouts.reduce(
      (acc, curr) => (curr.status === "pending" ? acc + curr.amount : acc),
      0,
    );

    const totalPayouts = payouts.length;

    const uniqueAffiliates = new Set(
      payouts.map((p) => p.affiliate?._id.toString()),
    ).size;

    res.status(200).json({
      success: true,

      payouts,

      analytics: {
        totalPaid,
        totalPending,
        totalPayouts,
        uniqueAffiliates,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch payouts",
    });
  }
};
