const {
  isAutomention,
  parseAutomention,
  formatAutomention
} = require('./comments');

describe('comments', () => {
  describe('isAutomention', () => {
    it('automention comments', () => {
      expect(isAutomention('Automention: Hey @shilman, you suck!')).toBe(true);
      expect(
        isAutomention('Automention: Hey @shilman @ndelangen fix your bugs!')
      ).toBe(true);
    });
    it('non-automention comments', () => {
      expect(isAutomention('Automention sucks!')).toBe(false);
      expect(isAutomention('Automention: Hey you suck!')).toBe(false);
    });
  });

  describe('parseAutomention', () => {
    it('automention comments', () => {
      expect(
        parseAutomention('Automention: Hey @shilman, blah blah blah')
      ).toEqual(['shilman']);
      expect(
        parseAutomention('Automention: Hey @shilman @ndelangen, fix your bugs!')
      ).toEqual(['shilman', 'ndelangen']);
    });

    it('non-automention comments', () => {
      expect(() => parseAutomention('foo')).toThrow();
    });
  });

  describe('formatAutomention', () => {
    it('with no users', () => {
      expect(() => formatAutomention()).toThrow();
      expect(() => formatAutomention(null)).toThrow();
      expect(() => formatAutomention([])).toThrow();
    });

    it('with users', () => {
      const single = formatAutomention(['shilman']);
      expect(single.startsWith('Automention: Hey @shilman,')).toBe(true);

      const multi = formatAutomention(['ndelangen', 'tmeasday']);
      expect(multi.startsWith('Automention: Hey @ndelangen @tmeasday,')).toBe(
        true
      );
    });
  });
});
