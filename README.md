# TIDIO Project Folder Structure

```
TIDIO/
└──graceflow-
    ├── node_modules/
    ├── src/
    │   ├── public/
    │   │
    │   ├── routes/
    │   │   ├── tidioWebhook.js
    │   │   └── ui.js
    │   │
    │   ├── services/
    │   │   ├── asana.js
    │   │   ├── freshdesk.js
    │   │   ├── ghl.js
    │   │   ├── graceai.js
    │   │   └── tidio.js
    │   │
    │   └── views/
    │   |    ├── dashboard.ejs
    │   |    ├── layout.ejs
    │   |    └── test-chat.ejs
    |   |
    │   ├── config.js
    │   └── index.js
    │
    ├── .env
    ├── package-lock.json
    └── package.json
    └── README.md

```
## Build & Run

```bash
# Install dependencies
yarn install

# Run in development mode
node src/index.js

Development & Demo - http://localhost:9000

# Run tests
 npm test: