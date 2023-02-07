const { filter } = require('lodash');
const {
  Income,
  IncomeName,
} = require('../../models/Income_Consumption/Income');
const { Market } = require('../../models/MarketAndBranch/Market');
const { SaleProduct } = require('../../models/Sales/SaleProduct');

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
      req.body;
    const marke = await Market.findById(market);
    if (!marke) {
      return res.status(400).json({
        message: `Diqqat! Do'kon haqida malumotlar topilmadi.`,
      });
    }

    const names = await IncomeName.find({
      market
    })
      .select('-__v -isArchive -updatedAt')

    const filterNames = names.reduce((prev, el) => {
      prev.push(el.name)
      return prev;
    }, [])

    let incomes = null;

    if (incomeName) {
      incomes = await SaleProduct.find({
        market,
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      })
        .sort({ createdAt: -1 })
        .select('-isArchive -updatedAt -__v')
        .populate({
          path: 'product',
          select: 'productdata isFree',
          populate: {
            path: "productdata",
            select: "name"
          }
        })
        .then((incomes) => filter(incomes, (income) => income.isFree && income.product.productdata.name === incomeName));
    } else {
      incomes = await SaleProduct.find({
        market,
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      })
        .sort({ createdAt: -1 })
        .select('-isArchive -updatedAt -__v')
        .populate({
          path: 'product',
          select: 'productdata isFree',
          populate: {
            path: "productdata",
            select: "name"
          }
        })
        .then((incomes) => filter(incomes, (income) => income.product.isFree && filterNames.includes(income.product.productdata.name)));
    }

    const total = incomes.reduce((prev, el) => prev + el.totalprice, 0)
    const totaluzs = incomes.reduce((prev, el) => prev + el.totalpriceuzs, 0)

    res.status(200).json({
      count: incomes.length,
      incomes: incomes.splice(currentPage * countPage, countPage),
      total,
      totaluzs
    });
  } catch (error) {
    console.log(error);
    res.status(501).json({ error: 'Serverda xatolik yuz berdi...' });
  }
};
