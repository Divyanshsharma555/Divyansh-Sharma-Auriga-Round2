# Chatgpt
Full Chat Of Chatgpt is:-

Today 2:57 PM
I am taking the Auriga IT Round 2 Builder assessment.

I have 150 minutes.

Problem statement:

"The helpdesk is drowning.

Priya runs a two-person IT helpdesk and the queue never stops. Some tickets are ‘my laptop won’t boot before a client demo’ emergencies; others are ‘can I get a bigger monitor.’ Each ticket has a priority and an agreed response time — urgent within 2 hours, normal within a day — and Priya wants to always pick the most pressing ticket next, with anything past its promised time jumping to the front. She’s forever answering ‘what’s overdue?’ and ‘what’s assigned to me?’, and looking up a specific customer’s ticket by name. The list is huge, so she pages through it.

Build Priya something so the right ticket is always on top.

(The way Priya talks about her queue tells you what it needs — the ordering rule is the heart of it. Build it for any helpdesk, not just Priya’s. Get tickets and the queue order right first, then filters and assignment.)"

Before writing any code, analyze the problem and derive:

1. Functional requirements
2. Ticket data model
3. Queue ordering rule
4. Overdue calculation
5. Required API operations
6. Search/filter requirements
7. Assignment requirements
8. Pagination requirements
9. Important edge cases
10. A simple architecture suitable for completing this in 150 minutes

Use a simple React + Vite + Node.js + Express + SQLite REST API architecture.

Do not modify files yet.
Do not generate implementation code yet.
Do not add unnecessary features or dependencies.

Yes. Do not start coding yet. For a 150-minute Builder assessment, the biggest risk is overbuilding. The statement is deliberately telling you what matters: the queue ordering logic is the core, then filters/search/assignment/pagination.

Below is the implementation plan I would derive before touching any file.

1. Functional Requirements
Core requirements — highest priority

The system must allow a helpdesk to:

Create tickets
View tickets in the correct queue order
Automatically identify overdue tickets
Ensure overdue tickets jump to the front
Prioritize tickets within overdue/non-overdue groups
Search tickets by customer name
Filter tickets by relevant properties
Assign tickets to a helpdesk agent
View tickets assigned to a particular agent
Paginate large ticket lists

The statement specifically emphasizes:

"Get tickets and the queue order right first, then filters and assignment."

So your development priority should be:

Data → Queue ordering → API → UI → Filters/Search → Assignment → Pagination → polish

2. Ticket Data Model

Keep the model small.

A ticket should contain approximately:

Field	Type	Purpose
id	INTEGER	Unique ticket ID
customerName	TEXT	Customer lookup/search
title	TEXT	Short ticket description
description	TEXT	Detailed issue
priority	TEXT	urgent / normal
responseDueAt	DATETIME	Agreed response deadline
status	TEXT	open, in_progress, resolved
assignedTo	TEXT/NULL	Helpdesk agent
createdAt	DATETIME	Creation timestamp
updatedAt	DATETIME	Last update
Example conceptual ticket
{
  id: 17,
  customerName: "Rahul Mehta",
  title: "Laptop won't boot",
  description: "...",
  priority: "urgent",
  responseDueAt: "2026-09-16 15:30:00",
  status: "open",
  assignedTo: "Priya",
  createdAt: "...",
  updatedAt: "..."
}
Important design decision

I would store responseDueAt rather than calculating the deadline every time.

For example:

Urgent → response due within 2 hours
Normal → response due within 24 hours

The actual due timestamp becomes part of the ticket's data.

That makes overdue detection simple and, more importantly, preserves the original agreed deadline.

3. Queue Ordering Rule

This is the heart of the assessment.

The wording:

"Priya wants to always pick the most pressing ticket next, with anything past its promised time jumping to the front."

means the queue needs a deterministic ordering.

I would define it explicitly as:

Level 1 — Overdue first
OVERDUE
    ↓
NOT OVERDUE

Any ticket whose responseDueAt is before the current time should move ahead of tickets that are still within their response window.

Level 2 — Priority

Within each group:

URGENT
    ↓
