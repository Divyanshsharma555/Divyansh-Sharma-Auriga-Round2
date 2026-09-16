function StatusBadge({ status }) {
    return (
        <span className={`status status-${status}`}>
            {status.replace('_', ' ')}
        </span>
    );
}

export default StatusBadge;