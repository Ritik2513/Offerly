import { nanoid } from "nanoid";
import TrackingLink from "./trackingLink.model.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { clickQueue } from "../../queues/click.queue.js";

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

export const trackClick = async (req, res) => {
  try {
    const { slug } = req.params;

    const link = await TrackingLink.findOne({ slug }).populate("offer");

    if (!link) return res.status(404).send("Invalid tracking link");

    const clickData = {
      trackingLinkId: link._id,
      affiliateId: link.affiliate,
      offerId: link.offer._id,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
      referer: req.headers.referer || "direct",
      timestamp: Date.now(),
    };

    //push job to queue (non-blocking)
    await clickQueue.add("trackClick", clickData);

    //instant redirect
    return res.redirect(link.offer.landingPageUrl);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Tracking Error");
  }
};
