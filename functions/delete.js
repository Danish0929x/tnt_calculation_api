const Transaction = require("../models/Transaction");

async function deleteTransactionsWithROIStaked() {
  try {
    console.log("Deleting transactions with transactionRemark 'ROIStaked'...");

    // Delete transactions where transactionRemark is "ROIStaked"
    const result = await Transaction.deleteMany({ transactionRemark: "ROIStaked" });

    console.log(`${result.deletedCount} transactions deleted with 'ROIStaked' remark.`);
  } catch (error) {
    console.error("Error deleting transactions with 'ROIStaked':", error.message);
  }
}

module.exports = {
  deleteTransactionsWithROIStaked,
};
