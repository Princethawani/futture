require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const tidioWebhook = require('./routes/tidioWebhook');
const uiRoutes = require('./routes/ui');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// Set up static + view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.post('/webhooks/tidio', tidioWebhook.handle);
app.use('/', uiRoutes);

// Health check
app.get('/health', (_, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`GraceFlow running on http://localhost:${PORT}`));
