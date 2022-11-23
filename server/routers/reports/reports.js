const { Expense } = require('../../models/Expense/Expense');
const { Market } = require('../../models/MarketAndBranch/Market');
const { Incoming } = require('../../models/Products/Incoming');
const { Product } = require('../../models/Products/Product');
const { ProductData } = require('../../models/Products/Productdata');
const { ProductPrice } = require('../../models/Products/ProductPrice');
const { Debt } = require('../../models/Sales/Debt');
const { Discount } = require('../../models/Sales/Discount');
const { Payment } = require('../../models/Sales/Payment');
const { SaleConnector } = require('../../models/Sales/SaleConnector');
const { SaleProduct } = require('../../models/Sales/SaleProduct');
const {
  DailySaleConnector,
} = require('../../models/Sales/DailySaleConnector.js');
const { Client } = require('../../models/Sales/Client');
require('../../models/Users');

const reduce = (arr, el) =>
  arr.reduce((prev, item) => prev + (item[el] || 0), 0);

module.exports.getReport = async (req, res) => {
  try {
    const { market, startDate, endDate } = req.body;
    const marke = await Market.findById(market);

    if (!marke) {
      return res
        .status(401)
        .json({ message: `Diqqat! Do'kon haqida malumotlar topilmadi!` });
    }

    const sales = await DailySaleConnector.find({
      market,
      createdAt: {
        $gte: startDate,
        $lt: endDate,
      },
    })
      .select('-isArchive -updatedAt -user -market -__v')
      .populate(
        'payment',
        'cash cashuzs card carduzs transfer transferuzs payment paymentuzs totalprice totalpriceuzs'
      )
      .populate({
        path: 'products',
        select: 'totalprice totalpriceuzs pieces price',
        populate: {
          path: 'price',
          select: 'incomingprice incomingpriceuzs sellingprice sellingpriceuzs',
        },
      })
      .populate('discount', 'discount discountuzs procient');

    // qarz uchun saleconnector ishlatiyapman
    const saleconnector = await SaleConnector.find({
      market,
      // createdAt: {
      //   $gte: startDate,
      //   $lt: endDate,
      // },
    })
      .select('-isArchive -updatedAt -user -market -__v')
      .populate('products', 'totalprice totalpriceuzs')
      .populate(
        'payments',
        'cash cashuzs card carduzs transfer transferuzs payment paymentuzs totalprice totalpriceuzs'
      )
      .populate('discounts', 'discount discountuzs procient');

    const payments = await Payment.find({
      payment: { $ne: 0 },
      market,
      createdAt: {
        $gte: startDate,
        $lt: endDate,
      },
    });

    const discounts = await Discount.find({
      discount: { $ne: 0 },
      market,
      createdAt: {
        $gte: startDate,
        $lt: endDate,
      },
    });

    let reports = {
      sale: {
        sale: 0,
        saleuzs: 0,
        salecount: 0,
      },
      income: {
        income: 0,
        incomeuzs: 0,
      },
      expenses: {
        expenses: 0,
        expensesuzs: 0,
        expensescount: 0,
      },
      cash: {
        cash: 0,
        cashuzs: 0,
        cashcount: 0,
      },
      card: {
        card: 0,
        carduzs: 0,
        cardcount: 0,
      },
      transfer: {
        transfer: 0,
        transferuzs: 0,
        transfercount: 0,
      },
      backproducts: {
        backproducts: 0,
        backproductsuzs: 0,
        backproductscount: 0,
      },
      discounts: {
        discounts: discounts.reduce(
          (summ, discount) => summ + discount.discount,
          0
        ),
        discountsuzs: discounts.reduce(
          (summ, discount) => summ + discount.discountuzs,
          0
        ),
        discountscount: discounts.length,
      },
      debts: {
        debts: 0,
        debtsuzs: 0,
        debtscount: 0,
      },
    };

    payments.forEach((payment) => {
      reports.cash.cash += payment.cash;
      reports.cash.cashuzs += payment.cashuzs;
      reports.card.card += payment.card;
      reports.card.carduzs += payment.carduzs;
      reports.transfer.transfer += payment.transfer;
      reports.transfer.transferuzs += payment.transferuzs;
      if (payment.type === 'mixed') {
        payment.cash !== 0 && reports.cash.cashcount++;
        payment.card !== 0 && reports.card.cardcount++;
        payment.transfer !== 0 && reports.transfer.transfercount++;
      } else {
        reports[payment.type][payment.type + 'count']++;
      }
    });

    let incomingprice = 0;
    let incomingpriceuzs = 0;

    let backproduct = 0;
    let backproductuzs = 0;
    let backproductcount = 0;

    const roundUzs = (price) => Math.round(Number(price) * 1) / 1;
    const roundUsd = (price) => Math.round(Number(price) * 1000) / 1000;

    sales.map((sale) => {
      reports.sale.salecount++;
      sale.products.map((product) => {
        reports.sale.sale += roundUsd(product.totalprice);
        reports.sale.saleuzs += roundUzs(product.totalpriceuzs);
        incomingprice += roundUsd(product.price.incomingprice * product.pieces);
        incomingpriceuzs += roundUzs(
          product.price.incomingpriceuzs * product.pieces
        );
        if (product.totalprice < 0) {
          backproduct += roundUsd(product.totalprice);
          backproductuzs += roundUzs(product.totalpriceuzs);
          backproductcount++;
        }
      });
    });

    reports.income.income = roundUsd(
      Number(reports.sale.sale) -
        Number(incomingprice) -
        Number(reports.discounts.discounts)
    );
    reports.income.incomeuzs = roundUzs(
      Number(reports.sale.saleuzs) -
        Number(incomingpriceuzs) -
        Number(reports.discounts.discountsuzs)
    );

    // Get debts report functions  START
    const reducecount = (arr, el) =>
      arr.reduce((prev, item) => prev + (item[el] || 0), 0);

    reports.debts.debtscount = saleconnector.reduce((prev, sale) => {
      let totalprice = reducecount(sale.products, 'totalprice');
      let payment = reducecount(sale.payments, 'payment');
      let discount = reducecount(sale.discounts, 'discount');
      if (totalprice - payment - discount > 0.01) {
        return prev + 1;
      }
      return prev;
    }, 0);

    reports.debts.debts = saleconnector.reduce((prev, sale) => {
      let totalprice = reducecount(sale.products, 'totalprice');
      let payment = reducecount(sale.payments, 'payment');
      let discount = reducecount(sale.discounts, 'discount');
      return prev + (totalprice - payment - discount);
    }, 0);

    reports.debts.debtsuzs = saleconnector.reduce((prev, sale) => {
      let totalpriceuzs = reducecount(sale.products, 'totalpriceuzs');
      let paymentuzs = reducecount(sale.payments, 'paymentuzs');
      let discountuzs = reducecount(sale.discounts, 'discountuzs');
      return prev + (totalpriceuzs - paymentuzs - discountuzs);
    }, 0);

    reports.debts.debts = Math.round(reports.debts.debts * 1000) / 1000;
    reports.debts.debtsuzs = Math.round(reports.debts.debtsuzs * 1) / 1;
    // Get debts report functions  END

    // Get expenses report functions  START
    const expenses = await Expense.find({
      market,
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    }).select('sum sumuzs');

    reports.expenses.expensescount = expenses.length;
    reports.expenses.expenses = expenses.reduce(
      (prev, expense) => prev + expense.sum,
      0
    );
    reports.expenses.expensesuzs = expenses.reduce(
      (prev, expense) => prev + expense.sumuzs,
      0
    );
    // Get expenses report functions  START

    reports.backproducts.backproducts = backproduct;
    reports.backproducts.backproductsuzs = backproductuzs;
    reports.backproducts.backproductscount = backproductcount;

    res.status(201).send(reports);
  } catch (error) {
    res.status(400).json({ error: 'Serverda xatolik yuz berdi...' });
  }
};

