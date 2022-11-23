const { Market } = require('../../models/MarketAndBranch/Market');
const { User } = require('../../models/Users');
const { SaleConnector } = require('../../models/Sales/SaleConnector');
const { Discount } = require('../../models/Sales/Discount');
const { Debt } = require('../../models/Sales/Debt');
const {
  validateSaleProduct,
  SaleProduct,
} = require('../../models/Sales/SaleProduct');
const { Client } = require('../../models/Sales/Client');
const { Packman } = require('../../models/Sales/Packman');
const { Payment } = require('../../models/Sales/Payment');
const { checkPayments } = require('./saleproduct/checkData');
const { Product } = require('../../models/Products/Product');
const { Unit } = require('../../models/Products/Unit.js');
const { ProductData } = require('../../models/Products/Productdata');
const { Category } = require('../../models/Products/Category');
const { DailySaleConnector } = require('../../models/Sales/DailySaleConnector');
const ObjectId = require('mongodb').ObjectId;
const { filter } = require('lodash');

const convertToUsd = (value) => Math.round(value * 1000) / 1000;
const convertToUzs = (value) => Math.round(value);

module.exports.register = async (req, res) => {
  try {
    const {
      saleproducts,
      client,
      packman,
      discount,
      payment,
      debt,
      market,
      user,
      comment,
    } = req.body;
    const marke = await Market.findById(market);
    if (!marke) {
      return res.status(400).json({
        message: `Diqqat! Do'kon haqida malumotlar topilmadi!`,
      });
    }

    const use = await User.findById(user);

    if (!use) {
      return res.status(400).json({
        message: `Diqqat! Avtorizatsiyadan o'tilmagan!`,
      });
    }

    const totalprice = convertToUsd(
      saleproducts.reduce((summ, saleproduct) => {
        return summ + saleproduct.totalprice;
      }, 0)
    );

    const totalpriceuzs = convertToUzs(
      saleproducts.reduce((summ, saleproduct) => {
        return summ + saleproduct.totalpriceuzs;
      }, 0)
    );

    if (checkPayments(totalprice, payment, discount, debt)) {
      return res.status(400).json({
        message: `Diqqat! To'lov hisobida xatolik yuz bergan!`,
      });
    }

    let all = [];

    // Create SaleProducts
    for (const saleproduct of saleproducts) {
      const {
        totalprice,
        unitprice,
        totalpriceuzs,
        unitpriceuzs,
        pieces,
        product,
      } = saleproduct;
      const { error } = validateSaleProduct({
        totalprice,
        totalpriceuzs,
        unitprice,
        unitpriceuzs,
        pieces,
        product: product._id,
      });
      const produc = await Product.findById(product._id).populate(
        'productdata',
        'name'
      );
      if (produc.total < pieces) {
        return res.status(400).json({
          error: `Diqqat! ${produc.productdata.name} mahsuloti omborda yetarlicha mavjud emas. Qolgan mahsulot soni ${produc.total} ta`,
        });
      }
      if (error) {
        return res.status(400).json({
          error: error.message,
        });
      }
      const newSaleProduct = new SaleProduct({
        price: produc.price,
        totalprice: convertToUsd(totalprice),
        totalpriceuzs: convertToUzs(totalpriceuzs),
        unitprice: convertToUsd(unitprice),
        unitpriceuzs: convertToUzs(unitpriceuzs),
        pieces,
        product: product._id,
        market,
        user,
        previous: produc.total,
        next: produc.total - Number(pieces),
      });

      all.push(newSaleProduct);
    }

    const saleconnector = new SaleConnector({
      user,
      market,
    });

    await saleconnector.save();

    const dailysaleconnector = new DailySaleConnector({
      user,
      market,
      saleconnector: saleconnector._id,
      comment: comment,
    });

    await dailysaleconnector.save();

    saleconnector.dailyconnectors.push(dailysaleconnector._id);

    let products = [];

    for (const saleproduct of all) {
      saleproduct.saleconnector = saleconnector._id;
      saleproduct.dailysaleconnector = dailysaleconnector._id;
      await saleproduct.save();
      products.push(saleproduct._id);

      const updateproduct = await Product.findById(saleproduct.product);
      updateproduct.total -= saleproduct.pieces;
      await updateproduct.save();
    }

    if (discount.discount > 0) {
      const newDiscount = new Discount({
        discount: convertToUsd(discount.discount),
        discountuzs: convertToUzs(discount.discountuzs),
        comment: discount.comment,
        procient: discount.procient,
        market,
        totalprice,
        totalpriceuzs,
        user,
        saleconnector: saleconnector._id,
        products,
      });
      await newDiscount.save();
      saleconnector.discounts.push(newDiscount._id);
      dailysaleconnector.discount = newDiscount._id;
      for (const product of all) {
        product.discount = newDiscount._id;
        await product.save();
      }
    }

    if (debt.debt > 0) {
      const newDebt = new Debt({
        comment: comment,
        debt: convertToUsd(debt.debt),
        debtuzs: convertToUzs(debt.debtuzs),
        totalprice: convertToUsd(totalprice),
        totalpriceuzs: convertToUzs(totalpriceuzs),
        market,
        user,
        saleconnector: saleconnector._id,
        products,
      });
      await newDebt.save();
      saleconnector.debts.push(newDebt._id);
      dailysaleconnector.debt = newDebt._id;
    }

    if (payment.totalprice > 0) {
      const newPayment = new Payment({
        comment: payment.comment,
        payment: convertToUsd(payment.card + payment.cash + payment.transfer),
        paymentuzs: convertToUzs(
          payment.carduzs + payment.cashuzs + payment.transferuzs
        ),
        card: payment.card,
        cash: payment.cash,
        transfer: payment.transfer,
        carduzs: payment.carduzs,
        cashuzs: payment.cashuzs,
        transferuzs: payment.transferuzs,
        type: payment.type,
        totalprice,
        totalpriceuzs,
        market,
        user,
        saleconnector: saleconnector._id,
        products,
      });
      await newPayment.save();
      saleconnector.payments.push(newPayment._id);
      dailysaleconnector.payment = newPayment._id;
    }

    if (packman) {
      saleconnector.packman = packman._id;
      dailysaleconnector.packman = packman._id;
    }

    if (client.name || client._id) {
      if (client._id) {
        saleconnector.client = client._id;
        dailysaleconnector.client = client._id;
      } else {
        const newClient = new Client({
          market,
          name: client.name,
        });
        await newClient.save();
        if (packman) {
          await Packman.findByIdAndUpdate(packman._id, {
            $push: {
              clients: newClient._id,
            },
          });
        }
        saleconnector.client = newClient._id;
        dailysaleconnector.client = newClient._id;
      }
    }

    const id = await SaleConnector.find({ market }).count();
    saleconnector.id = 1000000 + id;
    saleconnector.products = [...products];
    await saleconnector.save();

    dailysaleconnector.id = 1;
    dailysaleconnector.products = [...products];
    await dailysaleconnector.save();

    const connector = await DailySaleConnector.findById(dailysaleconnector._id)
      .select('-isArchive -updatedAt -market -__v')
      .populate({
        path: 'products',
        select: 'totalprice unitprice totalpriceuzs unitpriceuzs pieces',
        populate: {
          path: 'product',
          select: 'productdata total',
          populate: {
            path: 'productdata',
            select: 'code name',
            options: { sort: { code: 1 } },
          },
        },
      })
      .populate('payment', 'payment paymentuzs totalprice totalpriceuzs')
      .populate('discount', 'discount discountuzs')
      .populate('debt', 'debt debtuzs')
      .populate('client', 'name')
      .populate('packman', 'name')
      .populate('user', 'firstname lastname')
      .populate('saleconnector', 'id');

    res.status(201).send(connector);
  } catch (error) {
    res.status(400).json({ error: 'Serverda xatolik yuz berdi...' });
  }
};

