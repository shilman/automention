const { Toolkit } = require('actions-toolkit');
const { automention } = require('./automention');

Toolkit.run(async tools => {
  const {
    github: { issues },
    context: { issue: contextIssue },
    log,
    exit
  } = tools;
  log.info('Automention!');

  try {
    const config = tools.config('.github/automention.yml');
    if (!config) {
      throw new Error('No automention.yml');
    }

    const { number, owner, repo } = contextIssue;
    const issue = { issue_number: number, owner, repo };
    const fullIssue = (await issues.get(issue)).data;

    const labels = (await issues.listLabelsOnIssue(issue)).data.map(
      l => l.name
    );

    // FIXME: support pagination
    const issueComments = (await issues.listComments({
      ...issue,
      per_page: 100
    })).data;

    await automention({
      issue,
      fullIssue,
      labels,
      issueComments,
      issuesApi: issues,
      config,
      log
    });

    exit.success('We did it!');
  } catch (err) {
    log.error(err.message);
    exit.failure(err.message);
  }
});
