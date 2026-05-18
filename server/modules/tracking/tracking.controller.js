import { nanoid } from "nanoid";
import TrackingLink from "./trackingLink.model.js";
import asyncHandler from "../../utils/asyncHandler.js";
import {} from "../../config/queue.js";

//Generate tracking link for affiliate
export const generateTrackingLink = asyncHandler(async (req, res) => {
  const { offerId } = req.body;

  const slug = nanoid(8);

  const link = await TrackingLink.create({
    slug,
    affiliate: req.user._id,
    offer: offerId,
  });

  res.status(201).json({
    message: "Tracking link created",
    trackingUrl: `${process.env.CLIENT_URL}/t/${slug}`,
  });
});


export const trackClick = async (req,res)=>{
  
}