module.exports.addproducts = async (req, res) => {
  try {
    const {
      saleconnectorid,
      saleproducts,
      client,
      packman,
      discount,
      payment,
      debt,
      market,
      user,
      comment,
    } = req.body;

    const marke = await Market.findById(market);
    if (!marke) {
      return res.status(400).json({
        message: `Diqqat! Do'kon haqida malumotlar topilmadi!`,
      });
    }

    const use = await User.findById(user);

    if (!use) {
      return res.status(400).json({
        message: `Diqqat! Avtorizatsiyadan o'tilmagan!`,
      });
    }

    const totalprice =
      Math.round(
        saleproducts.reduce((summ, saleproduct) => {
          return summ + saleproduct.totalprice;
        }, 0) * 10000
      ) / 10000;

    const totalpriceuzs =
      Math.round(
        saleproducts.reduce((summ, saleproduct) => {
          return summ + saleproduct.totalpriceuzs;
        }, 0) * 1
      ) / 1;

    if (checkPayments(totalprice, payment, discount, debt)) {
      return res.status(400).json({
        message: `Diqqat! To'lov hisobida xatolik yuz bergan!`,
      });
    }

    let all = [];

    // Create SaleProducts
    for (const saleproduct of saleproducts) {
      const {
        totalprice,
        unitprice,
        totalpriceuzs,
        unitpriceuzs,
        pieces,
        product,
      } = saleproduct;
      const { error } = validateSaleProduct({
        totalprice,
        totalpriceuzs,
        unitprice,
        unitpriceuzs,
        pieces,
        product: product._id,
      });

      const produc = await Product.findById(product._id).populate(
        'productdata',
        'name'
      );
      if (produc.total < pieces) {
        return res.status(400).json({
          error: `Diqqat! ${produc.productdata.name} mahsuloti omborda yetarlicha mavjud emas. Qolgan mahsulot soni ${produc.total} ta`,
        });
      }
      if (error) {
        return res.status(400).json({
          error: error.message,
        });
      }

      const newSaleProduct = new SaleProduct({
        price: produc.price,
        totalprice,
        totalpriceuzs,
        unitprice,
        unitpriceuzs,
        pieces,
        product: product._id,
        market,
        user,
        previous: produc.total,
        next: produc.total - Number(pieces),
      });

      all.push(newSaleProduct);
    }

    const saleconnector = await SaleConnector.findById(saleconnectorid);

    const dailysaleconnector = new DailySaleConnector({
      user,
      market,
      saleconnector: saleconnector._id,
      comment,
    });

    await dailysaleconnector.save();

    saleconnector.dailyconnectors.push(dailysaleconnector._id);

    let products = [];

    for (const saleproduct of all) {
      saleproduct.saleconnector = saleconnector._id;
      saleproduct.dailysaleconnector = dailysaleconnector._id;
      await saleproduct.save();
      products.push(saleproduct._id);

      const updateproduct = await Product.findById(saleproduct.product);
      updateproduct.total -= saleproduct.pieces;
      await updateproduct.save();
    }

    if (discount.discount > 0) {
      const newDiscount = new Discount({
        discount: discount.discount,
        discountuzs: discount.discountuzs,
        comment: discount.comment,
        procient: discount.procient,
        market,
        totalprice,
        totalpriceuzs,
        user,
        saleconnector: saleconnector._id,
        products,
      });
      await newDiscount.save();
      saleconnector.discounts.push(newDiscount._id);
      dailysaleconnector.discount = newDiscount._id;

      for (const product of all) {
        product.discount = newDiscount._id;
        await product.save();
      }
    }

    if (debt.debt > 0) {
      const newDebt = new Debt({
        comment: comment,
        debt: debt.debt,
        debtuzs: debt.debtuzs,
        totalprice,
        totalpriceuzs,
        market,
        user,
        saleconnector: saleconnector._id,
        products,
      });
      await newDebt.save();
      saleconnector.debts.push(newDebt._id);
      dailysaleconnector.debt = newDebt._id;
    }

    if (payment.totalprice > 0) {
      const newPayment = new Payment({
        comment: payment.comment,
        payment: payment.card + payment.cash + payment.transfer,
        paymentuzs: payment.carduzs + payment.cashuzs + payment.transferuzs,
        card: payment.card,
        cash: payment.cash,
        transfer: payment.transfer,
        carduzs: payment.carduzs,
        cashuzs: payment.cashuzs,
        transferuzs: payment.transferuzs,
        type: payment.type,
        totalprice,
        totalpriceuzs,
        market,
        user,
        saleconnector: saleconnector._id,
        products,
      });
      await newPayment.save();
      saleconnector.payments.push(newPayment._id);
      dailysaleconnector.payment = newPayment._id;
    }

    if (packman) {
      saleconnector.packman = packman._id;
      dailysaleconnector.packman = packman._id;
    }

    if (client.name || client._id) {
      if (client._id) {
        saleconnector.client = client._id;
        dailysaleconnector.client = client._id;
      } else {
        const newClient = new Client({
          market,
          name: client.name,
        });
        await newClient.save();
        if (packman) {
          await Packman.findByIdAndUpdate(packman._id, {
            $push: {
              clients: newClient._id,
            },
          });
        }
        saleconnector.client = newClient._id;
        dailysaleconnector.client = newClient._id;
      }
    } else {
      dailysaleconnector.client = saleconnector.client;
    }

    saleconnector.products.push(...products);
    await saleconnector.save();

    dailysaleconnector.id = saleconnector.dailyconnectors.length;
    dailysaleconnector.products = [...products];
    await dailysaleconnector.save();

    const connector = await DailySaleConnector.findById(dailysaleconnector._id)
      .select('-isArchive -updatedAt -market -__v')
      .populate({
        path: 'products',
        select: 'totalprice unitprice totalpriceuzs unitpriceuzs pieces',
        options: { sort: { created_at: -1 } },
        populate: {
          path: 'product',
          select: 'poductdata total',
          populate: { path: 'productdata', select: 'code name' },
        },
      })
      .populate('payment', 'payment paymentuzs totalprice totalpriceuzs')
      .populate('discount', 'discount discountuzs')
      .populate('debt', 'debt debtuzs')
      .populate('client', 'name')
      .populate('packman', 'name')
      .populate('user', 'firstname lastname')
      .populate('saleconnector', 'id');
    res.status(201).send(connector);
  } catch (error) {
    res.status(400).json({ error: 'Serverda xatolik yuz berdi...' });
  }
};

