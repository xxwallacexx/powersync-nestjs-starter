import { JwksService } from 'src/services/jwks.service';
import { newTestService, ServiceMocks } from 'test/utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe(JwksService.name, () => {
  let sut: JwksService;
  let mocks: ServiceMocks;
  beforeEach(() => {
    ({ sut, mocks } = newTestService(JwksService));
  });

  it('should work', () => {
    expect(sut).toBeDefined();
  });

  describe('getJwks', () => {
    it('should return JWKS with correct structure', () => {
      const { privateKeyPath } = mocks.config.getEnv();
      const jwks = sut.getJwks(privateKeyPath ?? '');
      expect(jwks).toBeDefined();
    });
  });
});
