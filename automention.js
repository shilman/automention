const { isAutomention, formatAutomention } = require('./comments');

function usersToNotify(issueLabels, labelToUsers, skipNotify, log) {
  log.info('Getting users to notify', issueLabels, labelToUsers, skipNotify);
  const uniqueOwners = new Set();
  issueLabels.forEach(label => {
    const users = labelToUsers[label];
    if (users) {
      users.forEach(
        user => !skipNotify.includes(user) && uniqueOwners.add(user)
      );
    }
  });
  return Array.from(uniqueOwners).sort();
}

async function automention({
  issue,
  labels,
  existingComments,
  issuesApi,
  config,
  log
}) {
  const automentionComments = existingComments.filter(c =>
    isAutomention(c.body)
  );
  if (automentionComments.length > 1) {
    const ids = automentionComments.map(c => c.id).join(' ');
    throw new Error(`Unexpected multiple automention comments: ${ids}`);
  }

  const fullIssue = (await issuesApi.get(issue)).data;
  log.debug(`Full issue state: ${fullIssue.state}`);
  const skipNotify = [];
  // [fullIssue.user, ...fullIssue.assignees].map(
  //   user => user.login
  // );

  const users = usersToNotify(labels, config, skipNotify, log);
  const body = users.length ? formatAutomention(users) : null;

  if (!automentionComments.length) {
    log.debug('No automention comments');
    if (!body) {
      log.info('No comments, no users to notify');
    } else if (fullIssue.state === 'closed') {
      log.info('Skipping closed issue');
    } else {
      log.info(`Creating comment: '${body}'`);
      await issuesApi.createComment({
        ...issue,
        body
      });
    }
  } else {
    const existing = automentionComments[0];
    if (!body || fullIssue.state === 'closed') {
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
