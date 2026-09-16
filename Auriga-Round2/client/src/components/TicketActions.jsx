function TicketActions({
    ticket,
    assignees,
    onAssign,
    onStatusChange,
    disabled
}) {
    return (
        <div className="ticket-actions">
            <select
                value={ticket.assignee || ''}
                disabled={disabled}
                onChange={(event) =>
                    onAssign(ticket.id, event.target.value)
                }
            >
                <option value="">Unassigned</option>

                {assignees.map((assignee) => (
                    <option key={assignee} value={assignee}>
                        {assignee}
                    </option>
                ))}
            </select>

            <select
                value={ticket.status}
                disabled={disabled}
                onChange={(event) =>
                    onStatusChange(ticket.id, event.target.value)
                }
            >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
            </select>
        </div>
    );
}

export default TicketActions;