const mongoose = require('mongoose');
require('dotenv').config();


// const connectDB = async () => {
//   try {
//     // await mongoose.connect('mongodb://127.0.0.1:27017/auction');
//     // await mongoose.connect('mongodb+srv://devakshay2107:62YhdkBb4z8VkyPv@realtimeauctionsystem.1u0ic.mongodb.net/RTAS?retryWrites=true&w=majority').then(()=> {
//     //   console.log('db')
//     // }).catch(err =>{
//     //   console.log(err, 'err')
//     // });



//     // mongodb+srv://devakshay2107:62YhdkBb4z8VkyPv@realtimeauctionsystem.1u0ic.mongodb.net/?retryWrites=true&w=majority&appName=RealTimeAuctionSystem

//     // mongodb+srv://devakshay2107:<db_password>@realtimeauctionsystem.1u0ic.mongodb.net/?retryWrites=true&w=majority&appName=RealTimeAuctionSystem
//     console.log("Database connected successfully");
//   } catch (error) {
//     console.error("Database connection failed:", error);
//     process.exit(1);
//   }
// };

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
};


module.exports = connectDB;