NORMAL
Level 3 — Deadline

For tickets having the same overdue/priority category:

earliest responseDueAt
    ↓
later responseDueAt
Level 4 — Stable tie-breaker

If everything else is equal:

earliest createdAt

or alternatively ID ascending.

Final conceptual ordering

Think of every ticket as having:

(overdue status, priority, response deadline, creation time)

And order by:

overdue DESC
priority DESC
responseDueAt ASC
createdAt ASC

where:

overdue = responseDueAt < current time

and:

urgent > normal
Example

Suppose current time is 4 PM:

Ticket	Priority	Due	Overdue?
A	normal	2 PM	YES
B	urgent	5 PM	NO
C	urgent	3 PM	YES
D	normal	6 PM	NO
E	urgent	4:30 PM	NO

Queue:

C   overdue + urgent
A   overdue + normal
E   not overdue + urgent
B   not overdue + urgent
D   not overdue + normal

Notice something important:

An overdue normal ticket comes before a non-overdue urgent ticket.

That's directly implied by:

"anything past its promised time jumping to the front."

This is an important point to get right.

4. Overdue Calculation

Overdue should not be stored permanently as a boolean.

Instead:

overdue = responseDueAt < currentTime

This is dynamic.

For example:

Due:       3:00 PM
Current:   2:59 PM
→ Not overdue

One minute later:

Due:       3:00 PM
Current:   3:01 PM
→ Overdue

Therefore, storing:

overdue = true

would become stale.

Better approach

Calculate overdue when retrieving the queue.

Conceptually:

responseDueAt < NOW()

The API can also return:

isOverdue: true

to make the frontend easy to build.

What about resolved tickets?

A resolved ticket should normally not appear in the active helpdesk queue.

So the queue should primarily operate on:

status != resolved

This is another reason to keep status in the model.

5. Required API Operations

Keep the REST API small.

You don't need a huge API.

Tickets
GET tickets
GET /api/tickets

This is the most important endpoint.

It should support:

queue ordering
pagination
search
filters
assignment filtering

For example:

GET /api/tickets?page=1&limit=10
GET single ticket
GET /api/tickets/:id

Useful for viewing a specific ticket.

POST ticket
POST /api/tickets

Creates a new ticket.

PATCH ticket
PATCH /api/tickets/:id

Use this for things such as:

status changes
assignment
priority changes

You don't need separate endpoints for every field.

DELETE ticket

This is optional, and I wouldn't prioritize it unless the assessment explicitly requires deletion.

For a helpdesk system, changing status to resolved is generally more meaningful than deleting historical tickets.

6. Search / Filter Requirements

The statement explicitly tells you:

"looking up a specific customer’s ticket by name."

Therefore customer search is required.

Search

Support something like:

GET /api/tickets?search=rahul

Search:

customerName

Potentially also:

title

But customer name is the explicitly required one.

Don't spend assessment time implementing fuzzy search, full-text search, Elasticsearch, etc.

SQLite LIKE is enough.

Useful filters

Based on the problem statement, I'd implement:

Priority
?priority=urgent

or:

?priority=normal
Status
?status=open
Assignment
?assignedTo=Priya
Overdue
?overdue=true
Combined filters

For example:

/api/tickets?priority=urgent&status=open&assignedTo=Priya

The backend should combine them.

7. Assignment Requirements

The statement says:

"what’s assigned to me?"

So assignment is definitely important.

Each ticket should have:

assignedTo

which can be:

NULL

if unassigned.

Possible values:

Priya
Amit
Neha

You don't need a full authentication/authorization system for this assessment unless explicitly requested.

Assignment API

You can use:

PATCH /api/tickets/:id

with:

assignedTo: "Priya"

Then the UI can provide:

Assign to:
[ Unassigned ▼ ]
[ Priya ]
[ Amit ]

And:

My Tickets

can simply filter:

assignedTo=Priya
8. Pagination Requirements

The statement explicitly says:

"The list is huge, so she pages through it."

Therefore pagination should happen on the backend, not by downloading everything to React.

Use:

page
limit

For example:

GET /api/tickets?page=1&limit=10

