const express = require('express');
const router = express.Router({ mergeParams: true });
const documentController = require('../controllers/documentController');

router.get('/', documentController.getDocumentsByEmployeeId);
router.post('/', documentController.createDocument);
router.put('/:id', documentController.updateDocument);
router.delete('/:id', documentController.deleteDocument);

module.exports = router;