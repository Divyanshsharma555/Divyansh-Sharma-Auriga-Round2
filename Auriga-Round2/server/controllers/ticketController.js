const db = require('../db/database');
const { getQueueOrder } = require('../utils/queue');

const priorities = ['urgent', 'normal'];
const statuses = ['open', 'in_progress', 'resolved'];

const formatTicket = (ticket) => ({
    id: ticket.id,
    customerName: ticket.customer_name,
    title: ticket.title,
    description: ticket.description,
    priority: ticket.priority,
    status: ticket.status,
    assignee: ticket.assignee,
    createdAt: ticket.created_at,
    responseDueAt: ticket.response_due_at,
    isOverdue: ticket.is_overdue === 1
});

const validatePriority = (priority) => priorities.includes(priority);

const validateStatus = (status) => statuses.includes(status);

const getDueTime = (createdAt, priority) => {
    const date = new Date(createdAt);
    date.setHours(date.getHours() + (priority === 'urgent' ? 2 : 24));
    return date.toISOString();
};

const buildFilters = (query) => {
    const conditions = [];
    const params = {};

    if (query.search) {
        conditions.push('LOWER(customer_name) LIKE LOWER(@search)');
        params.search = `%${query.search.trim()}%`;
    }

    if (query.priority) {
        if (!validatePriority(query.priority)) {
            const error = new Error('Invalid priority');
            error.status = 400;
            throw error;
        }

        conditions.push('priority = @priority');
        params.priority = query.priority;
    }

    if (query.status) {
        if (!validateStatus(query.status)) {
            const error = new Error('Invalid status');
            error.status = 400;
            throw error;
        }

        conditions.push('status = @status');
        params.status = query.status;
    }

    if (query.assignee) {
        if (query.assignee === 'unassigned') {
            conditions.push('assignee IS NULL');
        } else {
            conditions.push('LOWER(assignee) = LOWER(@assignee)');
            params.assignee = query.assignee.trim();
        }
    }

    if (query.overdue !== undefined) {
        if (query.overdue !== 'true' && query.overdue !== 'false') {
            const error = new Error('overdue must be true or false');
            error.status = 400;
            throw error;
        }

        if (query.overdue === 'true') {
            conditions.push("unixepoch(response_due_at) < unixepoch('now')");
        } else {
            conditions.push("unixepoch(response_due_at) >= unixepoch('now')");
        }
    }

    if (!query.status) {
        conditions.push("status != 'resolved'");
    }

    return {
        where: conditions.length ? `WHERE ${conditions.join(' AND ')}` : '',
        params
    };
};

