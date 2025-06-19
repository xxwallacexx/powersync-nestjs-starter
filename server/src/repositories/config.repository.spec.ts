import { clearEnvCache, ConfigRepository } from 'src/repositories/config.repository';

const getEnv = () => {
  clearEnvCache();
  return new ConfigRepository().getEnv();
};

const resetEnv = () => {
  const list = ['HOST', 'PORT', 'WORKERS_INCLUDE', 'WORKERS_EXCLUDE', 'ENV', 'LOG_LEVEL'];
  for (const env of list) {
    delete process.env[env];
  }
};

describe('getEnv', () => {
  beforeEach(() => {
    resetEnv();
  });

  it('should use defaults', () => {
    const config = getEnv();

    expect(config).toMatchObject({
      host: undefined,
      port: 4040,
      environment: undefined,
      configFile: undefined,
      logLevel: 'verbose',
      privateKeyPath: undefined,
    });
  });

  describe('workers', () => {
    it('should return default workers', () => {
      const { workers } = getEnv();
      expect(workers).toEqual(['api', 'microservices']);
    });

    it('should return included workers', () => {
      process.env.WORKERS_INCLUDE = 'api';
      const { workers } = getEnv();
      expect(workers).toEqual(['api']);
    });

    it('should excluded workers from defaults', () => {
      process.env.WORKERS_EXCLUDE = 'api';
      const { workers } = getEnv();
      expect(workers).toEqual(['microservices']);
    });

    it('should exclude workers from include list', () => {
      process.env.WORKERS_INCLUDE = 'api,microservices,randomservice';
      process.env.WORKERS_EXCLUDE = 'randomservice,microservices';
      const { workers } = getEnv();
      expect(workers).toEqual(['api']);
    });

    it('should remove whitespace from included workers before parsing', () => {
      process.env.WORKERS_INCLUDE = 'api, microservices';
      const { workers } = getEnv();
      expect(workers).toEqual(['api', 'microservices']);
    });

    it('should remove whitespace from excluded workers before parsing', () => {
      process.env.WORKERS_EXCLUDE = 'api, microservices';
      const { workers } = getEnv();
      expect(workers).toEqual([]);
    });

    it('should remove whitespace from included and excluded workers before parsing', () => {
      process.env.WORKERS_INCLUDE = 'api, microservices, randomservice,randomservice2';
      process.env.WORKERS_EXCLUDE = 'randomservice,microservices, randomservice2';
      const { workers } = getEnv();
      expect(workers).toEqual(['api']);
    });

    it('should throw error for invalid workers', () => {
      process.env.WORKERS_INCLUDE = 'api,microservices,randomservice';
      expect(getEnv).toThrow('Invalid worker(s) found: api,microservices,randomservice');
    });
  });
});
