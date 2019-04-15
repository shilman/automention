const { Toolkit } = require('actions-toolkit');
const { automention } = require('./automention');

Toolkit.run(async tools => {
  const {
    github: { issues },
    context: { issue },
    log,
    exit
  } = tools;
  log.info('Automention!');

  try {
    const config = tools.config('.github/automention.yml');
    if (!config) {
      throw new Error('No automention.yml');
    }

    const labels = (await issues.listLabelsOnIssue(issue)).data.map(
      l => l.name
    );

    // FIXME: support pagination
    const existingComments = (await issues.listComments({
      ...issue,
      per_page: 100
    })).data;

    await automention({
      issue,
      labels,
      existingComments,
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