Response conceptually:

{
  data: [...],
  pagination: {
    page: 1,
    limit: 10,
    total: 57,
    totalPages: 6
  }
}

The frontend then displays:

← Previous    Page 1 of 6    Next →
Important

Ordering must happen before pagination.

Correct:

Filter
  ↓
Calculate/order queue
  ↓
LIMIT/OFFSET
  ↓
Return page

Incorrect:

LIMIT/OFFSET
  ↓
Sort each page

The second approach can produce a globally incorrect queue.

9. Important Edge Cases

This is where you can demonstrate engineering thinking.

Edge case 1 — Ticket becomes overdue while UI is open

Suppose:

Due: 3:00 PM

User opens the dashboard at:

2:59 PM

Then at:

3:01 PM

the ticket should be overdue.

Therefore the frontend shouldn't permanently assume the initial isOverdue value.

A refresh/re-fetch should recalculate it.

For a 150-minute assessment, don't build WebSockets just for this.

Edge case 2 — Exactly at deadline

Define the rule clearly.

I recommend:

responseDueAt < currentTime

means overdue.

At exactly:

responseDueAt == currentTime

it is not overdue yet.

Immediately after:

responseDueAt < currentTime

it becomes overdue.

The exact convention matters more than which reasonable convention you choose.

Edge case 3 — Overdue normal vs urgent non-overdue

This is probably the most important queue edge case.

Example:

Normal → overdue
Urgent → due tomorrow

The overdue normal ticket should appear first if the rule is:

overdue tickets jump to the front.

Edge case 4 — Resolved overdue ticket

A resolved ticket may technically have a deadline in the past.

It shouldn't continually occupy the active queue.

So:

status = resolved

→ excluded from active queue.

Edge case 5 — Unassigned ticket

assignedTo should allow:

NULL

Don't force every ticket to have an agent.

Edge case 6 — Invalid priority

Only allow:

urgent
normal

Don't let arbitrary values such as:

superurgent
critical123
abc

enter the database.

Edge case 7 — Missing customer name

Customer name should be required because customer lookup is one of the explicit use cases.

Edge case 8 — Invalid due date

Don't allow:

responseDueAt = invalid date

The API should validate incoming ticket data.

Edge case 9 — Empty search
?search=

should behave like no search rather than causing an error.

Edge case 10 — Page beyond last page

For example:

?page=999

Return:

data: []

with correct pagination metadata rather than crashing.

Edge case 11 — Combining filters

A request like:

search=rahul
priority=urgent
overdue=true
assignedTo=Priya

should work together.

Edge case 12 — Same deadline

If two tickets have the same:

overdue
priority
responseDueAt

you need a deterministic tie-breaker:

createdAt ASC

This prevents tickets from randomly moving around between requests.

10. Simple Architecture for 150 Minutes

Do not build microservices.

Do not build authentication.

Do not add Redux unless genuinely necessary.

Do not add a fancy UI framework unless already provided.

A simple architecture is enough.

                    ┌─────────────────────┐
                    │      React + Vite   │
                    │                     │
                    │ Dashboard           │
                    │ Ticket List         │
                    │ Search / Filters    │
                    │ Assignment          │
                    │ Pagination          │
                    └──────────┬──────────┘
                               │
                         REST / JSON
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Node.js + Express   │
                    │                     │
                    │ Routes              │
                    │ Controllers         │
                    │ Queue Logic         │
                    │ Validation          │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │       SQLite        │
                    │                     │
                    │ tickets             │
                    └─────────────────────┘
Recommended Folder Structure

Keep it simple:

project/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── TicketList
│   │   │   ├── TicketCard
│   │   │   ├── Filters
│   │   │   ├── Pagination
│   │   │   └── TicketForm
│   │   │
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   └── package.json
│
├── server/
│   ├── routes/
│   │   └── tickets.js
│   │
│   ├── controllers/
│   │   └── ticketController.js
│   │
│   ├── db/
│   │   ├── database.js
│   │   └── schema.sql
│   │
│   ├── utils/
│   │   └── queue.js
│   │
│   ├── seed.js
│   ├── server.js
│   └── package.json
│
├── README.md
├── reasoning.md
└── ai logs.md