module.exports.check = async (req, res) => {
  try {
    const { market, startDate, endDate } = req.body;

    const marke = await Market.findById(market);
    if (!marke) {
      return res.status(400).json({
        message: `Diqqat! Do'kon haqida malumotlar topilmadi!`,
      });
    }
    const count = await SaleConnector.find({
      createdAt: {
        $gte: startDate,
        $lt: endDate,
      },
    }).count();
    res.status(200).send({ count });
  } catch (error) {
    res.status(400).json({ error: 'Serverda xatolik yuz berdi...' });
  }
};

module.exports.getsaleconnectors = async (req, res) => {
  try {
    const { market, countPage, currentPage, startDate, endDate, search } =
      req.body;
    const marke = await Market.findById(market);
    if (!marke) {
      return res.status(400).json({
        message: `Diqqat! Do'kon haqida malumotlar topilmadi!`,
      });
    }

    const id = new RegExp('.*' + search ? search.id : '' + '.*', 'i');

    const name = new RegExp('.*' + search ? search.client : '' + '.*', 'i');

    const saleconnectors = await SaleConnector.find({
      market,
      id,
      createdAt: {
        $gte: startDate,
        $lt: endDate,
      },
    })
      .select('-isArchive -updatedAt -market -__v')
      .sort({ _id: -1 })
      .populate({
        path: 'products',
        select: 'user',
        populate: {
          path: 'user',
          select: 'firstname lastname',
        },
      })
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
      .populate(
        'payments',
        'payment paymentuzs comment totalprice totalpriceuzs'
      )
      .populate(
        'discounts',
        'discount discountuzs procient products totalprice totalpriceuzs'
      )
      .populate({ path: 'client', match: { name: name }, select: 'name' })
      .populate('packman', 'name')
      .populate('user', 'firstname lastname')
      .populate('dailyconnectors', 'comment')
      .then((connectors) => {
        return filter(
          connectors,
          (connector) =>
            (search.client.length > 0 &&
              connector.client !== null &&
              connector.client) ||
            search.client.length === 0
        );
      });

    res.status(200).json({
      saleconnectors: saleconnectors.splice(countPage * currentPage, countPage),
      count: saleconnectors.length,
    });
  } catch (error) {
    res.status(400).json({ error: 'Serverda xatolik yuz berdi...' });
  }
};

