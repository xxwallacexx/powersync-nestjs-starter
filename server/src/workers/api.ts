import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { json } from 'body-parser';
import cookieParser from 'cookie-parser';
import { ApiModule } from 'src/app.module';
import { excludePaths, serverVersion } from 'src/constants';
import { AppEnvironment } from 'src/enum';
import { WebSocketAdapter } from 'src/middlewares/websocket.adapter';
import { ConfigRepository } from 'src/repositories/config.repository';
import { LoggingRepository } from 'src/repositories/logging.repository';
import { ApiService } from 'src/services/api.service';
import { isStartUpError } from 'src/utils/misc';

async function bootstrap() {
  process.title = 'api';

  const app = await NestFactory.create<NestExpressApplication>(ApiModule, {
    bufferLogs: true,
  });
  const logger = await app.resolve(LoggingRepository);
  const configRepository = app.get(ConfigRepository);

  const { environment, host, port } = configRepository.getEnv();
  const isDev = environment === AppEnvironment.DEVELOPMENT;

  logger.setContext('Bootstrap');
  app.useLogger(logger);
  app.set('trust proxy', ['loopback']);
  app.set('etag', 'strong');
  app.use(cookieParser());
  app.use(json({ limit: '10mb' }));
  if (isDev) {
    app.enableCors();
  }
  app.useWebSocketAdapter(new WebSocketAdapter(app));

  app.setGlobalPrefix('api', { exclude: excludePaths });
  app.use(app.get(ApiService).ssr(excludePaths));

  const server = await (host ? app.listen(port, host) : app.listen(port));
  server.requestTimeout = 24 * 60 * 60 * 1000;

  logger.log(
    `Server is listening on ${await app.getUrl()} [v${serverVersion}] [${environment}] `,
  );
}

bootstrap().catch((error) => {
  if (!isStartUpError(error)) {
    console.error(error);
  }
  // eslint-disable-next-line unicorn/no-process-exit
  process.exit(1);
});