Given your assessment's expected documentation, I'd specifically keep the queue algorithm isolated in utils/queue.js or an equivalent service. That makes the central reasoning easy to explain and test.

Most Important Backend Logic

The architecture should make this separation clear:

Request
   ↓
Parse search/filter/pagination
   ↓
Query active tickets
   ↓
Determine overdue
   ↓
Apply queue ordering
   ↓
Paginate
   ↓
Return JSON

But there is one important implementation detail:

Prefer doing ordering in SQLite

Instead of loading thousands of tickets into Node and sorting them, let SQLite perform:

ORDER BY
    overdue DESC,
    priority DESC,
    responseDueAt ASC,
    createdAt ASC

The exact SQL expression for overdue can be derived from the current timestamp.

That is more scalable and demonstrates better backend thinking.

Suggested API Contract

You can keep the entire application around these operations:

Operation	Endpoint	Purpose
List	GET /api/tickets	Queue + filters + search + pagination
Get	GET /api/tickets/:id	Ticket details
Create	POST /api/tickets	Create ticket
Update	PATCH /api/tickets/:id	Assignment/status/priority
Health	GET /api/health	Verify server

That's enough.

What the Main Dashboard Should Show

Don't overcomplicate the frontend.

Something like:

┌─────────────────────────────────────────────────────┐
│ Helpdesk Queue                                      │
│                                                     │
│ Search customer: [ Rahul             ]             │
│                                                     │
│ Priority [All ▼] Status [All ▼] Assignment [All ▼] │
│                                                     │
├─────────────────────────────────────────────────────┤
│ 🔴 OVERDUE   URGENT                                 │
│ Laptop won't boot                                   │
│ Rahul Mehta                                         │
│ Due: 2:15 PM     Assigned: Priya                    │
├─────────────────────────────────────────────────────┤
│ 🔴 OVERDUE   NORMAL                                 │
│ Monitor request                                     │
│ Ankit Sharma                                        │
│ Due: 1:00 PM     Assigned: Unassigned               │
├─────────────────────────────────────────────────────┤
│ 🟡 URGENT                                           │
│ VPN unavailable                                     │
│ Neha Gupta                                          │
│ Due: 5:00 PM     Assigned: Amit                     │
└─────────────────────────────────────────────────────┘

              ←  Previous   1 / 6   Next →

The UI should make the queue rule visually obvious.

150-Minute Execution Plan

This is where I'd be strict.

0–15 min — Understand + setup
Initialize Vite React client
Initialize Express server
SQLite setup
Create basic project structure
Create documentation files if required
15–40 min — Database + API foundation

Build:

SQLite schema
database connection
ticket creation
ticket retrieval
seed data

Do not touch UI heavily yet.

40–65 min — Queue logic

This deserves the most attention.

Implement and verify:

overdue first
    ↓
urgent first
    ↓
earliest deadline
    ↓
stable tie-breaker

Test with deliberately conflicting tickets.

For example:

Overdue normal
Non-overdue urgent

and verify the overdue one comes first.

65–90 min — Complete ticket API

Add:

search
priority filter
status filter
assignment filter
overdue filter
pagination
PATCH/update

At this point your backend should essentially be complete.

90–120 min — React UI

Build only:

Dashboard
Ticket list
Search
Filters
Assignment control
Pagination
Create ticket form/modal

Don't spend 30 minutes making animations.

120–135 min — Integration + edge cases

Test:

overdue ordering
urgent vs normal
assignment
search
pagination
status updates
empty results
invalid input
page boundaries
135–145 min — Polish

Add:

clear overdue indicator
loading state
error state
empty state
responsive spacing
readable typography
145–150 min — Final verification

Run:

npm run ...

Verify:

frontend starts
backend starts
database works
APIs work
queue is correct
README exists
reasoning exists
AI log exists
Git status is clean enough
commit/push
What NOT to Build

For this assessment, these are distractions unless the specification later explicitly asks for them:

