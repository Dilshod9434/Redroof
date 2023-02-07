const { filter } = require('lodash');
const { Consumption } = require('../../models/Income_Consumption/Consumption');
const {
  IncomeName,
  Income,
} = require('../../models/Income_Consumption/Income');
const { Market } = require('../../models/MarketAndBranch/Market');
const { SaleProduct } = require('../../models/Sales/SaleProduct');

module.exports.getTotal = async (req, res) => {
  try {
    const { startDate, endDate, market, type } = req.query;

    const marke = await Market.findById(market);
    if (!marke) {
      return res.status(400).json({
        message: `Diqqat! Do'kon haqida malumotlar topilmadi.`,
      });
    }

    const names = await IncomeName.find({
      market,
    })
      .select('-isArchive -updatedAt -__v')
      .lean();

    const namesArr = [...names].reduce((prev, el) => {
      prev.push(el.name)
      return prev
    }, [])

    for (const name of names) {
      let count = new Date(startDate);
      let currentDate = new Date(endDate);

      const dailyIncomes = [];
      while (count <= currentDate) {
        let incomes = null;

        if (type === 'incomes') {
          incomes = await SaleProduct.find({
            market,
            createdAt: {
              $gte: new Date(
                new Date(count).setHours(0, 0, 0, 0)
              ).toISOString(),
              $lte: new Date(
                new Date(count).setHours(23, 59, 59, 59)
              ).toISOString(),
            },
          })
            .select('-isArchive -updatedAt -__v')
            .populate({
              path: "product",
              select: "productdata isFree",
              populate: {
                path: "productdata",
                select: "name"
              }
            })
            .then((incomes) => filter(incomes, (income) => income.product.isFree && income.product.productdata.name === name.name))
        }
        if (type === 'consumptions') {
          incomes = await Consumption.find({
            market,
            incomeName: name._id,
            createdAt: {
              $gte: new Date(
                new Date(count).setHours(0, 0, 0, 0)
              ).toISOString(),
              $lte: new Date(
                new Date(count).setHours(23, 59, 59, 59)
              ).toISOString(),
            },
          })
            .select('-isArchive -updatedAt -__v')
            .lean();
        }

        dailyIncomes.push({
          totalprice: incomes.reduce(
            (prev, income) => prev + income.totalprice,
            0
          ),
          totalpriceuzs: incomes.reduce(
            (prev, income) => prev + income.totalpriceuzs,
            0
          ),
          createdAt: new Date(count).toISOString(),
        });
        count = new Date(
          new Date(count).setDate(new Date(count).getDate() + 1)
        );
      }
      name.dailyIncomes = dailyIncomes;
    }

    res.status(200).json({
      names,
    });
  } catch (error) {
    console.log(error);
    res.status(501).json({ error: 'Serverda xatolik yuz berdi...' });
  }
};
