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
  commentApi,
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

  const owners = getOwners(labels, config, log);
  const body = owners.length ? formatAutomention(owners) : null;

  if (!automentionComments.length) {
    log.debug('No automention comments');
    if (!body) {
      log.info('No comments, no users to notify');
    } else {
      log.info(`Creating comment: '${body}'`);
      await commentApi.createComment({
        ...issue,
        body
      });
    }
  } else {
    const existing = automentionComments[0];
    if (!body) {
      log.info('Removing automention comment');
      await commentApi.deleteComment({ ...issue, comment_id: existing.id });
    } else if (existing.body === body) {
      log.info('Nothing to update');
    } else {
      await commentApi.updateComment({
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
