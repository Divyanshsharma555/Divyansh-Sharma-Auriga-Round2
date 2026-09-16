import PriorityBadge from './PriorityBadge';
import StatusBadge from './StatusBadge';
import TicketActions from './TicketActions';

function TicketRow({
    ticket,
    assignees,
    actionLoading,
    onAssign,
    onStatusChange
}) {
    const formatDate = (value) =>
        new Date(value).toLocaleString([], {
            dateStyle: 'medium',
            timeStyle: 'short'
        });

    return (
        <article className={`ticket-row ${ticket.isOverdue ? 'overdue-row' : ''}`}>
            <div className="ticket-main">
                <span className="ticket-id">#{ticket.id}</span>
                <strong>{ticket.title}</strong>

                {ticket.description && (
                    <p>{ticket.description}</p>
                )}
            </div>

            <div className="customer-cell">
                <strong>{ticket.customerName}</strong>
            </div>

            <div>
                <PriorityBadge priority={ticket.priority} />

                {ticket.isOverdue && ticket.priority !== 'normal' && (
                    <span className="escalated-label">
                        Escalated
                    </span>
                )}
            </div>

            <div>
                <StatusBadge status={ticket.status} />
            </div>

            <div className="assignee-cell">
                <span>{ticket.assignee || 'Unassigned'}</span>
            </div>

            <div className={`due-time ${ticket.isOverdue ? 'overdue' : ''}`}>
                <strong>
                    {ticket.isOverdue ? 'OVERDUE' : 'Response due'}
                </strong>

                <small>{formatDate(ticket.responseDueAt)}</small>
            </div>

            <TicketActions
                ticket={ticket}
                assignees={assignees}
                disabled={actionLoading}
                onAssign={onAssign}
                onStatusChange={onStatusChange}
            />
        </article>
    );
}

export default TicketRow;