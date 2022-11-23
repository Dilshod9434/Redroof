const { Client, validateClient } = require("../../models/Sales/Client.js");
const { Market } = require("../../models/MarketAndBranch/Market");
const { Packman } = require("../../models/Sales/Packman.js");

module.exports.register = async (req, res) => {
    try {
        const { name, market, packman, search, currentPage, countPage } = req.body;
        const { error } = validateClient({ name, market });
        if (error) {
            return res.status(400).json({
                error: error.message,
            });
        }
        const marke = await Market.findById(market);
        if (!marke) {
            return res.status(400).json({
                message: `Diqqat! Do'kon haqida malumotlar topilmadi.`,
            });
        }

        const client = await Client.findOne({
            name,
            market,
        });

        if (client) {
            return res.status(400).json({
                message: `Diqqat! ${name} mijoz avval yaratilgan!`,
            });
        }

        const newClient = new Client({
            name,
            market,
        });
        await newClient.save();

        if (packman) {
            const checkpackman = await Packman.findById(packman);
            if (checkpackman) {
                newClient.packman = checkpackman._id;
                await Packman.findByIdAndUpdate(checkpackman._id, {
                    $push: {
                        clients: newClient,
                    },
                });
                await newClient.save();
            }
        }
        const clientname = new RegExp(
            ".*" + search ? search.client : "" + ".*",
            "i"
        );
        const clientpackman = new RegExp(
            ".*" + search ? search.packman : "" + ".*",
            "i"
        );

        const clientsCount = await Client.find({ market, name: clientname })
            .sort({ _id: -1 })
            .select("name market packman")
            .populate({ path: "packman", match: { name: clientpackman } });

        const filterCount = clientsCount.filter((item) => {
            return item.packman !== null;
        });

        const clients = await Client.find({ market, name: clientname })
            .sort({ _id: -1 })
            .select("name market packman")
            .populate({ path: "packman", match: { name: clientpackman } })
            .populate("packman", "name")
            .skip(currentPage * countPage)
            .limit(countPage);

        const filter = clients.filter((item) => {
            return item.packman !== null;
        });

        res.status(201).json({ clients: filter, count: filterCount.length });
    } catch (error) {
        res.status(400).json({ error: "Serverda xatolik yuz berdi..." });
    }
};

module.exports.getAll = async (req, res) => {
    try {
        const { market } = req.body;

        const marke = await Market.findById(market);
        if (!marke) {
            return res.status(400).json({
                message: "Diqqat! Do'kon haqida malumotlari topilmadi!",
            });
        }

        const client = await Client.find({ market })
            .select("name")
            .populate("packman", "name");

        res.status(201).send(client);
    } catch (error) {
        res.status(501).json({ error: "Serverda xatolik yuz berdi..." });
    }
};

module.exports.updateClient = async (req, res) => {
    try {
        const { _id, market, name, packman, search, currentPage, countPage } =
            req.body;
        const marke = await Market.findById(market);
        if (!marke) {
            return res
                .status(400)
                .json({ message: "Diqqat! Do'kon haqida malumot topilmadi!" });
        }
        const client = await Client.findById(_id);
        if (!client) {
            return res
                .status(400)
                .json({ message: `Diqqat! ${name} mijoz avval yaratilmagan` });
        }
        const updatedClient = {
            name: name,
        };
        const packMan = await Packman.findById(packman);
        if (packMan) {
            await Packman.findByIdAndUpdate(client.packman, {
                $pull: {
                    clients: _id,
                },
            });
            if (client.packman !== packMan._id) {
                await Packman.findByIdAndUpdate(packMan._id, {
                    $push: {
                        clients: _id,
                    },
                });
            } else {
                await Packman.findByIdAndUpdate(client.packman, {
                    $push: {
                        clients: _id,
                    },
                });
            }
            updatedClient.packman = { name: packMan.name, _id: packMan._id };
        }

        await Client.findByIdAndUpdate(_id, {
            ...updatedClient,
        });

        const clientname = new RegExp(
            ".*" + search ? search.client : "" + ".*",
            "i"
        );
        const clientpackman = new RegExp(
            ".*" + search ? search.packman : "" + ".*",
            "i"
        );

        const clientsCount = await Client.find({ market, name: clientname })
            .sort({ _id: -1 })
            .select("name market packman")
            .populate({ path: "packman", match: { name: clientpackman } });

        const filterCount = clientsCount.filter((item) => {
            return item.packman !== null;
        });

        const clients = await Client.find({ market, name: clientname })
            .sort({ _id: -1 })
            .select("name market packman")
            .populate({ path: "packman", match: { name: clientpackman } })
            .populate("packman", "name")
            .skip(currentPage * countPage)
            .limit(countPage);

        const filter = clients.filter((item) => {
            return item.packman !== null;
        });

        res.status(201).json({ clients: filter, count: filterCount.length });
    } catch (error) {
        res.status(501).json({ error: "Serverda xatolik yuz berdi..." });
    }
};