module.exports.getSales = async (req, res) => {
  try {
    const { market, currentPage, countPage, startDate, endDate, search } =
      req.body;

    const id = new RegExp('.*' + search ? search.id : '' + '.*', 'i');
    const client = new RegExp('.*' + search ? search.client : '' + '.*', 'i');

    const marke = await Market.findById(market);
    if (!marke) {
      return res
        .status(401)
        .json({ message: `Diqqat! Do'kon haqida malumotlar topilmadi!` });
    }

    const saleconnector = await DailySaleConnector.find({
      market,
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    })
      .select('-isArchive -updatedAt -__v -packman')
      .populate({
        path: 'saleconnector',
        select: 'id',
        match: { id: id },
      })
      .populate(
        'payment',
        'cash cashuzs card carduzs transfer transferuzs payment paymentuzs totalprice totalpriceuzs'
      )
      .populate('user', 'firstname lastname')
      .populate({
        path: 'client',
        select: 'name',
        match: { name: client },
      })
      .populate({
        path: 'products',
        select: 'totalprice totalpriceuzs pieces price unitprice unitpriceuzs',
        populate: {
          path: 'product',
          select: 'productdata',
          populate: {
            path: 'productdata',
            select: 'name code',
          },
        },
      });

    let filter = saleconnector.filter((sale) => {
      return sale.saleconnector !== null && sale.client !== null;
    });
    const count = filter.length;
    const data = filter.splice(currentPage * countPage, countPage);

    res.status(200).json({ data, count });
  } catch (error) {
    res.status(400).json({ error: 'Serverda xatolik yuz berdi...' });
  }
};

