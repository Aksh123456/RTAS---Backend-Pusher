// const jwt = require("jsonwebtoken");
// const Auction = require("./models/Auction"); // Update this path as per your project structure

// let auctionTimer = 30;
// let auctionInterval = null; // Timer interval
// let currentBid = 0;
// let highestBidder = null;

// // Start the auction timer
// const startAuctionTimer = async (io, auctionId) => {
//   if (auctionInterval) clearInterval(auctionInterval);

//   const auction = await Auction.findById(auctionId);
//   if (!auction) return;

//   auctionInterval = setInterval(async () => {
//     if (auctionTimer > 0) {
//       auctionTimer -= 1;
//       io.emit("update", {
//         currentBid,
//         highestBidder,
//         timer: auctionTimer,
//         auctionId: auctionId,
//       });
//     } else {
//       clearInterval(auctionInterval);
//       const buyNowTimerLeft = new Date(Date.now() + 10 * 60 * 1000); // Add 10 minutes

//       const updatedAuction = await Auction.findByIdAndUpdate(
//         auctionId,
//         {
//           isActive: false,
//           isBuyNowLive: true,
//           buyNowTimerLeft,
//         },
//         { new: true }
//       );

//       io.emit("auctionEnd", {
//         winner: updatedAuction.highestBidder,
//         currentBid,
//         auctionId: auctionId,
//       });

//       auctionTimer = 30; // Reset the timer
//     }
//   }, 1000);
// };

// // Socket.IO event handlers
// const socketManager = (io) => {
//   io.on("connection", (socket) => {
//     console.log("A user connected:", socket.id);

//     // Handle bid event
//     socket.on("bid", async ({ auctionId2, bidAmount, token }) => {
//       try {
//         const decoded = jwt.verify(token, "secret");
//         const auction = await Auction.findOne({
//           isActive: true,
//           isSold: false,
//           _id: auctionId2,
//         });

//         if (!auction) {
//           socket.emit("error", "No active auction found.");
//           return;
//         }

//         if (bidAmount > auction.currentBid) {
//           auction.currentBid = bidAmount;
//           auction.highestBidder = decoded.email;
//           auction.timer = 30;
//           await auction.save();

//           currentBid = auction.currentBid;
//           highestBidder = auction.highestBidder;

//           io.emit("update", {
//             currentBid: auction.currentBid,
//             highestBidder: auction.highestBidder,
//             timer: auction.timer,
//             auctionId: auction._id,
//           });

//           startAuctionTimer(io, auction._id);
//         } else {
//           socket.emit("error", "Bid must be higher than the current bid.");
//         }
//       } catch (error) {
//         console.error("Error handling bid event:", error);
//         socket.emit("error", "An error occurred while placing the bid.");
//       }
//     });

//     // Handle auction reactivation
//     socket.on("buyNowExpired", async ({ auctionId }) => {
//       try {
//         const auction = await Auction.findByIdAndUpdate(
//           auctionId,
//           {
//             isActive: true,
//             isBuyNowLive: false,
//             buyNowTimerLeft: null,
//             highestBidder: "",
//           },
//           { new: true }
//         );

//         if (auction) {
//           io.emit("auctionReactivated", { auctionId });
//         }
//       } catch (error) {
//         console.error("Error reactivating auction:", error);
//       }
//     });

//     // Handle auction update
//     socket.on("updateAuction", async (auctionId2) => {
//       try {
//         const auction = await Auction.findByIdAndUpdate(
//           auctionId2,
//           { isSold: true, isActive: false, soldAt: new Date() },
//           { new: true }
//         );

//         if (auction) {
//           io.emit("auctionReactivated", { auctionId2 });
//         }
//       } catch (error) {
//         console.error("Error updating auction:", error);
//       }
//     });

//     socket.on("disconnect", () => {
//       console.log("User disconnected:", socket.id);
//     });
//   });
// };

// module.exports = socketManager;


const jwt = require("jsonwebtoken");
const Auction = require("./models/Auction");
const pusher = require("./pusher");

let auctionTimer = 30;
let auctionInterval = null;
let currentBid = 0;
let highestBidder = null;

// Start Auction Timer

// ------------------------- working condtion as on 12 baje ---------------------------//


const startAuctionTimer = async (pusher, auctionId) => {
  console.log(pusher, auctionId, 'hapyyyyyy')
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
// console.log(req.body,req.user, 'body')
    const decoded = req.user.email;
    console.log(decoded, 'id')
    const auction = await Auction.findOne({
      isActive: true,
      isSold: false,
      _id: auctionId,
    });

    if (!auction) {
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
console.log('happpy')
      startAuctionTimer(pusher, auction._id);

      return res.status(200).json({ data: auction, message: "Bid placed successfully.", status: 200 });
    } else {
      return res.status(400).json({ error: "Bid must be higher than the current bid." });
    }
  } catch (error) {
    console.error("Error handling bid event:", error);
    return res.status(500).json({ error: "An error occurred while placing the bid." });
  }
};

