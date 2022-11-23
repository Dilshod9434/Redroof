const { Market } = require("../models/MarketAndBranch/Market.js");
const { Product } = require("../models/Products/Product.js");
const { ProductData } = require("../models/Products/Productdata.js");
const { Category } = require("../models/Products/Category.js");
const { Unit } = require("../models/Products/Unit.js");
const { ProductPrice } = require("../models/Products/ProductPrice.js");
const { User } = require("../models/Users.js");

const getProductsByCount = async ({ socket, market }) => {
  try {
    const marke = await Market.findById(market);
    if (!marke) {
      return socket.emit("error", {
        id: market,
        message: "Diqqat! Do'kon ma'lumotlari topilmadi.",
      });
    }
    const categories = await Category.find(
      { market },
      { timestamp: 1, code: 1, name: 1, products: 1 }
    )
      .sort({ code: 1 })
      .select("_id");

    socket.emit("categories", { id: market, categories });

    for (const category of categories) {
      const products = await Product.find(
        { market, category },
        { timestamp: 1 }
      )
        .sort({ timestamp: -1 })
        .select("market total productdata price category unit")
        .populate("productdata", "name code barcode")
        .populate(
          "price",
          "sellingprice incomingprice sellingpriceuzs incomingpriceuzs tradeprice tradepriceuzs"
        )
        .populate("category", "name code")
        .populate("unit", "name");
      socket.emit("getProductsOfCount", { id: market, products });
    }
  } catch (error) {
    return socket.emit("error", {
      id: market,
      message: "Serverda xatolik yuz berdi",
    });
  }
};

const getAllFilials = async ({ socket, market }) => {
  try {
    const marke = await Market.findById(market);
    if (!marke) {
      return socket.emit("error", {
        id: market,
        message: "Diqqat! Do'kon ma'lumotlari topilmadi.",
      });
    }
    const filials = await Market.find({ mainmarket: market }, { timestamp: 1 })
      .select("director image name phone1 createdAt")
      .populate("director", "firstname lastname");
    return socket.emit("getAllFilials", { id: market, filials });
  } catch (error) {
    return socket.emit("error", {
      id: market,
      message: "Serverda xatolik yuz berdi",
    });
  }
};

const getPartnerProducts = async ({ socket, market, partner }) => {
  try {
    const marke = await Market.findById(market);
    if (!marke) {
      return socket.emit("error", {
        id: market,
        message: "Diqqat! Do'kon ma'lumotlari topilmadi.",
      });
    }
    const categories = await Category.find(
      { market: partner, connections: market },

      { timestamp: 1, code: 1, name: 1, products: 1 }
    )
      .sort({ code: 1 })
      .select("_id");
    socket.emit("partnerCategories", { id: market, categories });
    for (const category of categories) {
      const products = await Product.find(
        { market: partner, category, connections: market },
        { timestamp: 1 }
      )
        .sort({ timestamp: -1 })
        .select("market total productdata price category unit")
        .populate("productdata", "name code barcode")
        .populate(
          "price",
          "sellingprice incomingprice sellingpriceuzs incomingpriceuzs tradeprice tradepriceuzs"
        )
        .populate("category", "name code")
        .populate("unit", "name");
      socket.emit("setPartnerProducts", { id: market, products });
    }
    socket.emit("partnerCategories", { id: market, categories });
  } catch (error) {
    return socket.emit("error", {
      id: market,
      message: "Serverda xatolik yuz berdi",
    });
  }
};

module.exports = {
  getProductsByCount,
  getAllFilials,
  getPartnerProducts,
};
