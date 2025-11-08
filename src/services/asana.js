// src/services/asana.js

const axios = require('axios');

exports.hitEndpoint = async () => {
  try {
    // Calculate due date = 24 hours from now
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 1); // adds 1 day
    const formattedDueDate = dueDate.toISOString().split('T')[0]; // e.g. "2025-11-06"

    const payload = {
      workspaceGid: '1211619414571291',
      projectsGid: ['1211849017096142'],
      name: 'FM Labs – API Task (Auto)',
      notes: 'Created via backend automatically',
      assignee: '1211619460623883',
      due_on: formattedDueDate,
    };

    const resp = await axios.post(
      'https://ryu.futuremultiverse.com/asana/api/tasks/direct',
      payload
      // {
      //   headers: { Authorization: `Bearer ${process.env.ASANA_TOKEN}` }
      // }
    );

    console.log('✅ Task in Asana created successfully');
    return resp.data;

  } catch (err) {
    console.error('❌ Asana hit error:', err.response?.data || err.message);
    return null;
  }
};