❌ Authentication/JWT
❌ Role-based authorization
❌ WebSockets
❌ Redis
❌ MongoDB
❌ PostgreSQL
❌ Docker
❌ Redux
❌ Tailwind setup if it costs time
❌ Email notifications
❌ SMS
❌ AI ticket classification
❌ Chatbot
❌ Analytics dashboard
❌ Complex user management
❌ Microservices
❌ Elasticsearch
❌ Drag-and-drop Kanban
❌ Dark/light theme system

The assessment is testing whether you can identify and implement the actual operational requirement, not whether you can attach every technology you've learned.

The Core Reasoning You Should Put in reasoning.md

Your central design decision can essentially be summarized as:

The helpdesk queue is deadline-driven.

A ticket that has exceeded its promised response time
must take precedence over tickets that are still within
their response window.

Therefore queue ordering is:

1. Overdue tickets first
2. Higher priority next
3. Earliest response deadline
4. Creation time as a deterministic tie-breaker

Overdue status is derived dynamically from responseDueAt
and the current time rather than stored as persistent state.

Filtering and search are applied before pagination, while
queue ordering is applied before LIMIT/OFFSET so that each
page represents the correct global queue order.

That is the core of the assessment.

One subtle point I'd keep in mind: the phrase “most pressing ticket” could be interpreted as priority-first, but the next clause explicitly says “anything past its promised time jumping to the front.” So your design should make overdue status the first ordering dimension, rather than silently assuming urgent always beats an overdue normal ticket.

At this stage, I would not modify any files or write implementation code. The next step should be turning this into a very small implementation checklist and then setting up the backend/database in the exact order above.

this is the structure of folder
Pasted text(20260916-100254).txt
Document
Pasted text(20260916-100509).txt
Document
now backend is ready to execute or not and if not tell me reason and fix 

Yes. README.md should document the features too — but only the features that are actually implemented.

The README I gave you already has a Features section, but if you're asking whether you should include things like problem purpose, priority rules, twist, architecture, API, screenshots, testing, limitations, etc., then yes. A good assessment README should give the evaluator a quick understanding of the whole project.

For your Auriga assessment, the README structure should be:

README.md
│
├── Project Title
├── Project Overview
├── Features
├── Assessment Twist
├── Technology Stack
├── Project Structure
├── Prerequisites
├── Installation
├── Environment Setup
├── Database Setup
├── Running Backend
├── Running Frontend
├── API Endpoints
├── Queue Ordering Behavior
├── Screenshots
├── Testing
├── Debugging
└── Known Limitations
Your Features section should look like this
## Features

### Ticket Management

- Create new support tickets
- View tickets in the active helpdesk queue
- Display customer, title, description, priority, status, assignee, and response deadline
- Update ticket status
- Assign tickets to support agents

### Queue Management

- Automatically order tickets based on overdue state and priority
- Display overdue tickets at the front of the queue
- Prioritize urgent tickets over high and normal tickets within the same queue group
- Use response deadlines as a secondary ordering factor
- Exclude resolved tickets from the default active queue

### Search and Filtering

- Search tickets by customer name
- Filter by priority
- Filter by status
- Filter by assignee
- Filter by overdue status
- Combine multiple filters

### Pagination

- Server-side pagination
- Configurable page size through the API
- Display total ticket count
- Navigate between pages

### Automatic Escalation

- Detect overdue active tickets
- Escalate `Normal` tickets to `High`
- Escalate `High` tickets to `Urgent`
- Keep `Urgent` tickets at the highest priority
- Run escalation periodically from the backend

### User Interface

- Component-based React frontend
- Create Ticket modal
- Priority and status indicators
- Assignment controls
- Loading state
- Empty state
- Error state with retry
- Responsive layout
- Automatic queue refresh

And then immediately after that:

## Assessment Twist

The assessment introduces an additional `High` priority level and automatic escalation for overdue active tickets.

The priority progression is:

Normal → High → Urgent

Response deadlines are:

- Normal: 24 hours
- High: 12 hours
- Urgent: 2 hours

An overdue active ticket is escalated by one priority level when the backend escalation job runs.

Resolved tickets are not escalated.
One thing I would change from the previous README

