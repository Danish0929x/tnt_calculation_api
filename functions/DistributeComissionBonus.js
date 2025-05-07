const Packages = require("../models/Packages");
const User = require("../models/User");
const { performWalletTransaction } = require("../utils/performWalletTransaction");

/**
 * Distribute ROI to the team, based on a user's sponsor hierarchy and their package
 */
async function calculateAndDistributeTeamROI(userId, totalROI) {
  const maxLevels = 3; // Max levels for team distribution

  try {
    let currentUserId = userId;

    // Loop through the levels and calculate ROI for each referrer in the hierarchy
    for (let level = 1; level <= maxLevels; level++) {
      // Find the current user's details
      const currentUser = await User.findOne({ userId: currentUserId });
      if (!currentUser || currentUser.referrer === "TNT00001") {
        break; // Stop if no referrer or root referrer found
      }

      const referrerId = currentUser.referrer;

      // Validate active directs for each level
      const validDirects = await validateActiveDirect(referrerId, level);
      if (!validDirects) {
        console.log(`User ${referrerId} does not have enough active directs at level ${level}`);
        break; // Stop if the referrer does not meet the active directs condition
      }

      const distributionPercentage = getDistributionPercentage(level); // Get the distribution percentage based on the level
      const distributionAmount = (totalROI * distributionPercentage) / 100;

      // Check if referrer has an active package
      const isActive = await hasPackage(referrerId);
      if (isActive) {
        // Perform wallet transaction if referrer is active
        await performWalletTransaction(
          referrerId,
          distributionAmount,
          "USDTBalance",
          `Team Commission - from level ${level} By ${userId}`,
          "Completed"
        );
        console.log(
          referrerId,
          distributionAmount,
          "USDTBalance",
          `Team Commission - from level ${level} By ${userId}`,
          "Completed"
        );
      } 

      // Move to the next referrer in the hierarchy
      currentUserId = referrerId;
    }

    console.log("Team-level ROI distribution completed.");
  } catch (error) {
    console.error("Error distributing team-level ROI:", error);
  }
}

/**
 * Get distribution percentage based on the level
 */
function getDistributionPercentage(level) {
  const distributionPercentages = {
    1: 20,
    2: 15,
    3: 10,
  };

  // Return the distribution percentage for the given level
  return distributionPercentages[level] || 0;
}

/**
 * Check if a user has an active package
 */
async function hasPackage(userId) {
  const package = await Packages.findOne({ userId, status: "Active" });
  return package !== null;
}

/**
 * Validate the number of active directs for a user at a given level
 */
async function validateActiveDirect(userId, level) {
  // Get the number of direct referrers with an active package
  const directReferrers = await User.find({ referrer: userId });
  const activeDirects = await Promise.all(
    directReferrers.map(async (referrer) => {
      const isActive = await hasPackage(referrer.userId);
      return isActive;
    })
  );

  // Check if the number of active directs meets the level requirement
  const activeDirectCount = activeDirects.filter(Boolean).length;
  return activeDirectCount >= level * 2;
}

module.exports = {
  calculateAndDistributeTeamROI,
};
