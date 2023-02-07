const { Router } = require('express');
const authMiddleware = require('../../middleware/auth.middleware');
const router = Router();

router.post('/expense_product/create', authMiddleware, (req, res) => {
  require('./expenseProduct').createExpenseProduct(req, res);
});

router.get('/expense_product/get', authMiddleware, (req, res) => {
  require('./expenseProduct').getExpenseProducts(req, res);
});

router.post('/expense_product/delete', authMiddleware, (req, res) => {
  require('./expenseProduct').delete(req, res);
});

module.exports = router;
