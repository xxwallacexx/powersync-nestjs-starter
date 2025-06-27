import { Controller, Get, InternalServerErrorException } from '@nestjs/common';
import { ConfigRepository } from 'src/repositories/config.repository';
import { JwksService } from 'src/services/jwks.service';

@Controller('jwks.json')
export class JwksController {
  constructor(
    private readonly jwksService: JwksService,
    private readonly configRespository: ConfigRepository,
  ) {}

  @Get()
  getJwks() {
    const { privateKeyPath } = this.configRespository.getEnv();
    if (!privateKeyPath) {
      throw new InternalServerErrorException('no private key path');
    }
    return this.jwksService.getJwks(privateKeyPath);
  }
}
