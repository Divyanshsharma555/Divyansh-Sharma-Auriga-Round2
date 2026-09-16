function CreateTicketModal({
    form,
    onChange,
    onSubmit,
    onClose,
    actionLoading,
    assignees
}) {
    return (
        <div className="modal-backdrop">
            <div className="modal">
                <div className="modal-header">
                    <div>
                        <p className="eyebrow">NEW REQUEST</p>
                        <h2>Create Ticket</h2>
                    </div>

                    <button
                        className="close-button"
                        onClick={onClose}
                        type="button"
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={onSubmit}>
                    <label>
                        Customer name
                        <input
                            name="customerName"
                            value={form.customerName}
                            onChange={onChange}
                            placeholder="Enter customer name"
                            required
                        />
                    </label>

                    <label>
                        Ticket title
                        <input
                            name="title"
                            value={form.title}
                            onChange={onChange}
                            placeholder="Describe the issue"
                            required
                        />
                    </label>

                    <label>
                        Description
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={onChange}
                            placeholder="Add relevant details"
                            rows="4"
                        />
                    </label>

                    <label>
                        Priority
                        <select
                            name="priority"
                            value={form.priority}
                            onChange={onChange}
                        >
                            <option value="normal">Normal</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                        </select>
                    </label>

                    <label>
                        Assignee
                        <select
                            name="assignee"
                            value={form.assignee}
                            onChange={onChange}
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
                        {actionLoading ? 'Creating ticket...' : 'Create Ticket'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default CreateTicketModal;