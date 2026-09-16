function PriorityBadge({ priority }) {
    return (
        <span className={`priority priority-${priority}`}>
            <span className="priority-dot"></span>
            {priority}
        </span>
    );
}

export default PriorityBadge;