module.exports.getsaleconnectorsexcel = async (req, res) => {
  try {
    const { market, startDate, endDate, search } = req.body;

    const marke = await Market.findById(market);
    if (!marke) {
      return res.status(400).json({
        message: `Diqqat! Do'kon haqida malumotlar topilmadi!`,
      });
    }

    const id = new RegExp('.*' + search ? search.id : '' + '.*', 'i');

    const name = new RegExp('.*' + search ? search.client : '' + '.*', 'i');

    const saleconnectors = await SaleConnector.find({
      market,
      id,
      createdAt: {
        $gte: startDate,
        $lt: endDate,
      },
    })
      .select('-isArchive -updatedAt -user -market -__v')
      .sort({ _id: -1 })
      .populate({
        path: 'products',
        select:
          'totalprice unitprice totalpriceuzs unitpriceuzs pieces createdAt discount',
        options: { sort: { createdAt: -1 } },
        populate: {
          path: 'product',
          select: 'productdata',
          populate: {
            path: 'productdata',
            select: 'name code',
          },
        },
      })
      .populate('payments', 'payment paymentuzs')
      .populate('discounts', 'discount discountuzs procient products')
      .populate('debts', 'debt debtuzs')
      .populate({ path: 'client', match: { name: name }, select: 'name' })
      .populate('packman', 'name');

    const filter = saleconnectors.filter((item) => {
      return (
        (search.client.length > 0 && item.client !== null && item.client) ||
        search.client.length === 0
      );
    });

    res.status(200).json({ saleconnectors: filter });
  } catch (error) {
    res.status(400).json({ error: 'Serverda xatolik yuz berdi...' });
  }
};