// ------------------------- working condtion as on 12 baje ---------------------------//


// let auctionInterval;
// let auctionTimer = 30; // Default to 30 seconds for auction timer

// Function to start the auction timer

// const startAuctionTimer = async (pusher, auctionId) => {
//   // console.log(pusher, auctionId, 'hapyyyyyy');

//   // Clear any existing intervals to start a new one
//   if (auctionInterval) clearInterval(auctionInterval);

//   const auction = await Auction.findById(auctionId);
//   if (!auction) return;

//   auctionInterval = setInterval(async () => {
//     if (auctionTimer > 0) {
//       auctionTimer -= 1;

//       // Update auctionTimerLeft each time the timer ticks down
//       // auction.auctionTimerLeft = new Date(Date.now() + auctionTimer * 1000);


//       console.log(auction.auctionTimerLeft, 'timerleft')
//       await auction.save(); // Save the updated auction with the new auctionTimerLeft

//       // Push real-time updates via Pusher
//       pusher.trigger("auction-channel", "update", {
//         currentBid: auction.currentBid,
//         highestBidder: auction.highestBidder,
//         timer: auctionTimer,
//         auctionTimerLeft: auction.auctionTimerLeft, // Send the updated auctionTimerLeft
//         auctionId,
//       });
//     } else {
//       clearInterval(auctionInterval);

//       // Set Buy Now Timer and mark auction as inactive when auction ends
//       const buyNowTimerLeft = new Date(Date.now() + 10 * 60 * 1000); // Add 10 minutes
//       const updatedAuction = await Auction.findByIdAndUpdate(
//         auctionId,
//         {
//           isActive: false,
//           isBuyNowLive: true,
//           buyNowTimerLeft,
//         },
//         { new: true }
//       );

//       // Notify via Pusher when auction ends
//       pusher.trigger("auction-channel", "auctionEnd", {
//         winner: updatedAuction.highestBidder,
//         currentBid: updatedAuction.currentBid,
//         auctionId,
//       });

//       // Reset auction timer
//       auctionTimer = 30;
//     }
//   }, 1000);
// };

// // Place Bid
// const placeBid = async (req, res) => {
//   try {
//     const { auctionId, bidAmount, token } = req.body;
//     const decoded = req.user.email;

//     const auction = await Auction.findOne({
//       isActive: true,
//       isSold: false,
//       _id: auctionId,
//     });

//     if (!auction) {
//       return res.status(400).json({ error: "No active auction found." });
//     }

//     if (bidAmount > auction.currentBid) {
//       // Update the bid and highest bidder
//       auction.currentBid = bidAmount;
//       auction.highestBidder = decoded;

//       // Reset the auctionTimerLeft to current time + 30 seconds
//       auction.auctionTimerLeft = new Date(Date.now() + 30 * 1000);

//       // Save updated auction to DB
//       await auction.save();


//       // Fetch the auction again to verify the update
//       const updatedAuction = await Auction.findById(auctionId);
//       console.log("auctionTimerLeft after save:", updatedAuction.auctionTimerLeft);

//       // console.log(auction.auctionTimerLeft, 'time akshay yyyyyyyyyyy')
//       // Push the updated auction state to clients via Pusher
//       pusher.trigger("auction-channel", "update", {
//         currentBid: auction.currentBid,
//         highestBidder: auction.highestBidder,
//         timer: auctionTimer,
//         auctionTimerLeft: auction.updatedAuction, // Send the updated auctionTimerLeft
//         auctionId: auction._id,
//       });

//       console.log('Bid placed successfully and auction timer updated!',auction.auctionTimerLeft );

//       // Start the auction timer or reset it when a new bid is placed
//       startAuctionTimer(pusher, auction._id);

//       return res.status(200).json({ data: auction, message: "Bid placed successfully.", status: 200 });
//     } else {
//       return res.status(400).json({ error: "Bid must be higher than the current bid." });
//     }
//   } catch (error) {
//     console.error("Error handling bid event:", error);
//     return res.status(500).json({ error: "An error occurred while placing the bid." });
//   }
// };


// Buy Now Expired
const buyNowExpired = async (req, res) => {
  const { auctionId } = req.body;
console.log(req.body, 'body')
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
    return res.status(500).json({ error: "An error occurred while reactivating the auction." });
  }
};

// Update Auction
const updateAuction = async (req, res) => {
  const { auctionId } = req.body;

  try {
    const auction = await Auction.findByIdAndUpdate(
      auctionId,
      { isSold: true, isActive: false, soldAt: new Date(), isBuyNowLive: false },
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
    return res.status(500).json({ error: "An error occurred while updating the auction." });
  }
};

module.exports = { placeBid, buyNowExpired, updateAuction };

