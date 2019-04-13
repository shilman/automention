const { Toolkit } = require('actions-toolkit');

describe('Automention', () => {
  let action, tools;

  // Mock Toolkit.run to define `action` so we can call it
  Toolkit.run = jest.fn(actionFn => {
    action = actionFn;
  });
  require('.');

  beforeEach(() => {
    tools = new Toolkit({
      logger: {
        info: jest.fn(),
        success: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn()
      }
    });
    tools.exit.success = jest.fn();
    tools.exit.failure = jest.fn();
  });

  it('exits successfully', () => {
    action(tools);
    expect(tools.exit.success).toHaveBeenCalled();
    expect(tools.exit.success).toHaveBeenCalledWith('We did it!');
  });
});
