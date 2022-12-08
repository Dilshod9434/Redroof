const { IncomeName } = require('../../models/Income_Consumption/Income');
const { Market } = require('../../models/MarketAndBranch/Market');

module.exports.create = async (req, res) => {
  try {
    const { name, market } = req.body;

    const marke = await Market.findById(market);
    if (!marke) {
      return res.status(400).json({
        message: `Diqqat! Do'kon haqida malumotlar topilmadi.`,
      });
    }

    const newIncomeName = new IncomeName({
      name,
      market,
    });
    await newIncomeName.save();

    const resData = await IncomeName.findById(newIncomeName._id).select(
      '-isArchive -updatedAt -__v'
    );

    res.status(200).json(resData);
  } catch (error) {
    res.status(501).json({ error: 'Serverda xatolik yuz berdi...' });
  }
};

module.exports.update = async (req, res) => {
  try {
    const { _id, name } = req.body;

    await IncomeName.findByIdAndUpdate(_id, {
      name: name,
    });

    const resData = await IncomeName.findById(_id).select(
      '-isArchive -updatedAt -__v'
    );

    res.status(200).json(resData);
  } catch (error) {
    res.status(501).json({ error: 'Serverda xatolik yuz berdi...' });
  }
};

module.exports.delete = async (req, res) => {
  try {
    const { _id } = req.query;

    await IncomeName.findByIdAndDelete(_id);

    res.status(200).json(_id);
  } catch (error) {
    res.status(501).json({ error: 'Serverda xatolik yuz berdi...' });
  }
};

module.exports.get = async (req, res) => {
  try {
    const { market } = req.query;

    const marke = await Market.findById(market);
    if (!marke) {
      return res.status(400).json({
        message: `Diqqat! Do'kon haqida malumotlar topilmadi.`,
      });
    }

    const incomeNames = await IncomeName.find({
      market,
    })
      .sort({ createdAt: -1 })
      .select('-isArchive -updatedAt -__v');

    res.status(200).json(incomeNames);
  } catch (error) {
    console.log(error);
    res.status(501).json({ error: 'Serverda xatolik yuz berdi...' });
  }
};
