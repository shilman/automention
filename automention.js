const { isAutomention, formatAutomention } = require('./comments');

function getOwners(issueLabels, labelToOwners, log) {
  log.info('Getting unique owners', issueLabels, labelToOwners);
  const uniqueOwners = new Set();
  issueLabels.forEach(label => {
    const owners = labelToOwners[label];
    if (owners) {
      owners.forEach(owner => uniqueOwners.add(owner));
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

  const fullIssue = await issuesApi.get(issue);
  log.debug(`Full issue state: ${fullIssue.state}`);

  const owners = getOwners(labels, config, log);
  const body = owners.length ? formatAutomention(owners) : null;

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
