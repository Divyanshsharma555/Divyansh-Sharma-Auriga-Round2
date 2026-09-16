const db = require('../db/database');

const escalationJob = () => {
    const overdueTickets = db.prepare(`
        SELECT id, priority
        FROM tickets
        WHERE status != 'resolved'
        AND unixepoch(response_due_at) < unixepoch('now')
        AND priority != 'urgent'
    `).all();

    if (!overdueTickets.length) {
        return 0;
    }

    const escalate = db.prepare(`
        UPDATE tickets
        SET priority = @newPriority,
            updated_at = @updatedAt
        WHERE id = @id
    `);

    const transaction = db.transaction((tickets) => {
        let count = 0;

        for (const ticket of tickets) {
            const newPriority = ticket.priority === 'normal'
                ? 'high'
                : 'urgent';

            escalate.run({
                id: ticket.id,
                newPriority,
                updatedAt: new Date().toISOString()
            });

            count++;
        }

        return count;
    });

    return transaction(overdueTickets);
};

module.exports = escalationJob;