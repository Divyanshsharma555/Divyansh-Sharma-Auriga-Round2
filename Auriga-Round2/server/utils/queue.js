const getQueueOrder = () => `
    CASE
        WHEN unixepoch(response_due_at) < unixepoch('now') THEN 1
        ELSE 0
    END DESC,
    CASE
        WHEN priority = 'urgent' THEN 3
        WHEN priority = 'high' THEN 2
        ELSE 1
    END DESC,
    unixepoch(response_due_at) ASC,
    unixepoch(created_at) ASC,
    id ASC
`;

module.exports = {
    getQueueOrder
};