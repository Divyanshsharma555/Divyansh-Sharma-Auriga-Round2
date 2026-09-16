function QueueSummary({ tickets, total }) {
    const overdue = tickets.filter((ticket) => ticket.isOverdue).length;
    const urgent = tickets.filter((ticket) => ticket.priority === 'urgent').length;
    const high = tickets.filter((ticket) => ticket.priority === 'high').length;

    return (
        <section className="summary-grid">
            <div className="summary-card">
                <span>Active Tickets</span>
                <strong>{total}</strong>
                <small>Total in queue</small>
            </div>

            <div className="summary-card overdue-summary">
                <span>Overdue</span>
                <strong>{overdue}</strong>
                <small>Requires attention</small>
            </div>

            <div className="summary-card urgent-summary">
                <span>Urgent</span>
                <strong>{urgent}</strong>
                <small>Highest priority</small>
            </div>

            <div className="summary-card">
                <span>High Priority</span>
                <strong>{high}</strong>
                <small>Escalated priority</small>
            </div>
        </section>
    );
}

export default QueueSummary;