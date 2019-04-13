const { Toolkit } = require('actions-toolkit');

Toolkit.run(async tools => {
  const { exit, log } = tools;
  log.info('Automention!');

  exit.success('We did it!');
});
