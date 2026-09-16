import TicketRow from './TicketRow';

function TicketTable({
    tickets,
    assignees,
    actionLoading,
    onAssign,
    onStatusChange
}) {
    return (
        <section className="ticket-list">
            <div className="table-header">
                <span>Ticket</span>
                <span>Customer</span>
                <span>Priority</span>
                <span>Status</span>
                <span>Assignee</span>
                <span>Response Due</span>
                <span>Actions</span>
            </div>

            {tickets.map((ticket) => (
                <TicketRow
                    key={ticket.id}
                    ticket={ticket}
                    assignees={assignees}
                    actionLoading={actionLoading}
                    onAssign={onAssign}
                    onStatusChange={onStatusChange}
                />
            ))}
        </section>
    );
}

export default TicketTable;