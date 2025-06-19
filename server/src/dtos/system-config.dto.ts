import { Type } from 'class-transformer';
import { IsEnum, IsObject, ValidateNested } from 'class-validator';
import { SystemConfig } from 'src/config';
import { LogLevel } from 'src/enum';
import { ValidateBoolean } from 'src/validation';

class SystemConfigLoggingDto {
  @ValidateBoolean()
  enabled!: boolean;

  @IsEnum(LogLevel)
  level!: LogLevel;
}

export class SystemConfigDto implements SystemConfig {
  @Type(() => SystemConfigLoggingDto)
  @ValidateNested()
  @IsObject()
  logging!: SystemConfigLoggingDto;
}

export function mapConfig(config: SystemConfig): SystemConfigDto {
  return config;
}
