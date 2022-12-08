const { Schema, model } = require('mongoose');

const Consumption = new Schema(
  {
    incomeName: { type: Schema.Types.ObjectId, ref: 'IncomeName' },
    comment: { type: String },
    type: { type: String, required: true },
    totalprice: { type: Number, required: true },
    totalpriceuzs: { type: Number, required: true },
    market: { type: Schema.Types.ObjectId, ref: 'Market', required: true },
    isArchive: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

module.exports.Consumption = model('Consumption', Consumption);
