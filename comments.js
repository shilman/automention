function isAutomention(body) {
  return body.startsWith('Automention: Hey @');
}

function parseAutomention(body) {
  if (!isAutomention(body)) {
    throw new Error(`Non-automention comment: ${body}`);
  }
  return body
    .split(' ')
    .filter(w => w.startsWith('@'))
    .map(w => w.trim().replace(/[@,]/g, ''));
}

function formatAutomention(users) {
  if (!users || !users.length) {
    throw new Error(`Empty users: ${users}`);
  }
  const userList = users.map(user => `@${user}`).join(' ');
  return `Automention: Hey ${userList}, you've been tagged! Can you give a hand here?`;
}

module.exports = {
  isAutomention,
  parseAutomention,
  formatAutomention
};
