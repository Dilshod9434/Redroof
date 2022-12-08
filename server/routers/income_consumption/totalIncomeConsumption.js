const { Consumption } = require('../../models/Income_Consumption/Consumption');
const {
  IncomeName,
  Income,
} = require('../../models/Income_Consumption/Income');
const { Market } = require('../../models/MarketAndBranch/Market');

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

    for (const name of names) {
      let count = new Date(startDate);
      let currentDate = new Date(endDate);

      const dailyIncomes = [];
      while (count <= currentDate) {
        let incomes = null;

        if (type === 'incomes') {
          incomes = await Income.find({
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

    const incomesData = await Income.find({
      market,
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    }).lean();

    const consData = await Consumption.find({
      market,
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    }).lean();

    const currentIncomes = incomesData.reduce(
      (prev, income) => prev + income.totalprice,
      0
    );
    const currentIncomesUzs = incomesData.reduce(
      (prev, income) => prev + income.totalpriceuzs,
      0
    );
    const currentConsumptions = consData.reduce(
      (prev, income) => prev + income.totalprice,
      0
    );
    const currentConsumptionsUzs = consData.reduce(
      (prev, income) => prev + income.totalpriceuzs,
      0
    );

    res.status(200).json({
      names,
      current: {
        currentIncomes,
        currentIncomesUzs,
        currentConsumptions,
        currentConsumptionsUzs,
        balance: currentIncomes - currentConsumptions,
        balanceuzs: currentIncomesUzs - currentConsumptionsUzs,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(501).json({ error: 'Serverda xatolik yuz berdi...' });
  }
};
