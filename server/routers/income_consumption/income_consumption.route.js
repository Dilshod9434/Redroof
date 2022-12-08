const { Router } = require('express');
const authMiddleware = require('../../middleware/auth.middleware');

const router = Router();

// Income requests
router.post('/income/create', authMiddleware, (req, res) => {
  require('./income.route').create(req, res);
});

router.put('/income/update', authMiddleware, (req, res) => {
  require('./income.route').update(req, res);
});

router.delete('/income/delete/:id', authMiddleware, (req, res) => {
  require('./income.route').delete(req, res);
});

router.get('/income/get', authMiddleware, (req, res) => {
  require('./income.route').get(req, res);
});

// Income Consumption Name requests
router.post('/income_consumption_name/create', authMiddleware, (req, res) => {
  require('./incomeName.route').create(req, res);
});

router.put('/income_consumption_name/update', authMiddleware, (req, res) => {
  require('./incomeName.route').update(req, res);
});

router.delete(
  '/income_consumption_name/delete/:id',
  authMiddleware,
  (req, res) => {
    require('./incomeName.route').delete(req, res);
  }
);

router.get('/income_consumption_name/get', authMiddleware, (req, res) => {
  require('./incomeName.route').get(req, res);
});

// Consumption requests
router.post('/consumption/create', authMiddleware, (req, res) => {
  require('./consumption.route').create(req, res);
});

router.put('/consumption/update', authMiddleware, (req, res) => {
  require('./consumption.route').update(req, res);
});

router.delete('/consumption/delete/:id', authMiddleware, (req, res) => {
  require('./consumption.route').delete(req, res);
});

router.get('/consumption/get', authMiddleware, (req, res) => {
  require('./consumption.route').get(req, res);
});

// get Total
router.get('/income_consumption_total/get', (req, res) => {
  require('./totalIncomeConsumption').getTotal(req, res);
});

module.exports = router;
