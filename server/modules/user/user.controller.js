import User from "./user.model.js";

export const createAffiliate = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Email already exists" });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: "affiliate",
    });

    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create Affiliate",
    });
  }
};

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

export const getAllAffiliates = async (req, res) => {
  try {
    const users = await User.find({
      role: "affiliate",
    }).sort({ createdAt: -1 });

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

export const toggleAffiliateStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Affiliate not found" });
    }

    user.isActive = !user.isActive;

    await user.save();

    res.status(200).json({ success: true, user });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to update affiliate" });
  }
};
