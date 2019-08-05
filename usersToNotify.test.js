const { usersToNotify } = require('./usersToNotify');

const issue = {
  state: 'open',
  user: { login: 'hypnosphi' },
  assignees: []
};

describe('notification', () => {
  it('should notify nobody when the issue is closed', () => {
    expect(
      usersToNotify({
        matchingUsers: ['shilman'],
        fullIssue: { ...issue, state: 'closed' },
        issueComments: []
      })
    ).toEqual([]);
  });
  it("should notify nobody when the it's a draft PR", () => {
    expect(
      usersToNotify({
        matchingUsers: ['shilman'],
        fullIssue: { ...issue, draft: true },
        issueComments: []
      })
    ).toEqual([]);
  });
  it('should notify nobody when the issue is assigned', () => {
    expect(
      usersToNotify({
        matchingUsers: ['ndelangen'],
        fullIssue: { ...issue, assignees: [{ login: 'shilman' }] },
        issueComments: []
      })
    ).toEqual([]);
  });
  it('should notify matching users', () => {
    expect(
      usersToNotify({
        matchingUsers: ['igor-dv', 'shilman'],
        fullIssue: issue,
        issueComments: []
      })
    ).toEqual(['igor-dv', 'shilman']);
  });
  it('should skip users that have already commented', () => {
    expect(
      usersToNotify({
        matchingUsers: ['igor-dv', 'shilman'],
        fullIssue: issue,
        issueComments: [{ user: { login: 'shilman' } }]
      })
    ).toEqual(['igor-dv']);
  });
  it('should skip issue author', () => {
    expect(
      usersToNotify({
        matchingUsers: ['domyen', 'shilman'],
        fullIssue: { ...issue, user: { login: 'domyen' } },
        issueComments: [{ user: { login: 'shilman' } }]
      })
    ).toEqual([]);
  });
  it('should uniquify and sort users', () => {
    expect(
      usersToNotify({
        matchingUsers: ['tmeasday', 'shilman', 'tmeasday'],
        fullIssue: issue,
        issueComments: []
      })
    ).toEqual(['shilman', 'tmeasday']);
  });
});
