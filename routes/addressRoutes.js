const express = require('express');
const router = express.Router({ mergeParams: true });
const addressController = require('../controllers/addressController');

router.get('/', addressController.getAddressesByEmployeeId);
router.post('/', addressController.createAddress);
router.put('/:id', addressController.updateAddress);
router.delete('/:id', addressController.deleteAddress);

module.exports = router;