// tests/integration/freshdesk.ini.test.js

require('dotenv').config();
const request = require('supertest');
const express = require('express');

// Import your route handler directly
const freshdeskWebhook = require('../../src/routes/freshdeskWebhook');

// Mock the external Frshdesk API service
jest.mock('../../src/services/freshdesk.js', () => {
    
});