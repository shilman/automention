const { isAutomention, formatAutomention } = require('./comments');
const { usersToNotify } = require('./usersToNotify');

async function automention({
  issue,
  fullIssue,
  labels,
  issueComments,
  issuesApi,
  config,
  log
}) {
  const automentionComments = issueComments.filter(c => isAutomention(c.body));
  if (automentionComments.length > 1) {
    const ids = automentionComments.map(c => c.id).join(' ');
    throw new Error(`Unexpected multiple automention comments: ${ids}`);
  }

  const matchingUsers = [];
  const labelToUsers = config;
  labels.forEach(label => {
    const users = labelToUsers[label];
    if (users) {
      users.forEach(u => matchingUsers.push(u));
    }
  });

  const users = usersToNotify({ matchingUsers, fullIssue, issueComments });
  const body = users.length ? formatAutomention(users) : null;

  if (!automentionComments.length) {
    log.debug('No automention comments');
    if (!body) {
      log.info('No users to notify');
    } else {
      log.info(`Creating comment: '${body}'`);
      await issuesApi.createComment({
        ...issue,
        body
      });
    }
  } else {
    const existing = automentionComments[0];
    if (!body) {
      log.info('Removing automention comment');
      await issuesApi.deleteComment({ ...issue, comment_id: existing.id });
    } else if (existing.body === body) {
      log.info('Nothing to update');
    } else {
      await issuesApi.updateComment({
        ...issue,
        comment_id: existing.id,
        body
      });
    }
  }
}

module.exports = {
  automention
};
