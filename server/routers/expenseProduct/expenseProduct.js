const {
  ExpenseProduct,
} = require('../../models/ExpenseProduct/ExpenseProduct');
const { Market } = require('../../models/MarketAndBranch/Market');
const { Product } = require('../../models/Products/Product');

module.exports.createExpenseProduct = async (req, res) => {
  try {
    const { expenseProducts, market } = req.body;
    const marke = await Market.findById(market);
    if (!marke) {
      return res.status(400).json({
        message:
          "Diqqat! Foydalanuvchi ro'yxatga olinayotgan do'kon dasturda ro'yxatga olinmagan.",
      });
    }

    for (const prod of expenseProducts) {
      const expenseProd = new ExpenseProduct({
        name: prod.name,
        code: prod.code,
        market: market,
        price: prod.price,
        priceuzs: prod.priceuzs,
        total: prod.total,
        product: prod.productId,
      });

      const product = await Product.findById(prod.productId);
      if (!product) {
        return res
          .status(400)
          .json({ message: 'Bunaqa mahsulot mavjud emas!' });
      }

      product.total = product.total - prod.total;
      await product.save();
      await expenseProd.save();
    }

    res.status(200).json({ message: 'Mahsulotlar harajati yaratildi!' });
  } catch (error) {
    res.status(501).json({ error: 'Serverda xatolik yuz berdi...' });
  }
};

module.exports.getExpenseProducts = async (req, res) => {
  try {
    const { startDate, endDate, currentPage, countPage, market } = req.query;

    const marke = await Market.findById(market);
    if (!marke) {
      return res.status(400).json({
        message: `Diqqat! Do'kon haqida malumotlar topilmadi.`,
      });
    }

    let count = new Date(startDate);
    let currentDate = new Date(endDate);

    const expenseProductsConnector = [];

    while (count <= currentDate) {
      const expenseProducts = await ExpenseProduct.find({
        market,
        createdAt: {
          $gte: new Date(new Date(count).setHours(0, 0, 0, 0)).toISOString(),
          $lte: new Date(
            new Date(count).setHours(23, 59, 59, 59)
          ).toISOString(),
        },
      })
        .sort({ createdAt: -1 })
        .select('-isArchive -updatedAt -__v')
        .lean();

      let obj = {
        count: expenseProducts.length,
        totalprice: expenseProducts.reduce((prev, el) => prev + el.price, 0),
        totalpriceuzs: expenseProducts.reduce(
          (prev, el) => prev + el.priceuzs,
          0
        ),
        createdAt: expenseProducts[0]?.createdAt,
        products: expenseProducts,
      };
      expenseProductsConnector.push(obj);
      count = new Date(new Date(count).setDate(new Date(count).getDate() + 1));
    }

    const resData = expenseProductsConnector.filter((item) => item.count > 0);

    res.status(200).json({
      count: resData.length,
      expenseProducts: resData.splice(currentPage * countPage, countPage),
    });
  } catch (error) {
    console.log(error);
    res.status(501).json({ error: 'Serverda xatolik yuz berdi...' });
  }
};