const getTickets = (req, res, next) => {
    try {
        const page = Number.parseInt(req.query.page || '1', 10);
        const limit = Number.parseInt(req.query.limit || '10', 10);

        if (!Number.isInteger(page) || page < 1) {
            const error = new Error('Page must be a positive integer');
            error.status = 400;
            throw error;
        }

        if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
            const error = new Error('Limit must be between 1 and 100');
            error.status = 400;
            throw error;
        }

        const offset = (page - 1) * limit;
        const { where, params } = buildFilters(req.query);

        const countQuery = `
            SELECT COUNT(*) AS total
            FROM tickets
            ${where}
        `;

        const { total } = db.prepare(countQuery).get(params);

        const ticketQuery = `
            SELECT
                *,
                CASE
                    WHEN unixepoch(response_due_at) < unixepoch('now') THEN 1
                    ELSE 0
                END AS is_overdue
            FROM tickets
            ${where}
            ORDER BY ${getQueueOrder()}
            LIMIT @limit OFFSET @offset
        `;

        const tickets = db.prepare(ticketQuery).all({
            ...params,
            limit,
            offset
        });

        res.json({
            data: tickets.map(formatTicket),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

const getTicket = (req, res, next) => {
    try {
        const id = Number.parseInt(req.params.id, 10);

        if (!Number.isInteger(id) || id < 1) {
            const error = new Error('Invalid ticket ID');
            error.status = 400;
            throw error;
        }

        const ticket = db.prepare(`
            SELECT
                *,
                CASE
                    WHEN unixepoch(response_due_at) < unixepoch('now') THEN 1
                    ELSE 0
                END AS is_overdue
            FROM tickets
            WHERE id = ?
        `).get(id);

        if (!ticket) {
            const error = new Error('Ticket not found');
            error.status = 404;
            throw error;
        }

        res.json(formatTicket(ticket));
    } catch (error) {
        next(error);
    }
};

const createTicket = (req, res, next) => {
    try {
        const {
            customerName,
            title,
            description = null,
            priority,
            status = 'open',
            assignee = null
        } = req.body;

        if (!customerName || typeof customerName !== 'string' || !customerName.trim()) {
            const error = new Error('Customer name is required');
            error.status = 400;
            throw error;
        }

        if (!title || typeof title !== 'string' || !title.trim()) {
            const error = new Error('Ticket title is required');
            error.status = 400;
            throw error;
        }

        if (!validatePriority(priority)) {
            const error = new Error('Priority must be urgent or normal');
            error.status = 400;
            throw error;
        }

        if (!validateStatus(status)) {
            const error = new Error('Invalid status');
            error.status = 400;
            throw error;
        }

        const createdAt = new Date().toISOString();
        const updatedAt = createdAt;
        const responseDueAt = getDueTime(createdAt, priority);

        const result = db.prepare(`
            INSERT INTO tickets (
                customer_name,
                title,
                description,
                priority,
                status,
                assignee,
                created_at,
                updated_at,
                response_due_at
            )
            VALUES (
                @customerName,
                @title,
                @description,
                @priority,
                @status,
                @assignee,
                @createdAt,
                @updatedAt,
                @responseDueAt
            )
        `).run({
            customerName: customerName.trim(),
            title: title.trim(),
            description: description ? String(description).trim() : null,
            priority,
            status,
            assignee: assignee ? String(assignee).trim() : null,
            createdAt,
            updatedAt,
            responseDueAt
        });

        const ticket = db.prepare(`
            SELECT
                *,
                CASE
                    WHEN unixepoch(response_due_at) < unixepoch('now') THEN 1
                    ELSE 0
                END AS is_overdue
            FROM tickets
            WHERE id = ?
        `).get(result.lastInsertRowid);

        res.status(201).json(formatTicket(ticket));
    } catch (error) {
        next(error);
    }
};

const updateTicket = (req, res, next) => {
    try {
        const id = Number.parseInt(req.params.id, 10);

        if (!Number.isInteger(id) || id < 1) {
            const error = new Error('Invalid ticket ID');
            error.status = 400;
            throw error;
        }

        const existing = db.prepare('SELECT * FROM tickets WHERE id = ?').get(id);

        if (!existing) {
            const error = new Error('Ticket not found');
            error.status = 404;
            throw error;
        }

        const allowedFields = {
            customerName: 'customer_name',
            title: 'title',
            description: 'description',
            priority: 'priority',
            status: 'status',
            assignee: 'assignee'
        };

        const updates = [];
        const params = { id };

        for (const [field, column] of Object.entries(allowedFields)) {
            if (req.body[field] !== undefined) {
                if (field === 'priority' && !validatePriority(req.body[field])) {
                    const error = new Error('Priority must be urgent or normal');
                    error.status = 400;
                    throw error;
                }

                if (field === 'status' && !validateStatus(req.body[field])) {
                    const error = new Error('Invalid status');
                    error.status = 400;
                    throw error;
                }

                if (
                    field === 'customerName' &&
                    (!req.body[field] || !String(req.body[field]).trim())
                ) {
                    const error = new Error('Customer name cannot be empty');
                    error.status = 400;
                    throw error;
                }

                if (
                    field === 'title' &&
                    (!req.body[field] || !String(req.body[field]).trim())
                ) {
                    const error = new Error('Ticket title cannot be empty');
                    error.status = 400;
                    throw error;
                }

                updates.push(`${column} = @${field}`);

                params[field] = field === 'description'
                    ? (req.body[field] ? String(req.body[field]).trim() : null)
                    : (typeof req.body[field] === 'string'
                        ? req.body[field].trim()
                        : req.body[field]);
            }
        }

        if (!updates.length) {
            const error = new Error('No valid fields to update');
            error.status = 400;
            throw error;
        }

        updates.push('updated_at = @updatedAt');
        params.updatedAt = new Date().toISOString();

        db.prepare(`
            UPDATE tickets
            SET ${updates.join(', ')}
            WHERE id = @id
        `).run(params);

        const ticket = db.prepare(`
            SELECT
                *,
                CASE
                    WHEN unixepoch(response_due_at) < unixepoch('now') THEN 1
                    ELSE 0
                END AS is_overdue
            FROM tickets
            WHERE id = ?
        `).get(id);

        res.json(formatTicket(ticket));
    } catch (error) {
        next(error);
    }
};

const assignTicket = (req, res, next) => {
    try {
        const id = Number.parseInt(req.params.id, 10);

        if (!Number.isInteger(id) || id < 1) {
            const error = new Error('Invalid ticket ID');
            error.status = 400;
            throw error;
        }

        const ticket = db.prepare('SELECT id FROM tickets WHERE id = ?').get(id);

        if (!ticket) {
            const error = new Error('Ticket not found');
            error.status = 404;
            throw error;
        }

        const assignee = req.body.assignee;

        if (
            assignee !== null &&
            (typeof assignee !== 'string' || !assignee.trim())
        ) {
            const error = new Error('Assignee must be a non-empty name or null');
            error.status = 400;
            throw error;
        }

        db.prepare(`
            UPDATE tickets
            SET assignee = ?, updated_at = ?
            WHERE id = ?
        `).run(
            assignee === null ? null : assignee.trim(),
            new Date().toISOString(),
            id
        );

        const updated = db.prepare(`
            SELECT
                *,
                CASE
                    WHEN unixepoch(response_due_at) < unixepoch('now') THEN 1
                    ELSE 0
                END AS is_overdue
            FROM tickets
            WHERE id = ?
        `).get(id);

        res.json(formatTicket(updated));
    } catch (error) {
        next(error);
    }
};

const updateStatus = (req, res, next) => {
    try {
        const id = Number.parseInt(req.params.id, 10);
        const { status } = req.body;

        if (!Number.isInteger(id) || id < 1) {
            const error = new Error('Invalid ticket ID');
            error.status = 400;
            throw error;
        }

        if (!validateStatus(status)) {
            const error = new Error('Invalid status');
            error.status = 400;
            throw error;
        }

        const ticket = db.prepare('SELECT id FROM tickets WHERE id = ?').get(id);

        if (!ticket) {
            const error = new Error('Ticket not found');
            error.status = 404;
            throw error;
        }

        db.prepare(`
            UPDATE tickets
            SET status = ?, updated_at = ?
            WHERE id = ?
        `).run(
            status,
            new Date().toISOString(),
            id
        );

        const updated = db.prepare(`
            SELECT
                *,
                CASE
                    WHEN unixepoch(response_due_at) < unixepoch('now') THEN 1
                    ELSE 0
                END AS is_overdue
            FROM tickets
            WHERE id = ?
        `).get(id);

        res.json(formatTicket(updated));
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getTickets,
    getTicket,
    createTicket,
    updateTicket,
    assignTicket,
    updateStatus
};