import {
  validateHash,
  getMdwEndpointPrefixForHash,
} from '../../../src/popup/utils';

const testErrors = [{
  hash: null,
}, {
  hash: undefined,
}];

const testHashes = [{
  hash: 'ak_USd42orxJjEedPzUvFizdtEmURTGdVoiubu6LJoNmxAbcek0',
  error: true,
}, {
  hash: 'ak_USd42orxJjEedPzUvFizdtEmURTGdVoiubu6LJoNmxAbcekI',
  error: true,
}, {
  hash: 'ak_USd42orxJjEedPzUvFizdtEmURTGdVoiubu6LJoNmxAbcekO',
  error: true,
}, {
  hash: 'ak_USd42orxJjEedPzUvFizdtEmURTGdVoiubu6LJoNmxAbcekl',
  error: true,
}, {
  hash: 'ak_USd42orxJjEedPzUvFizdtEmURTGdVoiubu6LJoNmxAbcekl',
  error: true,
}, {
  hash: 'th_USd42orxJjEedPzUvFizdtEmURTGdVoiubu6LJoNmxAbcekK',
  endpoint: 'transactions',
}, {
  hash: 'ak_USd42orxJjEedPzUvFizdtEmURTGdVoiubu6LJoNmxAbcekK',
  endpoint: 'account/transactions',
}, {
  hash: 'nm_USd42orxJjEedPzUvFizdtEmURTGdVoiubu6LJoNmxAbcekK',
  endpoint: 'names',
}, {
  hash: 'testName0.chain',
  endpoint: 'names',
}];

describe('validateHash', () => {
  testErrors.forEach((test) => it('should throw an error', () => {
    expect(() => validateHash(test.hash)).toThrow();
  }));
  testHashes.forEach((test) => it('should be invalid if hash has improper length, contains invalid characters (0, J, O, l or symbols) or does not have ".chain" ending', () => {
    expect(validateHash(test.hash).valid).toBe(!test.error);
  }));
  testHashes.forEach((test) => it('should return correct endpoint related to its', () => {
    expect.assertions(1);
    if (test.error) {
      expect(validateHash(test.hash).valid).toBe(false);
    }
    expect(getMdwEndpointPrefixForHash(test.hash)).toBe(test.endpoint);
  }));
});
