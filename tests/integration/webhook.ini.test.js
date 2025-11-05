const request = require('supertest');
const express = require('express');

// Mock services
jest.mock('../src/services/openapi');
jest.mock('../src/services/freshdesk');

const openai = require('../src/services/openapi');
const freshdesk = require('../src/services/freshdesk');
const { handle } = require('../src/routes/Webhook');

const app = express();
app.use(express.json());
app.post('/webhook', handle);

describe('Webhook Integration Test', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return AI response when GraceAI can answer', async () => {
    openai.ask.mockResolvedValue({ answer: 'This is a confident AI answer.' });

    const payload = {
      conversationId: 'abc123',
      message: { text: 'What is Future Catalyst?' },
      contact: { email: 'user@example.com', name: 'Test User' },
    };

    const res = await request(app).post('/webhook').send(payload);

    expect(res.statusCode).toBe(200);
    expect(res.body.answer).toBe('This is a confident AI answer.');
    expect(freshdesk.createTicket).not.toHaveBeenCalled();
  });

  it('should create Freshdesk ticket when AI cannot answer', async () => {
    openai.ask.mockResolvedValue({
      answer: "Sorry — I'm not sure. I'll get help from the team.",
    });

    freshdesk.createTicket.mockResolvedValue({ id: 456 });

    const payload = {
      conversationId: 'xyz789',
      message: { text: 'Can I get help with billing?' },
      contact: { email: 'client@domain.com', name: 'Billing User' },
    };

    const res = await request(app).post('/webhook').send(payload);

    expect(res.statusCode).toBe(200);
    expect(res.body.answer).toContain("Sorry — I'm not sure");
    expect(freshdesk.createTicket).toHaveBeenCalledTimes(1);
    expect(freshdesk.createTicket).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'client@domain.com',
        subject: expect.stringContaining('Support needed from GraceAI'),
      })
    );
  });

  it('should handle missing messageText gracefully', async () => {
    const payload = { conversationId: 'no-message' };

    const res = await request(app).post('/webhook').send(payload);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('missing conversationId or messageText');
  });
});
