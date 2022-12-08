const { filter } = require('lodash');
const {
  Income,
  IncomeName,
} = require('../../models/Income_Consumption/Income');
const { Market } = require('../../models/MarketAndBranch/Market');

module.exports.create = async (req, res) => {
  try {
    const income = req.body;

    const marke = await Market.findById(income.market);
    if (!marke) {
      return res.status(400).json({
        message: `Diqqat! Do'kon haqida malumotlar topilmadi.`,
      });
    }

    const newIncome = new Income(income);
    await newIncome.save();

    const resData = await Income.findById(newIncome._id)
      .select('-isArchive -updatedAt -__v')
      .populate('incomeName', 'name');

    res.status(200).json(resData);
  } catch (error) {
    res.status(501).json({ error: 'Serverda xatolik yuz berdi...' });
  }
};

module.exports.update = async (req, res) => {
  try {
    const { _id, totalprice, totalpriceuzs, type, incomeName, comment } =
      req.body;

    const updated = await Income.findByIdAndUpdate(_id, {
      totalprice: totalprice,
      totalpriceuzs: totalpriceuzs,
      type: type,
      incomeName: incomeName,
      comment: comment,
    });

    const resData = await Income.findOne({ _id: updated._id })
      .select('-isArchive -updatedAt -__v')
      .populate('incomeName', 'name');

    res.status(200).json(resData);
  } catch (error) {
    console.log(error);
    res.status(501).json({ error: 'Serverda xatolik yuz berdi...' });
  }
};

module.exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(req.params);
    await Income.findByIdAndDelete(id);

    res.status(200).json(id);
  } catch (error) {
    console.log(error);
    res.status(501).json({ error: 'Serverda xatolik yuz berdi...' });
  }
};

module.exports.get = async (req, res) => {
  try {
    const { currentPage, countPage, startDate, endDate, market, incomeName } =
      req.query;
    const marke = await Market.findById(market);
    if (!marke) {
      return res.status(400).json({
        message: `Diqqat! Do'kon haqida malumotlar topilmadi.`,
      });
    }

    let incomes = null;

    if (incomeName) {
      incomes = await Income.find({
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
          match: { _id: incomeName },
        })
        .then((incomes) => filter(incomes, (income) => income.incomeName));
    } else {
      incomes = await Income.find({
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

    const totalprice = incomes.reduce(
      (prev, income) => prev + income.totalprice,
      0
    );
    const totalpriceuzs = incomes.reduce(
      (prev, income) => prev + income.totalpriceuzs,
      0
    );

    res.status(200).json({
      totalprice,
      totalpriceuzs,
      count: incomes.length,
      incomes: incomes.splice(currentPage * countPage, countPage),
    });
  } catch (error) {
    console.log(error);
    res.status(501).json({ error: 'Serverda xatolik yuz berdi...' });
  }
};
