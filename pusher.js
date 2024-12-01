const Pusher = require("pusher");
require('dotenv').config();
const pusher = new Pusher({

  // appId: process.env.PUSHER_APP_ID,
  // key: process.env.PUSHER_KEY,
  // secret: process.env.PUSHER_SECRET,
  // cluster: process.env.PUSHER_CLUSTER,
  app_id : "1904164",
key : "0876dcda9524e34aab76",
secret :"93ee5f7950ef6d8a9435",
cluster : "ap2",
  useTLS: true,
});


module.exports = pusher;
