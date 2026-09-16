# Auriga IT Helpdesk Queue

## Project Overview

Auriga IT Helpdesk Queue is a two-person IT helpdesk application designed to manage and prioritize customer support tickets.

The application provides a React-based frontend, an Express REST API, and a SQLite database. Tickets are automatically ordered based on their overdue state, priority, response deadline, creation time, and ticket ID.

The implementation also includes the assessment twist: an additional `High` priority with automatic escalation of overdue active tickets.

## Features

### Ticket Management

- Create support tickets
- View tickets in the active queue
- Display customer name, title, description, priority, status, assignee, and response deadline
- Update ticket status
- Assign tickets to support agents
- Retrieve individual tickets

### Queue Management

- Overdue tickets are moved to the front of the queue
- Priority is considered within the overdue and non-overdue groups
- Urgent tickets have the highest priority
- High tickets are prioritized above normal tickets
- Earlier response deadlines are processed first
- Earlier-created tickets are used as a tie-breaker
- Ticket ID provides a final deterministic tie-breaker
- Resolved tickets are excluded from the default active queue

### Search and Filtering

- Search by customer name
- Filter by priority
- Filter by status
- Filter by assignee
- Filter by overdue state
- Combine multiple filters

### Assignment

The frontend currently provides two support agents:

- Divyansh
- Agent 2

Tickets can also remain unassigned.

### Status Management

Supported ticket statuses:

- Open
- In Progress
- Resolved

Resolved tickets are removed from the default active queue.

### Pagination

- Server-side pagination
- Page and limit parameters
- Total ticket count
- Total page count
- Previous and next page navigation
- Display of the current ticket range

### Automatic Escalation

Overdue active tickets are automatically escalated through:

```text
Normal → High → Urgent