module.exports.getProfitData = async (req, res) => {
  try {
    const { market, currentPage, countPage, startDate, endDate, search } =
      req.body;

    const id = new RegExp('.*' + search ? search.id : '' + '.*', 'i');
    const client = new RegExp('.*' + search ? search.client : '' + '.*', 'i');

    const marke = await Market.findById(market);
    if (!marke) {
      return res
        .status(401)
        .json({ message: `Diqqat! Do'kon haqida malumotlar topilmadi!` });
    }

    const saleconnector = await DailySaleConnector.find({
      market,
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    })
      .select('-isArchive -updatedAt -user -market -__v')
      .populate(
        'payment',
        'cash cashuzs card carduzs transfer transferuzs payment paymentuzs totalprice totalpriceuzs'
      )
      .populate({
        path: 'saleconnector',
        select: 'id',
        match: { id: id },
      })
      .populate({
        path: 'client',
        select: 'name',
        match: { name: client },
      })
      .populate({
        path: 'products',
        select: 'totalprice totalpriceuzs pieces price',
        populate: {
          path: 'price',
          select: 'incomingprice incomingpriceuzs sellingprice sellingpriceuzs',
        },
      })
      .populate(
        'discount',
        'discount discountuzs totalprice totalpriceuzs procient'
      );

    const profitData = saleconnector
      .map((sale) => {
        const totalincomingprice = sale.products.reduce(
          (prev, item) => prev + item.pieces * item.price.incomingprice,
          0
        );
        const totalincomingpriceuzs = sale.products.reduce(
          (prev, item) => prev + item.pieces * item.price.incomingpriceuzs,
          0
        );
        const totalprice = sale.products.reduce(
          (summ, product) => summ + product.totalprice,
          0
        );
        const totalpriceuzs = sale.products.reduce(
          (summ, product) => summ + product.totalpriceuzs,
          0
        );
        const discount = (sale.discount && sale.discount.discount) || 0;
        const discountuzs = (sale.discount && sale.discount.discountuzs) || 0;
        const profit = totalprice - totalincomingprice - discount;
        const profituzs = totalpriceuzs - totalincomingpriceuzs - discountuzs;

        return {
          createdAt: sale.createdAt,
          id: sale.id,
          saleconnector: sale.saleconnector,
          client: sale.client && sale.client,
          totalincomingprice,
          totalincomingpriceuzs,
          totalprice,
          totalpriceuzs,
          discount,
          discountuzs,
          profit,
          profituzs,
        };
      })
      .filter((sale) => sale.saleconnector !== null && sale.client !== null);

    const count = profitData.length;
    const profitreport = profitData.splice(currentPage * countPage, countPage);

    res.status(201).json({ data: profitreport, count });
  } catch (error) {
    res.status(400).json({ error: 'Serverda xatolik yuz berdi...' });
  }
};

