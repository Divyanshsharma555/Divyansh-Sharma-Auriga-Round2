function Pagination({ pagination, onPageChange }) {
    const start =
        pagination.total === 0
            ? 0
            : (pagination.page - 1) * pagination.limit + 1;

    const end = Math.min(
        pagination.page * pagination.limit,
        pagination.total
    );

    return (
        <div className="pagination">
            <span className="pagination-info">
                Showing {start}–{end} of {pagination.total} tickets
            </span>

            <div className="pagination-controls">
                <button
                    className="secondary-button"
                    disabled={pagination.page <= 1}
                    onClick={() => onPageChange(pagination.page - 1)}
                >
                    ← Previous
                </button>

                <span>
                    Page {pagination.page} of {pagination.totalPages || 1}
                </span>

                <button
                    className="secondary-button"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => onPageChange(pagination.page + 1)}
                >
                    Next →
                </button>
            </div>
        </div>
    );
}

export default Pagination;