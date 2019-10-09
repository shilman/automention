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
  const matchingUsers = [];
  const labelToUsers = config;
  labels.forEach(label => {
    const users = labelToUsers[label];
    if (users) {
      users.forEach(u => matchingUsers.push(u));
    }
  });

  const users = labels.includes('help wanted')
    ? usersToNotify({ matchingUsers, fullIssue, issueComments })
    : [];
  const body = users.length ? formatAutomention(users) : null;

  const automentionComments = issueComments.filter(c => isAutomention(c.body));
  const [existingComment, ...duplicateComments] = automentionComments;

  if (!existingComment) {
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
      await issuesApi.deleteComment({
        ...issue,
        comment_id: existingComment.id
      });
    } else if (existing.body === body) {
      log.info('Nothing to update');
    } else {
      await issuesApi.updateComment({
        ...issue,
        comment_id: existingComment.id,
        body
      });
    }
  }

  await Promise.all(
    duplicateComments.map(async dupe => {
      log.warn(`Removing duplicate comment: ${dupe.id}`);
      await issuesApi.deleteComment({
        ...issue,
        comment_id: dupe.id
      });
    })
  );
}

module.exports = {
  automention
};