module.exports.getPayment = async (req, res) => {
  try {
    const { market, currentPage, countPage, startDate, endDate, search, type } =
      req.body;

    const id = new RegExp('.*' + search ? search.id : '' + '.*', 'i');
    const client = new RegExp('.*' + search ? search.client : '' + '.*', 'i');

    const marke = await Market.findById(market);
    if (!marke) {
      return res
        .status(401)
        .json({ message: `Diqqat! Do'kon haqida malumotlar topilmadi!` });
    }
    const allpayments = await Payment.find({
      [type]: { $ne: 0 },
      market,
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    })

      .select(`-isArchive -user -updatedAt -__v -products`)
      .populate({
        path: 'saleconnector',
        select: 'id client',
        match: { id: id },
        populate: {
          path: 'client',
          select: 'name',
          match: { name: client },
        },
      });

    const payments = allpayments
      .map((payment) => {
        return {
          id: payment.saleconnector && payment.saleconnector.id,
          saleconnector: payment.saleconnector,
          createdAt: payment.createdAt,
          client:
            payment.saleconnector &&
            payment.saleconnector.client &&
            payment.saleconnector.client,
          cash: payment.cash,
          cashuzs: payment.cashuzs,
          card: payment.card,
          carduzs: payment.carduzs,
          transfer: payment.transfer,
          transferuzs: payment.transferuzs,
          totalprice: (payment.totalprice && payment.totalprice) || 0,
          totalpriceuzs: (payment.totalpriceuzs && payment.totalpriceuzs) || 0,
        };
      })
      .filter((product) => product.saleconnector !== null);
    const count = payments.length;
    let paymentsreport = payments.splice(currentPage * countPage, countPage);
    res.status(201).json({ data: paymentsreport, count });
  } catch (error) {
    res.status(400).json({ error: 'Serverda xatolik yuz berdi...' });
  }
};

module.exports.getDebtsReport = async (req, res) => {
  try {
    const { market, startDate, endDate } = req.body;
    const marke = await Market.findById(market);
    if (!marke) {
      return res
        .status(400)
        .json({ message: `Diqqat! Do'kon haqida malumotlar topilmadi!` });
    }

    const saleconnector = await SaleConnector.find({
      market,
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    })
      .select('-isArchive -updatedAt -__v -packman')
      .populate(
        'payments',
        'cash cashuzs card carduzs transfer transferuzs payment paymentuzs totalprice totalpriceuzs'
      )
      .populate({
        path: 'products',
        select:
          'totalprice unitprice totalpriceuzs unitpriceuzs pieces createdAt discount saleproducts product',
        options: { sort: { createdAt: -1 } },
        populate: {
          path: 'product',
          select: 'productdata',
          populate: { path: 'productdata', select: 'name code' },
        },
      })
      .populate({
        path: 'products',
        select:
          'totalprice unitprice totalpriceuzs unitpriceuzs pieces createdAt discount saleproducts product',
        options: { sort: { createdAt: -1 } },
        populate: {
          path: 'user',
          select: 'firstname lastname',
        },
      })
      .populate('client', 'name')
      .populate(
        'payments',
        'payment paymentuzs comment totalprice totalpriceuzs'
      )
      .populate('debts', 'comment')
      .populate(
        'discounts',
        'discount discountuzs procient products totalprice totalpriceuzs'
      )
      .populate('user', 'firstname lastname')
      .populate('dailyconnectors', 'comment debt')
      .lean();

    const debtsreport = saleconnector
      .map((sale) => {
        const reduce = (arr, el) =>
          arr.reduce((prev, item) => prev + (item[el] || 0), 0);
        const discount = reduce(sale.discounts, 'discount');
        const discountuzs = reduce(sale.discounts, 'discountuzs');
        const payment = reduce(sale.payments, 'payment');
        const paymentuzs = reduce(sale.payments, 'paymentuzs');
        const totalprice = reduce(sale.products, 'totalprice');
        const totalpriceuzs = reduce(sale.products, 'totalpriceuzs');

        const debtComment =
          sale.debts.length > 0
            ? sale.debts[sale.debts.length - 1].comment
            : '';
        const debtId =
          sale.debts.length > 0 ? sale.debts[sale.debts.length - 1]._id : '';

        return {
          _id: sale._id,
          id: sale.id,
          createdAt: sale.createdAt,
          client: sale.client && sale.client,
          totalprice,
          totalpriceuzs,
          debt: Math.round((totalprice - payment - discount) * 1000) / 1000,
          debtuzs:
            Math.round((totalpriceuzs - paymentuzs - discountuzs) * 1) / 1,
          debtid: debtId,
          comment: debtComment,
          saleconnector: { ...sale },
        };
      })
      .filter((sales) => sales.debt > 0);

    res.status(201).json({ data: debtsreport });
  } catch (error) {
    res.status(400).json({ error: 'Serverda xatolik yuz berdi...' });
  }
};

