function usersToNotify({ matchingUsers, fullIssue, issueComments }) {
  if (
    fullIssue.state === 'closed' ||
    fullIssue.assignees.length > 0 ||
    fullIssue.draft
  ) {
    return [];
  }

  const skipUsers = new Set(issueComments.map(c => c.user.login));
  skipUsers.add(fullIssue.user.login);
  const uniqueUsers = new Set(matchingUsers.filter(u => !skipUsers.has(u)));
  return Array.from(uniqueUsers).sort();
}

module.exports = {
  usersToNotify
};
