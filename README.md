# Ryu Widget Backend Project Folder Structure

```
TIDIO/
└──graceflow-
    ├── node_modules/
    ├── src/
    │   ├── docs/
    |   |   └── registration.md 
    │   │
    │   ├── routes/
    │   │   ├── tidioWebhook.js
    |   |   ├── me.js
    |   |   ├── register.js
    |   |   ├── history.js
    │   │   └── ui.js
    │   │
    │   ├── services/
    │   │   ├── asana.js
    │   │   ├── freshdesk.js
    │   │   ├── ghl.js
    │   │   ├── graceai.js
    |   |   ├── openapi.js
    |   |   ├── ryuChat.js
    │   │   └── tidio.js
    │   │
    │   └── tests/
    │   |    ├── integration/
    |   |    └── unit/
    │   |   
    │   |   
    |   |
    │   ├── config.js
    |   ├── db.js
    │   └── index.js
    │
    ├── .env
    ├── .example.env
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