module.exports.getDiscountsReport = async (req, res) => {
  try {
    const { market, currentPage, countPage, startDate, endDate, search } =
      req.body;

    const id = new RegExp('.*' + search ? search.id : '' + '.*', 'i');
    const client = new RegExp('.*' + search ? search.client : '' + '.*', 'i');

    const marke = await Market.findById(market);
    if (!marke) {
      return res
        .status(400)
        .json({ message: `Diqqat! Do'kon haqida malumotlar topilmadi!` });
    }

    const discounts = await Discount.find({
      discount: { $ne: 0 },
      market,
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    })
      .select('-isArchive -user -updatedAt -__v ')
      .populate({
        path: 'saleconnector',
        select: 'id client',
        match: { id: id },
        populate: {
          path: 'client',
          select: 'name',
          match: { name: client },
        },
      });

    const discountsreport = discounts
      .map((discount) => {
        return {
          createdAt: discount.createdAt,
          id: discount.saleconnector && discount.saleconnector.id,
          saleconnector: discount.saleconnector,
          client:
            discount.saleconnector &&
            discount.saleconnector.client &&
            discount.saleconnector.client,
          totalprice: discount.totalprice,
          totalpriceuzs: discount.totalpriceuzs,
          discount: discount.discount,
          discountuzs: discount.discountuzs,
          procient: discount.procient,
        };
      })
      .filter((discount) => discount.saleconnector !== null);

    const count = discountsreport.length;

    const reportdiscount = discountsreport.splice(
      currentPage * countPage,
      countPage
    );

    res.status(200).json({ data: reportdiscount, count });
  } catch (error) {
    res.status(400).json({ error: 'Serverda xatolik yuz berdi...' });
  }
};

module.exports.getBackProducts = async (req, res) => {
  try {
    const { market, currentPage, countPage, startDate, endDate, search } =
      req.body;

    const id = new RegExp('.*' + search ? search.id : '' + '.*', 'i');
    const client = new RegExp('.*' + search ? search.client : '' + '.*', 'i');

    const marke = await Market.findById(market);
    if (!marke) {
      return res
        .status(401)
        .json({ message: `Diqqat! Do'kon haqida malumotlar topilmadi!` });
    }

    const saleconnector = await SaleConnector.find({
      market,
    })
      .select('-isArchive -updatedAt -__v')
      .populate(
        'payments',
        'cash cashuzs card carduzs transfer transferuzs payment paymentuzs totalprice totalpriceuzs'
      )
      .populate({
        path: 'products',
        select:
          'totalprice totalpriceuzs pieces price unitprice unitpriceuzs user createdAt product',
        populate: [
          {
            path: 'product',
            select: 'productdata',
            populate: {
              path: 'productdata',
              select: 'code name',
            },
          },
          {
            path: 'user',
            select: 'firstname lastname',
          },
        ],
      })
      .populate('user', 'firstname lastname')
      .lean();

    const dailyconnector = await DailySaleConnector.find({
      market,
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    })
      .select('-isArchive -updatedAt -__v -packman')
      .populate({
        path: 'saleconnector',
        select: 'id',
        match: { id: id },
      })
      .populate(
        'payment',
        'cash cashuzs card carduzs transfer transferuzs payment paymentuzs totalprice totalpriceuzs'
      )
      .populate({
        path: 'client',
        select: 'name',
        match: { name: client },
      })
      .populate('packman', 'name')
      .populate('user', 'firstname lastname')
      .populate({
        path: 'products',
        select:
          'totalprice totalpriceuzs pieces price unitprice unitpriceuzs product',
        populate: {
          path: 'product',
          select: 'productdata',
          populate: {
            path: 'productdata',
            select: 'code name',
          },
        },
      })
      .lean();

    let filter = dailyconnector
      .filter(
        (sale) =>
          sale.saleconnector !== null &&
          sale.client !== null &&
          sale.products[0] &&
          sale.products[0].pieces < 0
      )
      .map((connector) => {
        const chequeData = saleconnector.filter(
          (item) => String(item._id) === String(connector.saleconnector._id)
        );
        return {
          createdAt: connector.createdAt,
          id: connector.saleconnector && connector.saleconnector.id,
          saleconnector: connector.saleconnector,
          client:
            connector.saleconnector &&
            connector.saleconnector.client &&
            connector.saleconnector.client,
          count: reduce(connector.products, 'pieces'),
          totalprice: reduce(connector.products, 'totalprice'),
          totalpriceuzs: reduce(connector.products, 'totalpriceuzs'),
          back: (connector.payment && connector.payment.payment) || 0,
          backuzs: (connector.payment && connector.payment.paymentuzs) || 0,
          dailyconnector: { ...chequeData[0] },
        };
      });
    const count = filter.length;
    const data = filter.splice(currentPage * countPage, countPage);

    res.status(200).json({ data, count });
  } catch (error) {
    res.status(400).json({ error: 'Serverda xatolik yuz berdi...' });
  }
};

