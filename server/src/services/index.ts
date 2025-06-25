import { ApiService } from 'src/services/api.service';
import { DatabaseService } from 'src/services/database.service';
import { JwksService } from 'src/services/jwks.service';
import { SystemConfigService } from 'src/services/system-config.service';

export const services = [ApiService, DatabaseService, JwksService, SystemConfigService];