Don't make the README unnecessarily long. README = evaluator's quick guide.

Your Reasoning.md is where the detailed engineering thinking belongs:

README.md
→ What the project is
→ What it does
→ How to run it
→ API
→ Screenshots
→ Testing
→ Limitations

Reasoning.md
→ Why you designed it this way
→ Queue algorithm
→ Data model
→ Complexity
→ Trade-offs
→ Edge cases
→ Engineering decisions

That's a much cleaner submission structure for your assessment.

final readme.md file pls
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

The escalation behavior is:

Normal → High
High   → Urgent
Urgent → Urgent

Resolved tickets are not escalated.

User Interface
Component-based React interface
Create Ticket modal
Priority badges
Status badges
Overdue indicators
Assignment controls
Status controls
Search and filter controls
Loading state
Empty state
Error state with retry
Responsive layout
Automatic queue refresh
Assessment Twist

The original helpdesk queue was extended with a third priority level, High, and automatic escalation.

Response deadlines are:

Priority	Response Deadline
Urgent	2 hours
High	12 hours
Normal	24 hours

When an active ticket becomes overdue, the backend escalation job increases its priority by one level.

Normal → High → Urgent

The escalation logic is implemented in:

server/jobs/escalation.js

The job runs when the backend starts and then periodically while the server is running.

Technology Stack
Frontend
React
Vite
JavaScript
CSS
Native Fetch API
Backend
Node.js
Express.js
CORS
better-sqlite3
Database
SQLite

No external frontend state-management, routing, HTTP client, or UI library is required.

Project Structure
Auriga-Round2/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── QueueSummary.jsx
│   │   │   ├── FilterBar.jsx
│   │   │   ├── TicketTable.jsx
│   │   │   ├── TicketRow.jsx
│   │   │   ├── PriorityBadge.jsx
│   │   │   ├── StatusBadge.jsx
│   │   │   ├── TicketActions.jsx
│   │   │   ├── Pagination.jsx
│   │   │   ├── CreateTicketModal.jsx
│   │   │   ├── LoadingState.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   └── ErrorState.jsx
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── controllers/
│   │   └── ticketController.js
│   ├── db/
│   │   ├── database.js
│   │   ├── schema.sql
│   │   └── helpdesk.db
│   ├── jobs/
│   │   └── escalation.js
│   ├── routes/
│   │   └── tickets.js
│   ├── utils/
│   │   └── queue.js
│   ├── seed.js
│   ├── server.js
│   └── package.json
│
├── screenshots/
├── README.md
├── Reasoning.md
└── AI logs.md

The SQLite database is generated locally and should not be committed to the repository.

Prerequisites

Install:

Node.js
npm
Git

The project was developed and tested using GitHub Codespaces.

Installation

Clone the repository:

git clone <repository-url>

Enter the project directory:

cd Auriga-Round2

Install backend dependencies:

cd server
npm install

Install frontend dependencies:

cd ../client
npm install
Environment Setup

No .env file is required for the current implementation.

The backend runs on port 5000 by default.

http://localhost:5000

The frontend uses /api for backend requests.

Vite proxies /api requests to the Express backend running on port 5000.

Database Setup

The application uses SQLite through better-sqlite3.

The database schema is located at:

server/db/schema.sql

The database is initialized automatically when the database module is loaded.

To initialize the database manually, enter the server directory:

cd server

Then run:

node -e "require('./db/database.js')"

To recreate the database during development:

rm -f db/helpdesk.db
node -e "require('./db/database.js')"
Running the Backend

From the project root:

cd Auriga-Round2/server

Run the development server:

npm run dev

Or run the application normally:

npm start

The backend runs on:

http://localhost:5000

Check the backend health:

curl http://localhost:5000/api/health

Expected response:

{
  "status": "ok"
}
Running the Frontend

Open another terminal.

From the project root:

cd Auriga-Round2/client

Run:

npm run dev

Vite will provide the frontend development URL.

The frontend communicates with the backend through:

/api

Vite proxies these requests to:

http://localhost:5000
API Endpoints
Health Check
GET /api/health

Returns the backend health status.

