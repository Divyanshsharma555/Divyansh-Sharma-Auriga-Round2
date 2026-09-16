function EmptyState() {
    return (
        <div className="state-card">
            <div className="state-icon">✓</div>
            <h3>No tickets found</h3>
            <p>Try changing your filters or create a new ticket.</p>
        </div>
    );
}

export default EmptyState;