module.exports.getProductsReport = async (req, res) => {
  try {
    const { market } = req.body;

    const isMarket = await Market.findById(market);
    if (!isMarket) {
      return res
        .status(400)
        .json({ message: `Diqqat! Do'kon haqida malumotlar topilmadi!` });
    }

    const products = await Product.find({
      market,
    })
      .select('total price')
      .populate('price', 'incomingprice incomingpriceuzs');

    const productsreport = {
      producttypes: products.length,
      totalpieces: 0,
      totalprice: 0,
      totalpriceuzs: 0,
    };

    products.map((product) => {
      productsreport.totalpieces += product.total;
      productsreport.totalprice += product.price.incomingprice;
      productsreport.totalpriceuzs += product.price.incomingpriceuzs;
    });

    res.status(200).json(productsreport);
  } catch (error) {
    res.status(400).json({ error: 'Serverda xatolik yuz berdi...' });
  }
};

module.exports.getIncomingsReport = async (req, res) => {
  try {
    const { market, startDate, endDate } = req.body;

    const isMarket = await Market.findById(market);
    if (!isMarket) {
      return res
        .status(400)
        .json({ message: `Diqqat! Do'kon haqida malumotlar topilmadi!` });
    }

    const incomings = await Incoming.find({
      market,
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    }).select('pieces totalprice totalpriceuzs product');

    const incomingsreport = {
      totalincomings: incomings.length,
      producttypes: 0,
      totalpieces: 0,
      totalprice: 0,
      totalpriceuzs: 0,
    };

    let arr = [];
    incomings.map((incoming) => {
      if (!arr.includes(incoming.product.toString())) {
        incomingsreport.producttypes += 1;
        arr.push(incoming.product.toString());
      }
      incomingsreport.totalpieces += incoming.pieces;
      incomingsreport.totalprice += incoming.totalprice;
      incomingsreport.totalpriceuzs += incoming.totalpriceuzs;
    });

    res.status(200).json(incomingsreport);
  } catch (error) {
    res.status(400).json({ error: 'Serverda xatolik yuz berdi...' });
  }
};

module.exports.getSalesReport = async (req, res) => {
  try {
    const { market, startDate, endDate } = req.body;

    const salesProducts = await SaleProduct.find({
      market,
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    }).select('product pieces');

    let saleproducts = {
      producttypes: 0,
      totalpieces: 0,
    };

    let arr = [];
    salesProducts.map((product) => {
      if (!arr.includes(product.product.toString())) {
        saleproducts.producttypes += 1;
        arr.push(product.product.toString());
      }
      saleproducts.totalpieces += product.pieces;
    });

    return res.status(200).json(saleproducts);
  } catch (error) {
    res.status(400).json({ error: 'Serverda xatolik yuz berdi...' });
  }
};

module.exports.getExpensesReport = async (req, res) => {
  try {
    const { market, startDate, endDate, currentPage, countPage } = req.body;

    const expenses = await Expense.find({
      market,
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    }).select('sum sumuzs comment type createdAt');

    res.status(200).json({
      count: expenses.length,
      data: expenses.splice(currentPage * countPage, countPage),
    });
  } catch (error) {
    res.status(400).json({ error: 'Serverda xatolik yuz berdi...' });
  }
};

module.exports.changeDebtComment = async (req, res) => {
  try {
    const { debtid, comment } = req.body;

    const debt = await Debt.findById(debtid);
    debt.comment = comment;
    await debt.save();

    res.status(200).json(debt.comment);
  } catch (error) {
    res.status(400).json({ error: 'Serverda xatolik yuz berdi...' });
  }
};
