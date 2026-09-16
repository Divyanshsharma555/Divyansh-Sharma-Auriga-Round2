import { useCallback, useEffect, useState } from 'react';
import './App.css';

const API_URL = '/api/tickets';

const priorities = ['urgent', 'high', 'normal'];
const statuses = ['open', 'in_progress', 'resolved'];
const assignees = ['Divyansh', 'Agent 2'];

const emptyForm = {
    customerName: '',
    title: '',
    description: '',
    priority: 'normal',
    assignee: ''
};

function App() {
    const [tickets, setTickets] = useState([]);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });
    const [filters, setFilters] = useState({
        search: '',
        priority: '',
        status: '',
        assignee: '',
        overdue: ''
    });
    const [form, setForm] = useState(emptyForm);
    const [showCreate, setShowCreate] = useState(false);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchTickets = useCallback(async (page = 1) => {
        setLoading(true);
        setError('');

        try {
            const params = new URLSearchParams({
                page: String(page),
                limit: '10'
            });

            Object.entries(filters).forEach(([key, value]) => {
                if (value) {
                    params.set(key, value);
                }
            });

            const response = await fetch(`${API_URL}?${params.toString()}`);

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to load tickets');
            }

            const data = await response.json();

            setTickets(data.data);
            setPagination(data.pagination);
        } catch (err) {
            setError(err.message || 'Unable to connect to the server');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchTickets(1);
    }, [fetchTickets]);

    useEffect(() => {
        const interval = setInterval(() => {
            fetchTickets(pagination.page);
        }, 60000);

        return () => clearInterval(interval);
    }, [fetchTickets, pagination.page]);

    const handleFilterChange = (event) => {
        const { name, value } = event.target;

        setFilters((current) => ({
            ...current,
            [name]: value
        }));
    };

    const clearFilters = () => {
        setFilters({
            search: '',
            priority: '',
            status: '',
            assignee: '',
            overdue: ''
        });
    };

    const handleFormChange = (event) => {
        const { name, value } = event.target;

        setForm((current) => ({
            ...current,
            [name]: value
        }));
    };

    const createTicket = async (event) => {
        event.preventDefault();
        setActionLoading(true);
        setError('');

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    customerName: form.customerName,
                    title: form.title,
                    description: form.description,
                    priority: form.priority,
                    assignee: form.assignee || null
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create ticket');
            }

            setForm(emptyForm);
            setShowCreate(false);
            await fetchTickets(1);
        } catch (err) {
            setError(err.message || 'Failed to create ticket');
        } finally {
            setActionLoading(false);
        }
    };

    const updateStatus = async (id, status) => {
        setActionLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_URL}/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update status');
            }

            await fetchTickets(pagination.page);
        } catch (err) {
            setError(err.message || 'Failed to update status');
        } finally {
            setActionLoading(false);
        }
    };

    const assignTicket = async (id, assignee) => {
        setActionLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_URL}/${id}/assign`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    assignee: assignee || null
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to assign ticket');
            }

            await fetchTickets(pagination.page);
        } catch (err) {
            setError(err.message || 'Failed to assign ticket');
        } finally {
            setActionLoading(false);
        }
    };

    const formatDate = (value) => {
        return new Date(value).toLocaleString([], {
            dateStyle: 'medium',
            timeStyle: 'short'
        });
    };

    const getPriorityClass = (priority) => {
        return `priority priority-${priority}`;
    };

    return (
        <div className="app">
            <header className="topbar">
                <div>
                    <p className="eyebrow">HELPDESK</p>
                    <h1>Ticket Queue</h1>
                    <p className="subtitle">
                        Manage customer requests, assignments and response deadlines.
                    </p>
                </div>

                <button className="primary-button" onClick={() => setShowCreate(true)}>
                    + Create Ticket
                </button>
            </header>

            <main className="content">
                <section className="queue-header">
                    <div>
                        <h2>Active Queue</h2>
                        <span>{pagination.total} tickets</span>
                    </div>

                    <div className="twist-info">
                        <strong>Automatic escalation</strong>
                        <span>Normal → High → Urgent</span>
                    </div>
                </section>

                <section className="filters">
                    <input
                        type="text"
                        name="search"
                        placeholder="Search customer..."
                        value={filters.search}
                        onChange={handleFilterChange}
                    />

                    <select name="priority" value={filters.priority} onChange={handleFilterChange}>
                        <option value="">All priorities</option>
                        {priorities.map((priority) => (
                            <option key={priority} value={priority}>
                                {priority}
                            </option>
                        ))}
                    </select>

                    <select name="status" value={filters.status} onChange={handleFilterChange}>
                        <option value="">All statuses</option>
                        {statuses.map((status) => (
                            <option key={status} value={status}>
                                {status.replace('_', ' ')}
                            </option>
                        ))}
                    </select>

                    <select name="assignee" value={filters.assignee} onChange={handleFilterChange}>
                        <option value="">All assignees</option>
                        <option value="unassigned">Unassigned</option>
                        {assignees.map((assignee) => (
                            <option key={assignee} value={assignee}>
                                {assignee}
                            </option>
                        ))}
                    </select>

                    <select name="overdue" value={filters.overdue} onChange={handleFilterChange}>
                        <option value="">All tickets</option>
                        <option value="true">Overdue</option>
                        <option value="false">Not overdue</option>
                    </select>

                    <button className="secondary-button" onClick={clearFilters}>
                        Clear
                    </button>
                </section>

                {error && (
                    <div className="error-state">
                        <strong>Error:</strong> {error}
                    </div>
                )}

                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading tickets...</p>
                    </div>
                ) : tickets.length === 0 ? (
                    <div className="empty-state">
                        <h3>No tickets found</h3>
                        <p>Try changing your filters or create a new ticket.</p>
                    </div>
                ) : (
                    <section className="ticket-list">
                        <div className="table-header">
                            <span>Ticket</span>
                            <span>Customer</span>
                            <span>Priority</span>
                            <span>Status</span>
                            <span>Assignee</span>
                            <span>Due time</span>
                            <span>Actions</span>
                        </div>

                        {tickets.map((ticket) => (
                            <article
                                className={`ticket-row ${ticket.isOverdue ? 'overdue-row' : ''}`}
                                key={ticket.id}
                            >
                                <div className="ticket-main">
                                    <span className="ticket-id">#{ticket.id}</span>
                                    <strong>{ticket.title}</strong>
                                    {ticket.description && (
                                        <p>{ticket.description}</p>
                                    )}
                                </div>

                                <div className="customer">
                                    {ticket.customerName}
                                </div>

                                <div>
                                    <span className={getPriorityClass(ticket.priority)}>
                                        {ticket.priority}
                                    </span>

                                    {ticket.priority !== 'normal' && ticket.isOverdue && (
                                        <span className="escalated-label">
                                            Escalated
                                        </span>
                                    )}
                                </div>

                                <div>
                                    <span className={`status status-${ticket.status}`}>
                                        {ticket.status.replace('_', ' ')}
                                    </span>
                                </div>

                                <div>
                                    <select
                                        className="inline-select"
                                        value={ticket.assignee || ''}
                                        disabled={actionLoading}
                                        onChange={(event) =>
                                            assignTicket(ticket.id, event.target.value)
                                        }
                                    >
                                        <option value="">Unassigned</option>
                                        {assignees.map((assignee) => (
                                            <option key={assignee} value={assignee}>
                                                {assignee}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className={`due-time ${ticket.isOverdue ? 'overdue' : ''}`}>
                                    <span>
                                        {ticket.isOverdue ? 'OVERDUE' : 'Due'}
                                    </span>
                                    <small>{formatDate(ticket.responseDueAt)}</small>
                                </div>

                                <div>
                                    <select
                                        className="inline-select"
                                        value={ticket.status}
                                        disabled={actionLoading}
                                        onChange={(event) =>
                                            updateStatus(ticket.id, event.target.value)
                                        }
                                    >
                                        {statuses.map((status) => (
                                            <option key={status} value={status}>
                                                {status.replace('_', ' ')}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </article>
                        ))}
                    </section>
                )}

                {!loading && pagination.totalPages > 1 && (
                    <div className="pagination">
                        <button
                            className="secondary-button"
                            disabled={pagination.page <= 1}
                            onClick={() => fetchTickets(pagination.page - 1)}
                        >
                            Previous
                        </button>

                        <span>
                            Page {pagination.page} of {pagination.totalPages}
                        </span>

                        <button
                            className="secondary-button"
                            disabled={pagination.page >= pagination.totalPages}
                            onClick={() => fetchTickets(pagination.page + 1)}
                        >
                            Next
                        </button>
                    </div>
                )}
            </main>

            {showCreate && (
                <div className="modal-backdrop">
                    <div className="modal">
                        <div className="modal-header">
                            <div>
                                <p className="eyebrow">NEW REQUEST</p>
                                <h2>Create Ticket</h2>
                            </div>

                            <button
                                className="close-button"
                                onClick={() => setShowCreate(false)}
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={createTicket}>
                            <label>
                                Customer name
                                <input
                                    name="customerName"
                                    value={form.customerName}
                                    onChange={handleFormChange}
                                    required
                                />
                            </label>

                            <label>
                                Ticket title
                                <input
                                    name="title"
                                    value={form.title}
                                    onChange={handleFormChange}
                                    required
                                />
                            </label>

                            <label>
                                Description
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleFormChange}
                                    rows="4"
                                />
                            </label>

                            <label>
                                Priority
                                <select
                                    name="priority"
                                    value={form.priority}
                                    onChange={handleFormChange}
                                >
                                    {priorities.map((priority) => (
                                        <option key={priority} value={priority}>
                                            {priority}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label>
                                Assignee
                                <select
                                    name="assignee"
                                    value={form.assignee}
                                    onChange={handleFormChange}
                                >
                                    <option value="">Unassigned</option>
                                    {assignees.map((assignee) => (
                                        <option key={assignee} value={assignee}>
                                            {assignee}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <button
                                className="primary-button full-width"
                                type="submit"
                                disabled={actionLoading}
                            >
                                {actionLoading ? 'Creating...' : 'Create Ticket'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;