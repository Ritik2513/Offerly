import { nanoid } from "nanoid";
import TrackingLink from "./trackingLink.model.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { clickQueue } from "../../queues/click.queue.js";
import logger from "../../config/logger.js";

//Generate tracking link for affiliate
export const generateTrackingLink = asyncHandler(async (req, res) => {
  const { offerId, affiliateId } = req.body;

  const slug = nanoid(8);

  const link = await TrackingLink.create({
    slug,
    affiliate: req.user.role === "admin" ? affiliateId : req.user._id,
    offer: offerId,
  });

  res.status(201).json({
    message: "Tracking link created",
    trackingUrl: `${process.env.SERVER_URL}/api/tracking/t/${slug}`,
  });
});

export const trackClick = async (req, res) => {
  try {
    const { slug } = req.params;

    const link = await TrackingLink.findOne({ slug }).populate("offer");

    if (!link) return res.status(404).send("Invalid tracking link");

    const clickId = nanoid(12);

    const clickData = {
      clickId,
      trackingLinkId: link._id.toString(),
      affiliate: link.affiliate.toString(),
      offer: link.offer._id.toString(),
      ip: req.ip,
      userAgent: req.headers["user-agent"],
      referer: req.headers.referer || "direct",
      timestamp: Date.now(),
    };

    //push job to queue (non-blocking)
    await clickQueue.add("trackClick", clickData);

    //instant redirect
    const redirectUrl = new URL(link.offer.landingPageUrl);

    redirectUrl.searchParams.set("clickId", clickId);
    return res.redirect(redirectUrl.toString());
  } catch (error) {
    logger.error(error);
    return res.status(500).send("Tracking Error");
  }
};
