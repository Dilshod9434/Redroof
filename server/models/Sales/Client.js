const { Schema, model, Types } = require('mongoose');
const Joi = require('joi');

const client = new Schema(
  {
    name: { type: String, required: true },
    market: { type: Schema.Types.ObjectId, ref: 'Market', required: true },
    isArchive: { type: Boolean, default: false },
    packman: {
      type: Schema.Types.ObjectId,
      ref: 'Packman',
    },
    prepayment: { type: Number, default: 0 },
    prepaymentuzs: { type: Number, default: 0 },
    prepaymentType: { type: String },
  },
  {
    timestamps: true,
  }
);

function validateClient(client) {
  const schema = Joi.object({
    name: Joi.string().required(),
    market: Joi.string().required(),
  });

  return schema.validate(client);
}

module.exports.validateClient = validateClient;
module.exports.Client = model('Client', client);
