const { Schema, model } = require('mongoose');

const Income = new Schema(
  {
    incomeName: { type: Schema.Types.ObjectId, ref: 'IncomeName' },
    comment: { type: String },
    totalprice: { type: Number, required: true },
    totalpriceuzs: { type: Number, required: true },
    type: { type: String, required: true },
    market: { type: Schema.Types.ObjectId, ref: 'Market', required: true },
    isArchive: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const IncomeName = new Schema(
  {
    name: { type: String, required: true },
    market: { type: Schema.Types.ObjectId, ref: 'Market', required: true },
    isArchive: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

module.exports.IncomeName = model('IncomeName', IncomeName);
module.exports.Income = model('Income', Income);
