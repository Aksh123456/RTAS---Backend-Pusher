const Auction = require('../models/Auction');

exports.getActiveAuctions = async (req, res) => {
  try {
    const auctions = await Auction.find({
      $or: [{ isActive: true }, { isBuyNowLive: true }],
      isSold: false,
    });
    res.json(auctions);
  } catch (error) {
    console.error("Error fetching auctions:", error);
    res.status(500).json({ message: "An error occurred while fetching auctions." });
  }
};


