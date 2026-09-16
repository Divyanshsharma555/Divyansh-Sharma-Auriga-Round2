const escalationJob = require('./jobs/escalation');
const express = require('express');
const cors = require('cors');
const ticketsRouter = require('./routes/tickets');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.use('/api/tickets', ticketsRouter);

app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

app.use((error, req, res, next) => {
    console.error(error);

    res.status(error.status || 500).json({
        error: error.status ? error.message : 'Internal server error'
    });
});
escalationJob();

setInterval(escalationJob, 60000);
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});