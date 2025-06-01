const dbConnect = require("./db/dbConnect.js");
const { DailyBonus } = require("./functions/distributeDailyBonus.js");
const { removeTwiceTransaction } = require("./functions/removeTwiceTransaction.js");

dbConnect();

// Set the TZ environment variable to Asia/Kolkata (Indian Standard Time)
process.env.TZ = 'Asia/Kolkata';

// Get the current time in IST
const currentTime = new Date();
console.log("Current time in IST:", currentTime.toLocaleString()); 

(async () => {
  try {
    console.log("Function Start...");

    await removeTwiceTransaction();


    console.log("Function Completed.");
  } catch (error) {
    console.error("Error during direct bonus distribution:", error.message);
  }
})();