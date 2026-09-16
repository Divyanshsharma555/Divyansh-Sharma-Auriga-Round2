function ErrorState({ message, onRetry }) {
    return (
        <div className="error-state">
            <div>
                <strong>Unable to load the queue</strong>
                <p>{message}</p>
            </div>

            <button className="secondary-button" onClick={onRetry}>
                Retry
            </button>
        </div>
    );
}

export default ErrorState;