Get Tickets
GET /api/tickets

Supported query parameters:

page
limit
search
priority
status
assignee
overdue

Example:

GET /api/tickets?page=1&limit=10
Get Ticket
GET /api/tickets/:id

Returns a specific ticket.

Create Ticket
POST /api/tickets

Example request:

{
  "customerName": "Customer Name",
  "title": "Login problem",
  "description": "Unable to log in",
  "priority": "normal",
  "assignee": "Divyansh"
}

Supported priorities:

urgent
high
normal
Update Ticket
PATCH /api/tickets/:id

Can update supported ticket fields including:

Customer name
Title
Description
Priority
Status
Assignee
Assign Ticket
PATCH /api/tickets/:id/assign

Example:

{
  "assignee": "Divyansh"
}

An assignee can also be set to null.

Update Status
PATCH /api/tickets/:id/status

Example:

{
  "status": "in_progress"
}

Supported statuses:

open
in_progress
resolved
Queue Ordering Behavior

The queue is ordered by the backend.

The ordering rules are:

Overdue tickets appear first.
Priority is considered within the overdue/non-overdue groups.
Urgent has the highest priority.
High has the second-highest priority.
Normal has the lowest priority.
Earlier response deadlines appear first.
Earlier creation times appear first.
Ticket ID is used as the final tie-breaker.

Priority ranking:

Urgent = 3
High   = 2
Normal = 1

Overdue status is calculated dynamically from:

response_due_at < current time

Resolved tickets are excluded from the default active queue.

Screenshots

Screenshots demonstrating the implemented application are stored in the screenshots directory.

Helpdesk Queue

Create Ticket

Search and Filters

Assignment and Status

Automatic Escalation

Testing

The application was tested through both the REST API and the frontend.

Tested functionality includes:

Backend health check
Ticket creation
Normal priority tickets
High priority tickets
Urgent priority tickets
Response deadline calculation
Overdue detection
Queue ordering
Automatic escalation
Ticket assignment
Status updates
Resolved ticket behavior
Customer search
Priority filtering
Status filtering
Assignee filtering
Overdue filtering
Pagination
Frontend/backend communication
Loading state
Empty state
API error handling
Backend Health Test
curl http://localhost:5000/api/health
Ticket Queue Test
curl "http://localhost:5000/api/tickets?limit=10"
Debugging Instructions
Failed to Fetch

Make sure the backend is running:

cd Auriga-Round2/server
npm run dev

Then test:

curl http://localhost:5000/api/health

If the health endpoint does not respond with:

{
  "status": "ok"
}

the backend is not running correctly.

Database Issues

From the server directory:

rm -f db/helpdesk.db
node -e "require('./db/database.js')"

Restart the backend after recreating the database.

Frontend API Errors

Check client/vite.config.js and verify that the /api proxy points to:

http://localhost:5000

Restart the Vite development server after changing the configuration.

Backend Dependency Issues

From the server directory:

npm install

Then:

npm run dev
Frontend Dependency Issues

From the client directory:

npm install

Then:

npm run dev
Known Limitations
The application currently has two predefined agents: Divyansh and Agent 2.
There is no authentication or authorization system.
There is no agent management interface.
SQLite is used for the assessment and is not configured as a distributed production database.
Pagination uses LIMIT/OFFSET.
The frontend refreshes the queue periodically instead of using WebSockets.
Automatic escalation occurs when the backend escalation job runs.
The summary counts for overdue, urgent, and high-priority tickets are based on the currently displayed page, while the Active Tickets count uses the backend pagination total.

### Screenshot files you should add

Your final project should contain:

```text
screenshots/
├── helpdesk-queue.png
├── create-ticket.png
├── search-filters.png
├── assignment-status.png
└── automatic-escalation.png

Then from the repository root:

cd /workspaces/Divyansh-Sharma-Auriga-Round2
git add Auriga-Round2/README.md Auriga-Round2/screenshots
git commit -m "Add final project documentation and screenshots"
git push origin main

One correction to be aware of: if your actual component structure or screenshot filenames differ from the structure above, change those names in the README to match your repository exactly before the final push.