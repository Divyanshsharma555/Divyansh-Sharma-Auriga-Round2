function LoadingState() {
    return (
        <div className="state-card">
            <div className="spinner"></div>
            <h3>Loading tickets</h3>
            <p>Fetching the latest helpdesk queue.</p>
        </div>
    );
}

export default LoadingState;