function FilterBar({ filters, onFilterChange, onClear }) {
    return (
        <section className="filter-panel">
            <div className="search-wrapper">
                <span>⌕</span>

                <input
                    type="text"
                    name="search"
                    placeholder="Search by customer name..."
                    value={filters.search}
                    onChange={onFilterChange}
                />
            </div>

            <select
                name="priority"
                value={filters.priority}
                onChange={onFilterChange}
            >
                <option value="">All priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="normal">Normal</option>
            </select>

            <select
                name="status"
                value={filters.status}
                onChange={onFilterChange}
            >
                <option value="">All statuses</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
            </select>

            <select
                name="assignee"
                value={filters.assignee}
                onChange={onFilterChange}
            >
                <option value="">All assignees</option>
                <option value="unassigned">Unassigned</option>
                <option value="Divyansh">Divyansh</option>
                <option value="Agent 2">Agent 2</option>
            </select>

            <select
                name="overdue"
                value={filters.overdue}
                onChange={onFilterChange}
            >
                <option value="">All tickets</option>
                <option value="true">Overdue</option>
                <option value="false">On time</option>
            </select>

            <button className="secondary-button" onClick={onClear}>
                Clear
            </button>
        </section>
    );
}

export default FilterBar;