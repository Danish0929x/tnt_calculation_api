const User = require("../models/User");
const Wallet = require("../models/Wallet");

async function checkWalletsForUsers() {
  try {
    console.log("Checking if any wallet does not have a corresponding user...");

    // Get all wallets
    const wallets = await Wallet.find({});

    // Loop through each wallet and check if a corresponding user exists
    for (let wallet of wallets) {
      const user = await User.findOne({ userId: wallet.userId });

      if (!user) {
        console.log(`No user found for wallet with userId: ${wallet.userId}`);
        
        // Optionally, you can remove the wallet if it has no corresponding user
        await Wallet.deleteOne({ _id: wallet._id });
        console.log(`Deleted wallet with userId: ${wallet.userId}`);
      } else {
        console.log(`User found for wallet with userId: ${wallet.userId}`);
      }
    }
  } catch (error) {
    console.error("Error checking wallets for users:", error.message);
  }
}

module.exports = {
  checkWalletsForUsers,
};
