# Engineering Reasoning

## 1. Problem Understanding

The application is a two-person IT helpdesk ticket queue. Tickets need to be processed according to their priority and response deadline.

The system must support:

- Creating support tickets
- Viewing tickets in queue order
- Searching customers
- Filtering tickets
- Assigning tickets to support agents
- Updating ticket status
- Identifying overdue tickets
- Paginating large ticket lists
- Automatically escalating overdue tickets

The backend is responsible for queue ordering, deadline calculation, persistence, and escalation logic. The frontend is responsible for displaying and interacting with the queue.

---

## 2. Requirements Derived from the Statement

The implementation derives the following requirements:

- Tickets have urgent and normal priority requirements in the original problem.
- The assessment twist introduces a `high` priority between urgent and normal.
- Urgent tickets have a 2-hour response window.
- High-priority tickets have a 12-hour response window.
- Normal tickets have a 24-hour response window.
- Overdue tickets must move ahead in the queue.
- Higher priority tickets are processed first within the same overdue state.
- Tickets can be searched by customer name.
- Tickets can be filtered by priority, status, assignee, and overdue state.
- Tickets can be assigned to one of the available agents.
- Ticket status can be changed between open, in_progress, and resolved.
- Resolved tickets are excluded from the default active queue.
- Large queues use server-side pagination.
- Overdue non-resolved tickets are automatically escalated.

---

## 3. Technology Choice

### Frontend

React with Vite was used because the assessment requires an interactive queue interface and React provides component-based UI development with minimal setup.

Native browser `fetch` is used for API communication.

No additional state-management, routing, or UI libraries were added.

### Backend

Node.js with Express was used to implement the REST API.

Express provides simple routing and middleware for the ticket operations.

### Database

SQLite with `better-sqlite3` was selected because the application requires persistent relational ticket data without the overhead of a separate database server.

---

## 4. Architecture

The application follows a client-server architecture.

```text
React/Vite Frontend
        |
        | REST API
        v
Express Backend
        |
        v
SQLite Database