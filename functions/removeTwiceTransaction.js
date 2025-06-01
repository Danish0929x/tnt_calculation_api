const Transaction = require("../models/Transaction");

async function removeTwiceTransaction() {
  try {
    const userId = "TNT14925";
    const remark = "Daily Bonus Received";

    // 1) Compute “start” as midnight today in IST
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // 2) Fetch ALL of today’s (and possibly yesterday/tomorrow’s) matching entries
    //    We sort ascending so the earliest createdAt is index 0, next is 1, etc.
    const txns = await Transaction.find({
      userId,
      transactionRemark: remark,
    }).sort({ createdAt: 1 });

    if (txns.length <= 1) {
      console.log(`Nothing to shift; found ${txns.length} "${remark}" txn(s).`);
      return;
    }

    // 3) Re-assign each entry to startOfToday + index days
    for (let i = 0; i < txns.length; i++) {
      const txn = txns[i];
      const newDate = new Date(startOfToday);
      newDate.setDate(newDate.getDate() + i);

      // Bypass Mongoose immutability:
      await Transaction.collection.updateOne(
        { _id: txn._id },
        { $set: { createdAt: newDate } }
      );

      console.log(
        `• Txn ${txn._id} moved from ${txn.createdAt.toLocaleString()} → ${newDate.toLocaleString()}`
      );
    }

    console.log(`Done. Re-dated ${txns.length} "${remark}" transactions.`);
  } catch (err) {
    console.error("Error in removeTwiceTransaction:", err);
    throw err;
  }
}

module.exports = { removeTwiceTransaction };
