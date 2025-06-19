import { Injectable } from '@nestjs/common';
import { createPublicKey, KeyObject } from 'crypto';
import { readFileSync } from 'fs';
import * as pemJwk from 'pem-jwk';
import { BaseService } from 'src/services/base.service';

@Injectable()
export class JwksService extends BaseService {
  getJwks(privateKeyPath: string) {
    const privatePem = readFileSync(privateKeyPath, 'utf-8');
    const publicKeyObj: KeyObject = createPublicKey(privatePem);

    const publicKeyPem = publicKeyObj
      .export({
        format: 'pem',
        type: 'spki',
      })
      .toString();

    const jwk = pemJwk.pem2jwk(publicKeyPem);

    jwk.alg = 'RS256';
    jwk.use = 'sig';
    jwk.kid = `powersync-${privatePem.slice(-40, -29)}`;

    return { keys: [jwk] };
  }
}
