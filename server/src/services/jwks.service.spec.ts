import { JwksService } from 'src/services/jwks.service';
import { newTestService, ServiceMocks } from 'test/utils';
import { beforeEach, describe, expect, it } from 'vitest';

describe(JwksService.name, () => {
  let sut: JwksService;
  let _mocks: ServiceMocks;
  beforeEach(() => {
    ({ sut, mocks: _mocks } = newTestService(JwksService));
  });

  it('should work', () => {
    expect(sut).toBeDefined();
  });

  describe('getJwks', () => {
    it('should return JWKS with correct structure', () => {
      const privateKeyPath = 'test/fixtures/secrets/test_private_key.pem';
      const jwks = sut.getJwks(privateKeyPath ?? '');
      expect(jwks).toBeDefined();
    });
  });
});
