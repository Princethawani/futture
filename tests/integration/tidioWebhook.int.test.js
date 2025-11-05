// tests/integration/tidioWebhook.int.test.js

require('dotenv').config();
const request = require('supertest');
const express = require('express');

// Import your route handler directly
const tidioWebhook = require('../../src/routes/tidioWebhook');

// Mock the external OpenAI API service (corrected path)
jest.mock('../../src/services/openapi', () => ({
  ask: jest.fn(async ({ question, user }) => ({
    answer: `Mocked response for question: ${question}`,
  })),
}));

const openapi = require('../../src/services/openapi');

describe('Tidio Webhook Integration', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.post('/webhooks/tidio', tidioWebhook.handle);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 if conversationId or messageText is missing', async () => {
    const res = await request(app)
      .post('/webhooks/tidio')
      .send({ message: { text: '' } });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', 'missing conversationId or messageText');
  });

  it('should call OpenAI and return mocked answer', async () => {
    const payload = {
      conversationId: 'abc123',
      message: { text: 'Hello GraceAI' },
      contact: { email: 'test@example.com', name: 'Tester' },
    };

    const res = await request(app)
      .post('/webhooks/tidio')
      .send(payload);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'logged');
    expect(res.body).toHaveProperty('answer');
    expect(res.body.answer).toContain('Mocked response for question');
    expect(openapi.ask).toHaveBeenCalledWith({
      question: 'Hello GraceAI',
      user: { email: 'test@example.com', name: 'Tester' },
    });
  });

  it('should handle internal server errors gracefully', async () => {
    // Force openapi.ask to throw
    openapi.ask.mockImplementationOnce(() => {
      throw new Error('Simulated failure');
    });

    const payload = {
      conversationId: 'xyz789',
      message: { text: 'This should fail' },
    };

    const res = await request(app)
      .post('/webhooks/tidio')
      .send(payload);

    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error', 'internal_error');
  });
});
