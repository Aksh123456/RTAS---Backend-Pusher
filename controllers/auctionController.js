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

exports.createAuction = async (req, res) => {
  const { product, startingBid } = req.body;
  try {
    const newAuction = new Auction({
      product,
      currentBid: startingBid,
    });
    const savedAuction = await newAuction.save();
    res.status(201).json({ message: "Auction created successfully", auction: savedAuction });
  } catch (error) {
    console.error("Error creating auction:", error);
    res.status(500).json({ message: "Failed to create auction." });
  }
};
