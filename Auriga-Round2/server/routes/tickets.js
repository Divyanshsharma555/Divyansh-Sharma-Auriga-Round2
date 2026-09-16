const express = require('express');

const {
    getTickets,
    getTicket,
    createTicket,
    updateTicket,
    assignTicket,
    updateStatus
} = require('../controllers/ticketController');

const router = express.Router();

router.get('/', getTickets);
router.get('/:id', getTicket);
router.post('/', createTicket);
router.patch('/:id', updateTicket);
router.patch('/:id/assign', assignTicket);
router.patch('/:id/status', updateStatus);

module.exports = router;