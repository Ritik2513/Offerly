import User from "./user.model.js";

export const getAffiliates = async (req, res) => {
  try {
    const users = await User.find({
      role: "affiliate",
    }).select("name email");

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch affiliates",
    });
  }
};
