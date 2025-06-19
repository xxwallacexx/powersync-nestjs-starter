import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsString } from 'class-validator';
import { AppEnvironment, LogLevel } from 'src/enum';
import { Optional } from 'src/validation';

export class EnvDto {
  @IsInt()
  @Optional()
  @Type(() => Number)
  API_METRICS_PORT?: number;

  @IsString()
  @Optional()
  CONFIG_FILE?: string;

  @IsEnum(AppEnvironment)
  @Optional()
  ENV?: AppEnvironment;

  @IsString()
  @Optional()
  HOST?: string;

  @IsEnum(LogLevel)
  @Optional()
  LOG_LEVEL?: LogLevel;

  @IsInt()
  @Optional()
  @Type(() => Number)
  MICROSERVICES_METRICS_PORT?: number;

  @IsInt()
  @Optional()
  @Type(() => Number)
  PORT?: number;

  @IsString()
  @Optional()
  TELEMETRY_INCLUDE?: string;

  @IsString()
  @Optional()
  TELEMETRY_EXCLUDE?: string;

  @IsString()
  @Optional()
  WORKERS_INCLUDE?: string;

  @IsString()
  @Optional()
  WORKERS_EXCLUDE?: string;

  @IsString()
  @Optional()
  MONGO_DB_URI?: string;

  @IsString()
  @Optional()
  REDIS_HOSTNAME?: string;

  @IsInt()
  @Optional()
  @Type(() => Number)
  REDIS_PORT?: number;

  @IsInt()
  @Optional()
  @Type(() => Number)
  REDIS_DBINDEX?: number;

  @IsString()
  @Optional()
  REDIS_USERNAME?: string;

  @IsString()
  @Optional()
  REDIS_PASSWORD?: string;

  @IsString()
  @Optional()
  REDIS_SOCKET?: string;

  @IsString()
  @Optional()
  REDIS_URL?: string;

  @IsString()
  @Optional()
  PRIVATE_KEY_PATH?: string;
}
