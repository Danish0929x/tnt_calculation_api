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

    for (let level = 1; level <= maxLevels; level++) {
      const currentUser = await User.findOne({ userId: currentUserId });
      if (!currentUser || currentUser.referrer === "TNT00001") {
        break;
      }

      const referrerId = currentUser.referrer;

      // NEW: Validate against your Bonus thresholds
      const validDirects = await validateActiveDirect(referrerId, level);
      if (!validDirects) {
        console.log(`User ${referrerId} does not meet bonus criteria at level ${level}`);
        break;
      }

      const distributionPercentage = getDistributionPercentage(level);
      const distributionAmount = (totalROI * distributionPercentage) / 100;

      if (await hasPackage(referrerId)) {
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
    1: 12,
    2: 8,
    3: 4,
  };
  return distributionPercentages[level] || 0;
}

/**
 * Check if a user has an active package
 */
async function hasPackage(userId) {
  const pkg = await Packages.findOne({ userId, status: "Active" });
  return pkg !== null;
}

/**
 * Validate active directs against your Bonus rules:
 *
 * Level 1 => need ≥2 direct actives, and ≥1 in level-2
 * Level 2 => need ≥2 in level-1, ≥4 in level-2, and ≥1 in level-3
 * Level 3 => need ≥2 in level-1, ≥6 in level-2, and ≥1 in level-3
 */
async function validateActiveDirect(userId, level) {
  // 1) Level-1 actives
  const directRefs = await User.find({ referrer: userId });
  const level1 = [];
  for (const u of directRefs) {
    if (await hasPackage(u.userId)) level1.push(u.userId);
  }
  const l1Count = level1.length;

  // 2) Level-2 actives
  const level2Set = new Set();
  for (const id1 of level1) {
    const children = await User.find({ referrer: id1 });
    for (const c of children) {
      if (await hasPackage(c.userId)) {
        level2Set.add(c.userId);
      }
    }
  }
  const l2Count = level2Set.size;

  // 3) Level-3 actives
  const level3Set = new Set();
  for (const id2 of level2Set) {
    const children = await User.find({ referrer: id2 });
    for (const c of children) {
      if (await hasPackage(c.userId)) {
        level3Set.add(c.userId);
      }
    }
  }
  const l3Count = level3Set.size;

  // Define your thresholds per level
  let req = {};
  if (level === 1) {
    req = { l1: 2, l2: 1 };
  } else if (level === 2) {
    req = { l1: 2, l2: 4, l3: 1 };
  } else if (level === 3) {
    req = { l1: 2, l2: 6, l3: 1 };
  } else {
    return false;
  }

  if (l1Count < req.l1) return false;
  if (req.l2 != null && l2Count < req.l2) return false;
  if (req.l3 != null && l3Count < req.l3) return false;
  return true;
}

module.exports = {
  calculateAndDistributeTeamROI,
};
