function Header({ onCreateTicket }) {
    return (
        <header className="topbar">
            <div className="brand">
                <div className="brand-icon">H</div>

                <div>
                    <p className="eyebrow">HELPDESK</p>
                    <h1>Support Queue</h1>
                </div>
            </div>

            <button className="primary-button" onClick={onCreateTicket}>
                + Create Ticket
            </button>
        </header>
    );
}

export default Header;