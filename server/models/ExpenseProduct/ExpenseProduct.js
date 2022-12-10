const { Schema, model, Types } = require('mongoose');

const expenseProduct = new Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true },
    price: { type: Number, required: true },
    priceuzs: { type: Number, required: true },
    total: { type: Number, required: true },
    market: { type: Schema.Types.ObjectId, ref: 'Market' },
    product: { type: Schema.Types.ObjectId, ref: 'Product' },
    isArchive: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

module.exports.ExpenseProduct = model('ExpenseProduct', expenseProduct);
