const { automention } = require('./automention');

let input;

const issue = {
  owner: 'owner',
  repo: 'repo',
  number: 'number'
};

describe('automention', () => {
  beforeEach(() => {
    input = {
      issue,
      config: {
        bug: ['shilman'],
        feature: ['ndelangen', 'tmeasday'],
        whatever: ['shilman', 'igor-dv']
      },
      issuesApi: {
        get: jest.fn().mockReturnValue(
          Promise.resolve({
            state: 'open'
          })
        ),
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
    input.labels = ['bug', 'whatever', 'feature'];
    input.existingComments = [];
    await automention(input);
    expect(input.issuesApi.createComment).toHaveBeenCalledWith({
      ...issue,
      body: `Automention: Hey @igor-dv @ndelangen @shilman @tmeasday, you've been tagged! Can you give a hand here?`
    });
  });

  describe('no automention comments', () => {
    beforeEach(() => {
      input.existingComments = [
        {
          id: 'otherId',
          body: `Some random non-automention comment`
        }
      ];
    });

    it('creates a comment when there are matching labels', async () => {
      input.labels = ['bug'];
      await automention(input);
      expect(input.issuesApi.createComment).toHaveBeenCalledWith({
        ...issue,
        body: `Automention: Hey @shilman, you've been tagged! Can you give a hand here?`
      });
    });

    it('does nothing when there are no matching labels', async () => {
      input.labels = [];
      await automention(input);
      expect(input.issuesApi.createComment).not.toHaveBeenCalled();
      expect(input.issuesApi.updateComment).not.toHaveBeenCalled();
      expect(input.issuesApi.deleteComment).not.toHaveBeenCalled();
    });

    it('does nothing when the issue is closed', async () => {
      input.labels = ['bug'];
      input.issuesApi.get.mockReturnValue(
        Promise.resolve({
          state: 'closed'
        })
      );
      await automention(input);
      expect(input.issuesApi.createComment).not.toHaveBeenCalled();
      expect(input.issuesApi.updateComment).not.toHaveBeenCalled();
      expect(input.issuesApi.deleteComment).not.toHaveBeenCalled();
    });
  });

  describe('pre-existing automention comments', () => {
    beforeEach(() => {
      input.existingComments = [
        {
          id: 'otherId',
          body: `Some random non-automention comment`
        },
        {
          id: 'existingId',
          body: `Automention: Hey @shilman, you've been tagged! Can you give a hand here?`
        }
      ];
    });

    it('does nothing when there are no changes', async () => {
      input.labels = ['bug'];
      await automention(input);
      expect(input.issuesApi.createComment).not.toHaveBeenCalled();
      expect(input.issuesApi.updateComment).not.toHaveBeenCalled();
      expect(input.issuesApi.deleteComment).not.toHaveBeenCalled();
    });

    it('updates an existing comment when there are changes', async () => {
      input.labels = ['feature'];
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
      input.labels = ['bug'];
      input.issuesApi.get.mockReturnValue(
        Promise.resolve({
          state: 'closed'
        })
      );
      await automention(input);
      expect(input.issuesApi.createComment).not.toHaveBeenCalled();
      expect(input.issuesApi.updateComment).not.toHaveBeenCalled();
      expect(input.issuesApi.deleteComment).toHaveBeenCalledWith({
        ...issue,
        comment_id: 'existingId'
      });
    });
  });
});