module.exports.registeredit = async (req, res) => {
  try {
    const {
      saleproducts,
      discounts,
      payment,
      debt,
      market,
      user,
      saleconnectorid,
      comment,
    } = req.body;

    const marke = await Market.findById(market);
    if (!marke) {
      return res.status(400).json({
        message: `Diqqat! Do'kon haqida malumotlar topilmadi!`,
      });
    }

    const use = await User.findById(user);

    if (!use) {
      return res.status(400).json({
        message: `Diqqat! Avtorizatsiyadan o'tilmagan!`,
      });
    }

    const totalprice = convertToUsd(
      saleproducts.reduce((summ, saleproduct) => {
        return summ + saleproduct.totalprice;
      }, 0)
    );

    const totalpriceuzs = convertToUzs(
      saleproducts.reduce((summ, saleproduct) => {
        return summ + saleproduct.totalpriceuzs;
      }, 0)
    );

    let all = [];

    // Create SaleProducts
    for (const saleproduct of saleproducts) {
      if (saleproduct.pieces > 0) {
        const {
          totalprice,
          unitprice,
          totalpriceuzs,
          unitpriceuzs,
          pieces,
          product,
        } = saleproduct;
        const { error } = validateSaleProduct({
          totalprice,
          totalpriceuzs,
          unitprice,
          unitpriceuzs,
          pieces,
          product: product._id,
        });

        const produc = await Product.findById(product._id);

        const newSaleProduct = new SaleProduct({
          price: produc.price,
          totalprice: -totalprice,
          totalpriceuzs: -totalpriceuzs,
          unitprice,
          unitpriceuzs,
          pieces: -pieces,
          product: product._id,
          market,
          user,
          saleproduct: saleproduct._id,
          previous: produc.total,
          next: produc.total + Number(pieces),
        });

        await SaleProduct.findByIdAndUpdate(saleproduct._id, {
          $push: {
            saleproducts: newSaleProduct._id,
          },
        });

        const saleproductprice = await SaleProduct.findById(
          saleproduct._id
        ).select('price');

        newSaleProduct.price = saleproductprice.price;
        newSaleProduct.save();

        all.push(newSaleProduct);
      }
    }

    const dailysaleconnector = new DailySaleConnector({
      user,
      market,
      saleconnector: saleconnectorid,
      comment,
    });

    await dailysaleconnector.save();

    const saleconnector = await SaleConnector.findById(saleconnectorid);

    saleconnector.dailyconnectors.push(dailysaleconnector._id);

    let products = [];

    for (const saleproduct of all) {
      saleproduct.saleconnector = saleconnector._id;
      saleproduct.dailysaleconnector = dailysaleconnector._id;
      await saleproduct.save();
      products.push(saleproduct._id);

      const updateproduct = await Product.findById(saleproduct.product);
      updateproduct.total -= saleproduct.pieces;
      await updateproduct.save();
    }

    for (const discount of discounts) {
      await Discount.findByIdAndUpdate(discount._id, discount);
    }

    if (debt.debt > 0) {
      const newDebt = new Debt({
        comment: debt.comment,
        debt: debt.debt,
        debtuzs: debt.debtuzs,
        totalprice,
        totalpriceuzs,
        market,
        user,
        saleconnector: saleconnector._id,
        products,
      });
      await newDebt.save();
      saleconnector.debts.push(newDebt._id);
      dailysaleconnector.debt = newDebt._id;
    }
    if (payment.carduzs + payment.cashuzs + payment.transferuzs !== 0) {
      const newPayment = new Payment({
        comment: payment.comment,
        payment: convertToUsd(payment.card + payment.cash + payment.transfer),
        paymentuzs: convertToUzs(
          payment.carduzs + payment.cashuzs + payment.transferuzs
        ),
        card: convertToUsd(payment.card),
        cash: convertToUsd(payment.cash),
        transfer: convertToUsd(payment.transfer),
        carduzs: convertToUzs(payment.carduzs),
        cashuzs: convertToUzs(payment.cashuzs),
        transferuzs: payment.transferuzs,
        type: payment.type,
        totalprice,
        totalpriceuzs,
        market,
        user,
        saleconnector: saleconnector._id,
        products,
      });
      await newPayment.save();
      saleconnector.payments.push(newPayment._id);
      dailysaleconnector.payment = newPayment._id;
    }

    saleconnector.products.push(...products);
    await saleconnector.save();

    dailysaleconnector.id = saleconnector.dailyconnectors.length;
    dailysaleconnector.products = [...products];
    await dailysaleconnector.save();

    const connector = await DailySaleConnector.findById(dailysaleconnector._id)
      .select('-isArchive -updatedAt -market -__v')
      .populate({
        path: 'products',
        select: 'totalprice unitprice totalpriceuzs unitpriceuzs pieces',
        options: { sort: { created_at: -1 } },
        populate: {
          path: 'product',
          select: 'poductdata total',
          populate: { path: 'productdata', select: 'code name' },
        },
      })
      .populate('payment', 'payment paymentuzs totalprice totalpriceuzs')
      .populate('discount', 'discount discountuzs')
      .populate('debt', 'debt debtuzs')
      .populate('client', 'name')
      .populate('packman', 'name')
      .populate('user', 'firstname lastname')
      .populate('saleconnector', 'id');
    res.status(201).send(connector);
  } catch (error) {
    res.status(400).json({ error: 'Serverda xatolik yuz berdi...' });
  }
};

