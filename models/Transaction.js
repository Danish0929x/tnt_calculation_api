const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  txHash: {
    type: String,
    unique: true
  },
  transactionRemark: {
    type: String
  },
  creditedAmount: {
    type: Number,
    default: 0
  },
  debitedAmount: {
    type: Number,
    default: 0
  },
  tokenType: {
    type: String,
    default: 'USDT-BEP20'
  },
  fromAddress: {
    type: String
  },
  toAddress: {
    type: String
  },
  blockNumber: {
    type: Number
  },
  currentBalance: {
    type: Number
  },
  walletName: {
    type: String,
    enum: ['USDTBalance', 'depositBalance'],
    required: true
  },
  status: {
    type: String,
    required: true
  },
  metadata: mongoose.Schema.Types.Mixed
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);