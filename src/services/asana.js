const axios = require('axios');
const ASANA_TOKEN = process.env.ASANA_TOKEN;
const PROJECT_ID = process.env.ASANA_PROJECT_ID;

exports.createTask = async ({ name, notes }) => {
  const url = 'https://app.asana.com/api/1.0/tasks';
  const resp = await axios.post(url, {
    data: {
      name,
      notes,
      projects: [PROJECT_ID]
    }
  }, {
    headers: { Authorization: `Bearer ${ASANA_TOKEN}`, 'Content-Type': 'application/json' }
  });
  return resp.data;
};
