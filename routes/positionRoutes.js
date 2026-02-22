const express = require('express');
const router = express.Router();
const positionController = require('../controllers/positionController');

router.get('/', positionController.getAllPositions);
router.get('/:id', positionController.getPositionById);
router.post('/', positionController.createPosition);
router.put('/:id', positionController.updatePosition);
router.delete('/:id', positionController.deletePosition);

module.exports = router;