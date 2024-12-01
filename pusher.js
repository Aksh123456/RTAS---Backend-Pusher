const Pusher = require("pusher");

const pusher = new Pusher({
  //   appId: "YOUR_APP_ID",
  //   key: "YOUR_APP_KEY",
  //   secret: "YOUR_APP_SECRET",
  //   cluster: "YOUR_APP_CLUSTER",
  appId: "1904164",
  key: "0876dcda9524e34aab76",
  secret: "93ee5f7950ef6d8a9435",
  cluster: "ap2",
  useTLS: true,
});

// app_id = "1904164"
// key = "0876dcda9524e34aab76"
// secret = "93ee5f7950ef6d8a9435"
// cluster = "ap2"
module.exports = pusher;