module.exports.payment = async (req, res) => {
  try {
    const { payment, market, user, saleconnectorid } = req.body;

    const marke = await Market.findById(market);
    if (!marke) {
      return res.status(400).json({
        message: `Diqqat! Do'kon haqida malumotlar topilmadi!`,
      });
    }

    const use = await User.findById(user);

    if (!use) {
      return res.status(400).json({
        message: `Diqqat! Avtorizatsiyadan o'tilmagan!`,
      });
    }
    const saleconnector = await SaleConnector.findById(saleconnectorid)
      .populate('client', 'name')
      .populate('packman', 'name');

    const newPayment = new Payment({
      comment: payment.comment,
      payment: payment.card + payment.cash + payment.transfer,
      paymentuzs: payment.carduzs + payment.cashuzs + payment.transferuzs,
      card: payment.card,
      cash: payment.cash,
      transfer: payment.transfer,
      carduzs: payment.carduzs,
      cashuzs: payment.cashuzs,
      transferuzs: payment.transferuzs,
      type: payment.type,
      market,
      user,
      saleconnector: saleconnectorid,
    });
    await newPayment.save();
    saleconnector.payments.push(newPayment._id);
    await saleconnector.save();
    const returnpayment = await Payment.findById(newPayment._id).populate({
      path: 'saleconnector',
      select: 'client packman',
      populate: { path: 'client', select: 'name' },
    });
    res.status(201).send(returnpayment);
  } catch (error) {
    res.status(400).json({ error: 'Serverda xatolik yuz berdi...' });
  }
};

