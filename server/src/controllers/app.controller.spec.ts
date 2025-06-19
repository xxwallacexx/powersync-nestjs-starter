import { AppController } from 'src/controllers/app.controller';
import { SystemConfigService } from 'src/services/system-config.service';
import request from 'supertest';
import { ControllerContext, controllerSetup, mockBaseService } from 'test/utils';

describe(AppController.name, () => {
  let ctx: ControllerContext;

  beforeAll(async () => {
    ctx = await controllerSetup(AppController, [
      { provide: SystemConfigService, useValue: mockBaseService(SystemConfigService) },
    ]);
    return () => ctx.close();
  });

  beforeEach(() => {});

  describe('GET /.well-known/powersync', () => {
    it('should return a 200 status code', async () => {
      const { status, body } = await request(ctx.getHttpServer()).get('/.well-known/powerSync');
      expect(status).toBe(200);
      expect(body).toEqual({
        api: {
          endpoint: '/api',
        },
      });
    });
  });
});
