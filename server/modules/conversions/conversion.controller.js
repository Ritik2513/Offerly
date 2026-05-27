import Conversion from "./conversion.model.js";

export const getConversions = async (req, res) => {
  try {
    const conversions = await Conversion.find()
      .populate("affiliate", "name email")
      .populate("offer", "title")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, conversions });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch conversions",
    });
  }
};