module.exports.getreportproducts = async (req, res) => {
  try {
    const { market, countPage, currentPage, startDate, endDate, search } =
      req.body;
    const marke = await Market.findById(market);
    if (!marke) {
      return res.status(400).json({
        message: `Diqqat! Do'kon haqida malumotlar topilmadi!`,
      });
    }

    const code = new RegExp(
      '.*' + search ? search.codeofproduct : '' + '.*',
      'i'
    );
    const name = new RegExp(
      '.*' + search ? search.nameofproduct : '' + '.*',
      'i'
    );
    const client = new RegExp(
      '.*' + search ? search.nameofclient : '' + '.*',
      'i'
    );
    const firstname = new RegExp(
      '.*' + search ? search.nameofseller : '' + '.*',
      'i'
    );

    const saleproducts = await SaleProduct.find({
      market,
      createdAt: {
        $gte: startDate,
        $lt: endDate,
      },
    })
      .select('-isArchive -updatedAt -market -__v')
      .sort({ _id: -1 })
      .populate({
        path: 'user',
        select: 'firstname lastname',
        match: { firstname },
      })
      .populate({
        path: 'saleconnector',
        select: 'id client',
        populate: { path: 'client', select: 'name', match: { name: client } },
      })
      .populate({
        path: 'product',
        select: 'productdata',
        populate: {
          path: 'productdata',
          select: 'name code',
          match: { code, name },
        },
      })
      .populate({
        path: 'product',
        select: 'unit',
        populate: {
          path: 'unit',
          select: 'name',
        },
      })
      .then((saleproducts) =>
        filter(saleproducts, (saleproduct) =>
          search.nameofclient.length > 0
            ? saleproduct.product.productdata &&
              saleproduct.product.productdata !== null &&
              saleproduct.user &&
              saleproduct.user !== null &&
              saleproduct.saleconnector &&
              saleproduct.saleconnector.client &&
              saleproduct.saleconnector.client !== null
            : saleproduct.product.productdata &&
              saleproduct.product.productdata !== null &&
              saleproduct.user &&
              saleproduct.user !== null
        )
      );

    const count = await SaleProduct.find({
      market,
      createdAt: {
        $gte: startDate,
        $lt: endDate,
      },
    })
      .populate({
        path: 'user',
        select: 'firstname lastname',
        match: { firstname },
      })
      .populate({
        path: 'saleconnector',
        select: 'id client',
        populate: { path: 'client', select: 'name', match: { name: client } },
      })
      .populate({
        path: 'product',
        select: 'productdata',
        populate: {
          path: 'productdata',
          select: 'name code',
          match: { code, name },
        },
      })
      .populate({
        path: 'product',
        select: 'unit',
        populate: {
          path: 'unit',
          select: 'name',
        },
      })
      .then((saleproducts) =>
        filter(saleproducts, (saleproduct) =>
          search.nameofclient.length > 0
            ? saleproduct.product.productdata &&
              saleproduct.product.productdata !== null &&
              saleproduct.user &&
              saleproduct.user !== null &&
              saleproduct.saleconnector &&
              saleproduct.saleconnector.client &&
              saleproduct.saleconnector.client !== null
            : saleproduct.product.productdata &&
              saleproduct.product.productdata !== null &&
              saleproduct.user &&
              saleproduct.user !== null
        )
      );

    res.status(200).send({
      products: saleproducts.splice(countPage * currentPage, countPage),
      count: count.length,
    });
  } catch (error) {
    res.status(400).json({ error: 'Serverda xatolik yuz berdi...' });
  }
};