module.exports.deleteClient = async (req, res) => {
    try {
        const { _id, market, name, packman, search, currentPage, countPage } =
            req.body;

        const marke = await Market.findById(market);
        if (!marke) {
            return res
                .status(400)
                .json({ message: "Diqqat! Do'kon haqida malumot topilmadi!" });
        }
        const client = await Client.findById(_id);
        if (!client) {
            return res
                .status(400)
                .json({ message: `Diqqat! ${name} mijoz avval yaratilmagan!` });
        }

        if (packman) {
            const packMan = await Packman.findById(packman);

            if (packMan) {
                await Packman.findByIdAndUpdate(packman, {
                    $pull: {
                        clients: client._id,
                    },
                });
            }
        }
        await Client.findByIdAndDelete(_id);

        const clientname = new RegExp(
            ".*" + search ? search.client : "" + ".*",
            "i"
        );
        const clientpackman = new RegExp(
            ".*" + search ? search.packman : "" + ".*",
            "i"
        );

        const clientsCount = await Client.find({ market, name: clientname })
            .sort({ _id: -1 })
            .select("name market packman")
            .populate({ path: "packman", match: { name: clientpackman } });

        const filterCount = clientsCount.filter((item) => {
            return item.packman !== null;
        });

        const clients = await Client.find({ market, name: clientname })
            .sort({ _id: -1 })
            .select("name market packman")
            .populate({ path: "packman", match: { name: clientpackman } })
            .populate("packman", "name")
            .skip(currentPage * countPage)
            .limit(countPage);

        const filter = clients.filter((item) => {
            return item.packman !== null;
        });

        res.status(201).json({ clients: filter, count: filterCount.length });
    } catch (error) {
        res.status(501).json({ error: "Serverda xatolik yuz berdi..." });
    }
};

module.exports.getClients = async (req, res) => {
    try {
        const { market, currentPage, countPage, search } = req.body;
        const marke = await Market.findById(market);
        if (!marke) {
            return res
                .status(401)
                .json({ message: "Diqqat! Do'kon malumotlari topilmadi." });
        }

        const name = new RegExp(".*" + search ? search.client : "" + ".*", "i");
        const packman = new RegExp(".*" + search ? search.packman : "" + ".*", "i");

        const clientsCount = await Client.find({ market, name: name })
            .sort({ _id: -1 })
            .select("name market packman")
            .populate({ path: "packman", match: { name: packman } });

        const filterCount = clientsCount.filter((item) => {
            return item.packman !== null;
        });

        const clients = await Client.find({ market, name: name })
            .sort({ _id: -1 })
            .select("name market packman")
            .populate({ path: "packman", match: { name: packman }, select: 'name'})
            .skip(currentPage * countPage)
            .limit(countPage);
        const filter = clients.filter((item) => {
            return item.packman !== null;
        });

        res.status(201).json({ clients: filter, count: filterCount.length });
    } catch (error) {
        res.status(501).json({ error: "Serverda xatolik yuz berdi..." });
    }
};