const express = require('express');
const { getActiveAuctions, createAuction } = require('../controllers/auctionController');
const {placeBid, buyNowExpired, updateAuction} = require('../socketManager');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', auth, getActiveAuctions);


router.post("/place-bid",auth, placeBid);
router.post("/buy-now-expired",auth, buyNowExpired);
router.post("/update-auction",auth, updateAuction);

module.exports = router;