module.exports.getexcelreportproducts = async (req, res) => {
  try {
    const { market, search, startDate, endDate } = req.body;
    const marke = await Market.findById(market);
    if (!marke) {
      return res.status(400).json({
        message: `Diqqat! Do'kon haqida malumotlar topilmadi!`,
      });
    }

    const code = new RegExp(
      '.*' + search ? search.codeofproduct : '' + '.*',
      'i'
    );
    const name = new RegExp(
      '.*' + search ? search.nameofproduct : '' + '.*',
      'i'
    );
    const client = new RegExp(
      '.*' + search ? search.nameofclient : '' + '.*',
      'i'
    );
    const firstname = new RegExp(
      '.*' + search ? search.nameofseller : '' + '.*',
      'i'
    );

    const saleproducts = await SaleProduct.find({
      market,
      createdAt: {
        $gte: startDate,
        $lt: endDate,
      },
    })
      .select('-isArchive -updatedAt -market -__v')
      .sort({ _id: -1 })
      .populate({
        path: 'user',
        select: 'firstname lastname',
        match: { firstname },
      })
      .populate({
        path: 'saleconnector',
        select: 'id client',
        populate: { path: 'client', select: 'name', match: { name: client } },
      })
      .populate({
        path: 'product',
        select: 'productdata',
        populate: {
          path: 'productdata',
          select: 'name code',
          match: { code, name },
        },
      })
      .populate({
        path: 'product',
        select: 'unit',
        populate: {
          path: 'unit',
          select: 'name',
        },
      })
      .then((saleproducts) =>
        filter(saleproducts, (saleproduct) =>
          search.nameofclient.length > 0
            ? saleproduct.product.productdata &&
              saleproduct.product.productdata !== null &&
              saleproduct.user &&
              saleproduct.user !== null &&
              saleproduct.saleconnector &&
              saleproduct.saleconnector.client &&
              saleproduct.saleconnector.client !== null
            : saleproduct.product.productdata &&
              saleproduct.product.productdata !== null &&
              saleproduct.user &&
              saleproduct.user !== null
        )
      );

    res.status(200).send({
      products: saleproducts,
    });
  } catch (error) {
    res.status(400).json({ error: 'Serverda xatolik yuz berdi...' });
  }
};

module.exports.addClient = async (req, res) => {
  try {
    const { packmanid, client, market, saleconnectorid } = req.body;

    const marke = await Market.findById(market);
    if (!marke) {
      return res.status(400).json({
        message: `Diqqat! Do'kon haqida malumotlar topilmadi!`,
      });
    }

    const isPackman = await Packman.findById(packmanid);

    const isClient = await Client.findById(client._id);

    if (isClient) {
      await editSaleConnector(isClient, saleconnectorid);
    } else {
      const newclient = new Client({
        name: client.name,
        market,
      });
      await newclient.save();

      if (isPackman) {
        newclient.packman = isPackman._id;
        isPackman.clients.push(newclient._id);
        await isPackman.save();
      }
      await newclient.save();

      await editSaleConnector(newclient, saleconnectorid);
    }

    const saleConnector = await SaleConnector.findById(saleconnectorid);

    res.status(200).json(saleConnector);
  } catch (error) {
    res.status(400).json({ error: 'Serverda xatolik yuz berdi...' });
  }
};

const editSaleConnector = async (client, saleconnectorid) => {
  const saleconnector = await SaleConnector.findById(saleconnectorid);
  saleconnector.client = client._id;
  await saleconnector.save();
};
