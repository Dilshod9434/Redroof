const {
  Temporary,
  validateTemporary,
} = require("../../models/Sales/Temporary");
const { Market } = require("../../models/MarketAndBranch/Market");

module.exports.register = async (req, res) => {
  try {
    const { temporary, market } = req.body;
    const marke = await Market.findById(market);
    if (!marke) {
      return res.status(400).json({
        message: `Diqqat! Do'kon haqida malumotlar topilmadi.`,
      });
    }

    const newTemporary = new Temporary({
      temporary,
      market,
    });
    await newTemporary.save();

    const temporaries = await Temporary.find({ market }).select(
      "temporary createdAt"
    );

    res.status(201).send(temporaries);
  } catch (error) {
    res.status(400).json({ error: "Serverda xatolik yuz berdi..." });
  }
};

module.exports.getAll = async (req, res) => {
  try {
    const { market } = req.body;
    const marke = await Market.findById(market);
    if (!marke) {
      return res.status(400).json({
        message: "Diqqat! Do'kon haqida malumotlari topilmadi!",
      });
    }

    const temporaries = await Temporary.find({ market }).select(
      "temporary createdAt"
    );

    res.status(201).send(temporaries);
  } catch (error) {
    res.status(501).json({ error: "Serverda xatolik yuz berdi..." });
  }
};

module.exports.getbById = async (req, res) => {
  try {
    const { market, temporaryId } = req.body;
    const marke = await Market.findById(market);
    if (!marke) {
      return res.status(400).json({
        message: "Diqqat! Do'kon haqida malumotlari topilmadi!",
      });
    }

    const temporary = await Temporary.findById(temporaryId).select("temporary");

    res.status(201).send(temporary);
  } catch (error) {
    res.status(501).json({ error: "Serverda xatolik yuz berdi..." });
  }
};

module.exports.deleteTemporary = async (req, res) => {
  try {
    const { _id, market } = req.body;

    const marke = await Market.findById(market);
    if (!marke) {
      return res
        .status(400)
        .json({ message: "Diqqat! Do'kon haqida malumot topilmadi!" });
    }

    await Temporary.findByIdAndDelete(_id);

    const temporaries = await Temporary.find({ market }).select(
      "temporary createdAt"
    );

    res.status(201).send(temporaries);
  } catch (error) {
    res.status(501).json({ error: "Serverda xatolik yuz berdi..." });
  }
};
