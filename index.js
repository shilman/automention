const { Toolkit } = require('actions-toolkit');
const { automention } = require('./automention');

Toolkit.run(async tools => {
  const {
    github: { issues },
    context: { issue },
    log
  } = tools;
  log.info('Automention!');

  const config = tools.config('automention.yml');
  if (!config) {
    tools.exit.failure('No automention.yml');
  }

  try {
    const labels = (await issues.listLabelsOnIssue(issue)).data.map(
      l => l.name
    );

    // FIXME: support pagination
    const existingComments = await github.issues.listComments({
      ...issue,
      per_page: 100
    });

    await automention({
      issue,
      labels,
      existingComments,
      commentApi: issues,
      config,
      log
    });

    tools.exit.success('We did it!');
  } catch (err) {
    log.error(err.message);
    tools.exit.failure(err.message);
  }
});
