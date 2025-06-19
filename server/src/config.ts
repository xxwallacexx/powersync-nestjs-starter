import { LogLevel } from 'src/enum';

export interface SystemConfig {
  logging: {
    enabled: boolean;
    level: LogLevel;
  };
}

export const defaults = Object.freeze<SystemConfig>({
  logging: {
    enabled: true,
    level: LogLevel.LOG,
  },
});
