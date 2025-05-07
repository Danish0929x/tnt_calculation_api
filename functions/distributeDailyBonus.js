const Transaction = require("../models/Transaction");
const Wallet = require("../models/Wallet");
const Packages = require("../models/Packages");
const { calculateAndDistributeTeamROI } = require("./DistributeComissionBonus");
const {
  performWalletTransaction,
} = require("../utils/performWalletTransaction");

async function DailyBonus() {
  try {
    console.log("Starting Daily Bonus distribution...");

    const activePackages = await Packages.find({
      status: "Active",
    });

    const totalPackages = activePackages.length; // Total number of packages
    let packageCounter = 0; // Counter to track processed packages

    // Loop through each active package
    for (const packageDoc of activePackages) {
      const { _id, userId, packageAmount, ROI } = packageDoc;
      let dailyBonus = packageAmount * 0.02; // Flat 2% Daily Bonus

      // Perform the wallet transaction with the full 2% daily bonus (walletName = 'USDTBalance')
      const roundedDailyBonus = Math.round(dailyBonus * 100) / 100;
      await performWalletTransaction(
        userId,
        dailyBonus,
        "USDTBalance",
        "Daily Bonus Received",
        "Completed"
      );
      console.log(
        userId,
        dailyBonus,
        "USDTBalance",
        "Daily Bonus - Daily Bonus Received",
        "Completed"
      );

      await calculateAndDistributeTeamROI(userId, roundedDailyBonus);

      // Update progress after processing each package
      packageCounter++;
      console.log(`${packageCounter}/${totalPackages} packages completed`);
    }

    console.log("Daily Bonus distribution completed.");
  } catch (error) {
    console.error("Error during Daily Bonus distribution:", error.message);
  }
}

module.exports = {
  DailyBonus,
};
