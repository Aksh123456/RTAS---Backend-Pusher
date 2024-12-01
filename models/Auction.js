const mongoose = require('mongoose');

const auctionSchema = new mongoose.Schema({
  product: { type: String, required: true },
  currentBid: { type: Number, default: 0 },
  highestBidder: { type: String, default: '' },
  timer: { type: Number, default: 30 },
  isActive: { type: Boolean, default: true },
  isSold: { type: Boolean, default: false },
  isBuyNowLive: { type: Boolean, default: false },
  buyNowTimerLeft: { type: Date },
  soldAt: { type: Date },
});

module.exports = mongoose.model('Auction', auctionSchema);
