const { automention } = require('./automention');

let input;

const issue = {
  owner: 'owner',
  repo: 'repo',
  number: 'number'
};

const FULL_ISSUE = {
  OPEN: {
    state: 'open',
    user: { login: 'random' },
    assignees: []
  },
  CLOSED: {
    state: 'closed',
    user: { login: 'random' },
    assignees: []
  },
  DRAFT: {
    state: 'open',
    draft: true,
    user: { login: 'random' },
    assignees: []
  }
};

describe('automention', () => {
  beforeEach(() => {
    input = {
      issue,
      fullIssue: FULL_ISSUE.OPEN,
      config: {
        bug: ['shilman'],
        feature: ['ndelangen', 'tmeasday'],
        whatever: ['shilman', 'igor-dv']
      },
      issuesApi: {
        createComment: jest.fn(),
        updateComment: jest.fn(),
        deleteComment: jest.fn()
      },
      log: {
        info: jest.fn(),
        success: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn()
      }
    };
  });

  it('handles multiple labels, uniquifying users and sorting them', async () => {
    input.labels = ['help wanted', 'bug', 'whatever', 'feature'];
    input.issueComments = [];
    await automention(input);
    expect(input.issuesApi.createComment).toHaveBeenCalledWith({
      ...issue,
      body: `Automention: Hey @igor-dv @ndelangen @shilman @tmeasday, you've been tagged! Can you give a hand here?`
    });
  });

  describe('no automention comments', () => {
    beforeEach(() => {
      input.issueComments = [
        {
          id: 'otherId',
          body: 'Some random non-automention comment',
          user: { login: 'igor-dv' }
        }
      ];
    });

    it('creates a comment when there are matching labels', async () => {
      input.labels = ['help wanted', 'bug'];
      await automention(input);
      expect(input.issuesApi.createComment).toHaveBeenCalledWith({
        ...issue,
        body: `Automention: Hey @shilman, you've been tagged! Can you give a hand here?`
      });
    });

    it('does nothing when there are no matching labels', async () => {
      input.labels = ['help wanted'];
      await automention(input);
      expect(input.issuesApi.createComment).not.toHaveBeenCalled();
      expect(input.issuesApi.updateComment).not.toHaveBeenCalled();
      expect(input.issuesApi.deleteComment).not.toHaveBeenCalled();
    });

    it('does nothing when there is no `help wanted` label', async () => {
      input.labels = ['bug'];
      await automention(input);
      expect(input.issuesApi.createComment).not.toHaveBeenCalled();
      expect(input.issuesApi.updateComment).not.toHaveBeenCalled();
      expect(input.issuesApi.deleteComment).not.toHaveBeenCalled();
    });

    it('does nothing when the issue is closed', async () => {
      input.labels = ['help wanted', 'bug'];
      input.fullIssue = FULL_ISSUE.CLOSED;
      await automention(input);
      expect(input.issuesApi.createComment).not.toHaveBeenCalled();
      expect(input.issuesApi.updateComment).not.toHaveBeenCalled();
      expect(input.issuesApi.deleteComment).not.toHaveBeenCalled();
    });

    it('does nothing when the issue is in draft mode', async () => {
      input.labels = ['help wanted', 'bug'];
      input.fullIssue = FULL_ISSUE.DRAFT;
      await automention(input);
      expect(input.issuesApi.createComment).not.toHaveBeenCalled();
      expect(input.issuesApi.updateComment).not.toHaveBeenCalled();
      expect(input.issuesApi.deleteComment).not.toHaveBeenCalled();
    });
  });

  describe('pre-existing automention comments', () => {
    beforeEach(() => {
      input.issueComments = [
        {
          id: 'otherId',
          body: `Some random non-automention comment`,
          user: { login: 'whatever' }
        },
        {
          id: 'existingId',
          body: `Automention: Hey @shilman, you've been tagged! Can you give a hand here?`,
          user: { login: 'github-actions' }
        }
      ];
    });

    it('does nothing when there are no changes', async () => {
      input.labels = ['help wanted', 'bug'];
      await automention(input);
      expect(input.issuesApi.createComment).not.toHaveBeenCalled();
      expect(input.issuesApi.updateComment).not.toHaveBeenCalled();
      expect(input.issuesApi.deleteComment).not.toHaveBeenCalled();
    });

    it('updates an existing comment when there are changes', async () => {
      input.labels = ['help wanted', 'feature'];
      await automention(input);
      expect(input.issuesApi.updateComment).toHaveBeenCalledWith({
        ...issue,
        comment_id: 'existingId',
        body: `Automention: Hey @ndelangen @tmeasday, you've been tagged! Can you give a hand here?`
      });
    });

    it('deletes an existing comment when there are no matching users', async () => {
      input.labels = [];
      await automention(input);
      expect(input.issuesApi.deleteComment).toHaveBeenCalledWith({
        ...issue,
        comment_id: 'existingId'
      });
    });

    it('deletes an existing comment when the issue is closed', async () => {
      input.labels = ['help wanted', 'bug'];
      input.fullIssue = FULL_ISSUE.CLOSED;
      await automention(input);
      expect(input.issuesApi.createComment).not.toHaveBeenCalled();
      expect(input.issuesApi.updateComment).not.toHaveBeenCalled();
      expect(input.issuesApi.deleteComment).toHaveBeenCalledWith({
        ...issue,
        comment_id: 'existingId'
      });
    });
  });

  describe('multiple existing automention comments', () => {
    beforeEach(() => {
      input.issueComments = [
        {
          id: 'existingId',
          body: `Automention: Hey @shilman, you've been tagged! Can you give a hand here?`,
          user: { login: 'github-actions' }
        },
        {
          id: 'duplicateId',
          body: `Automention: Hey @shilman @igor-dv, you've been tagged! Can you give a hand here?`,
          user: { login: 'github-actions' }
        }
      ];
    });
    it('updates first comment and deletes duplicate comments', async () => {
      input.labels = ['help wanted', 'feature'];
      await automention(input);
      expect(input.issuesApi.createComment).not.toHaveBeenCalled();
      expect(input.issuesApi.updateComment).toHaveBeenCalledWith({
        ...issue,
        comment_id: 'existingId',
        body: `Automention: Hey @ndelangen @tmeasday, you've been tagged! Can you give a hand here?`
      });
      expect(input.issuesApi.deleteComment).toHaveBeenCalledWith({
        ...issue,
        comment_id: 'duplicateId'
      });
    });
  });
});
