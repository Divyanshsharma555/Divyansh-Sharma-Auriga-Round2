import { useCallback, useEffect, useState } from 'react';
import './App.css';

import Header from './components/Header';
import QueueSummary from './components/QueueSummary';
import FilterBar from './components/FilterBar';
import TicketTable from './components/TicketTable';
import Pagination from './components/Pagination';
import CreateTicketModal from './components/CreateTicketModal';
import LoadingState from './components/LoadingState';
import EmptyState from './components/EmptyState';
import ErrorState from './components/ErrorState';

const API_URL = '/api/tickets';

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

            const response = await fetch(`${API_URL}?${params}`);

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

    return (
        <div className="app">
            <Header onCreateTicket={() => setShowCreate(true)} />

            <main className="content">
                <section className="page-heading">
                    <div>
                        <p className="eyebrow">OPERATIONS</p>
                        <h2>Active Ticket Queue</h2>
                        <p>
                            Tickets are displayed according to the backend
                            response priority and overdue rules.
                        </p>
                    </div>

                    <div className="escalation-info">
                        <strong>Automatic escalation</strong>
                        <span>Overdue tickets escalate one level per check</span>
                        <b>Normal → High → Urgent</b>
                    </div>
                </section>

                <QueueSummary
                    tickets={tickets}
                    total={pagination.total}
                />

                <FilterBar
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onClear={clearFilters}
                />

                {error && (
                    <ErrorState
                        message={error}
                        onRetry={() => fetchTickets(pagination.page)}
                    />
                )}

                {loading ? (
                    <LoadingState />
                ) : tickets.length === 0 ? (
                    <EmptyState />
                ) : (
                    <TicketTable
                        tickets={tickets}
                        assignees={assignees}
                        actionLoading={actionLoading}
                        onAssign={assignTicket}
                        onStatusChange={updateStatus}
                    />
                )}

                {!loading && pagination.total > 0 && (
                    <Pagination
                        pagination={pagination}
                        onPageChange={fetchTickets}
                    />
                )}
            </main>

            {showCreate && (
                <CreateTicketModal
                    form={form}
                    onChange={handleFormChange}
                    onSubmit={createTicket}
                    onClose={() => setShowCreate(false)}
                    actionLoading={actionLoading}
                    assignees={assignees}
                />
            )}
        </div>
    );
}

export default App;