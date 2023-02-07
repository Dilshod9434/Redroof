const { filter } = require('lodash');
const {
  Consumption,
  ConsumptionName,
} = require('../../models/Income_Consumption/Consumption');
const { Market } = require('../../models/MarketAndBranch/Market');
require('../../models/Income_Consumption/Income');

module.exports.create = async (req, res) => {
  try {
    const consumption = req.body;
    console.log(consumption);
    const marke = await Market.findById(consumption.market);
    if (!marke) {
      return res.status(400).json({
        message: `Diqqat! Do'kon haqida malumotlar topilmadi.`,
      });
    }

    const newConsumption = new Consumption(consumption);
    await newConsumption.save();

    const resData = await Consumption.findById(newConsumption._id)
      .select('-isArchive -updatedAt -__v')
      .populate('incomeName', 'name');

    res.status(200).json(resData);
  } catch (error) {
    console.log(error);
    res.status(501).json({ error: 'Serverda xatolik yuz berdi...' });
  }
};

module.exports.update = async (req, res) => {
  try {
    const { _id, totalprice, totalpriceuzs, type, incomeName, comment } =
      req.body;

    const updated = await Consumption.findByIdAndUpdate(_id, {
      totalprice: totalprice,
      totalpriceuzs: totalpriceuzs,
      type: type,
      incomeName: incomeName,
      comment: comment,
    });

    const resData = await Consumption.findById({ _id: updated._id })
      .select('-isArchive -updatedAt -__v')
      .populate('incomeName', 'name');

    res.status(200).json(resData);
  } catch (error) {
    res.status(501).json({ error: 'Serverda xatolik yuz berdi...' });
  }
};

module.exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    await Consumption.findByIdAndDelete(id);

    res.status(200).json(id);
  } catch (error) {
    res.status(501).json({ error: 'Serverda xatolik yuz berdi...' });
  }
};

module.exports.get = async (req, res) => {
  try {
    const { currentPage, countPage, startDate, endDate, market, incomeName } =
      req.body;

    const marke = await Market.findById(market);
    if (!marke) {
      return res.status(400).json({
        message: `Diqqat! Do'kon haqida malumotlar topilmadi.`,
      });
    }

    let consumptions = null;

    if (incomeName) {
      consumptions = await Consumption.find({
        market,
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      })
        .sort({ createdAt: -1 })
        .select('-isArchive -updatedAt -__v')
        .populate({
          path: 'incomeName',
          select: 'name',
          match: { name: incomeName },
        })
        .then((consumptions) =>
          filter(consumptions, (consumption) => consumption.incomeName)
        );
    } else {
      consumptions = await Consumption.find({
        market,
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      })
        .sort({ createdAt: -1 })
        .select('-isArchive -updatedAt -__v')
        .populate({
          path: 'incomeName',
          select: 'name',
        });
    }
    const totalprice = consumptions.reduce(
      (prev, con) => prev + con.totalprice,
      0
    );
    const totalpriceuzs = consumptions.reduce(
      (prev, con) => prev + con.totalpriceuzs,
      0
    );

    res.status(200).json({
      totalprice,
      totalpriceuzs,
      count: consumptions.length,
      consumptions: consumptions.splice(currentPage * countPage, countPage),
    });
  } catch (error) {
    console.log(error);
    res.status(501).json({ error: 'Serverda xatolik yuz berdi...' });
  }
};
