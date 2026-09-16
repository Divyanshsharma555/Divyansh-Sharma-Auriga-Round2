CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT NOT NULL CHECK (priority IN ('urgent', 'high', 'normal')),
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
    assignee TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    response_due_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_tickets_status
ON tickets(status);

CREATE INDEX IF NOT EXISTS idx_tickets_priority
ON tickets(priority);

CREATE INDEX IF NOT EXISTS idx_tickets_assignee
ON tickets(assignee);

CREATE INDEX IF NOT EXISTS idx_tickets_customer_name
ON tickets(customer_name);

CREATE INDEX IF NOT EXISTS idx_tickets_response_due_at
ON tickets(response_due_at);