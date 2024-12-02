// const jwt = require("jsonwebtoken");
const Auction = require("./models/Auction");
const pusher = require("./pusher");

let auctionTimer = 30;
let auctionInterval = null;
let currentBid = 0;
let highestBidder = null;

// Start Auction Timer



const startAuctionTimer = async (pusher, auctionId) => {
  console.log(pusher, auctionId, "hapyyyyyy");
  if (auctionInterval) clearInterval(auctionInterval);

  const auction = await Auction.findById(auctionId);
  if (!auction) return;

  auctionInterval = setInterval(async () => {
    if (auctionTimer > 0) {
      auctionTimer -= 1;

      // Push real-time updates via Pusher
      pusher.trigger("auction-channel", "update", {
        currentBid,
        highestBidder,
        timer: auctionTimer,
        auctionId,
      });
    } else {
      clearInterval(auctionInterval);

      const buyNowTimerLeft = new Date(Date.now() + 10 * 60 * 1000); // Add 10 minutes
      const updatedAuction = await Auction.findByIdAndUpdate(
        auctionId,
        {
          isActive: false,
          isBuyNowLive: true,
          buyNowTimerLeft,
        },
        { new: true }
      );

      pusher.trigger("auction-channel", "auctionEnd", {
        winner: updatedAuction.highestBidder,
        currentBid,
        auctionId,
      });

      auctionTimer = 30; // Reset the timer
    }
  }, 1000);
};

// // Place Bid

const placeBid = async (req, res) => {
  try {
    const { auctionId, bidAmount, token } = req.body;
    console.log(req.body,req.user, 'body')
    const decoded = req.user.email;
    console.log(decoded, "id");
    const auction = await Auction.findOne({
      isActive: true,
      isSold: false,
      _id: auctionId,
    });

    console.log(auction, 'auctionss12')

    if (!auction) {
      console.log(auction, 'auctionss')
      return res.status(400).json({ error: "No active auction found." });
    }

    if (bidAmount > auction.currentBid) {
      auction.currentBid = bidAmount;
      auction.highestBidder = decoded;
      auction.timer = 30;
      await auction.save();

      currentBid = auction.currentBid;
      highestBidder = auction.highestBidder;

      pusher.trigger("auction-channel", "update", {
        currentBid: auction.currentBid,
        highestBidder: auction.highestBidder,
        timer: auction.timer,
        auctionId: auction._id,
      });
      console.log("happpy");
      startAuctionTimer(pusher, auction._id);

      return res
        .status(200)
        .json({
          data: auction,
          message: "Bid placed successfully.",
          status: 200,
        });
    } else {
      console.log('hi')
      return res
        .status(400)
        .json({ error: "Bid must be higher than the current bid." });
    }
  } catch (error) {
    console.error("Error handling bid event:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while placing the bid." });
  }
};





// Buy Now Expired
const buyNowExpired = async (req, res) => {
  const { auctionId } = req.body;
  console.log(req.body, "body");
  try {
    const auction = await Auction.findByIdAndUpdate(
      auctionId,
      {
        isActive: true,
        isBuyNowLive: false,
        buyNowTimerLeft: null,
        highestBidder: "",
      },
      { new: true }
    );

    if (auction) {
      pusher.trigger("auction-channel", "auctionReactivated", { auctionId });
      return res.status(200).json({ message: "Auction reactivated." });
    } else {
      return res.status(404).json({ error: "Auction not found." });
    }
  } catch (error) {
    console.error("Error reactivating auction:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while reactivating the auction." });
  }
};

// Update Auction
const updateAuction = async (req, res) => {
  const { auctionId } = req.body;

  try {
    const auction = await Auction.findByIdAndUpdate(
      auctionId,
      {
        isSold: true,
        isActive: false,
        soldAt: new Date(),
        isBuyNowLive: false,
      },
      { new: true }
    );

    if (auction) {
      pusher.trigger("auction-channel", "auctionUpdated", { auctionId });
      return res.status(200).json({ message: "Auction updated." });
    } else {
      return res.status(404).json({ error: "Auction not found." });
    }
  } catch (error) {
    console.error("Error updating auction:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while updating the auction." });
  }
};

module.exports = { placeBid, buyNowExpired, updateAuction };
