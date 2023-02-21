const express = require('express');
const routesController = require('../controllers/routesController');

const router = express.Router();

router.get('/',routesController.getRoutes);

module.exports = router;