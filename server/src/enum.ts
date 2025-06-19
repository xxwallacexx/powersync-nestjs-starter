export enum AppEnvironment {
  DEVELOPMENT = 'development',
  TESTING = 'testing',
  PRODUCTION = 'production',
}

export enum AppWorker {
  API = 'api',
  MICROSERVICES = 'microservices',
}

export enum LogLevel {
  VERBOSE = 'verbose',
  DEBUG = 'debug',
  LOG = 'log',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal',
}

export enum MetadataKey {
  EVENT_CONFIG = 'event_config',
}

export enum AppHeader {
  SESSION_TOKEN = 'x-session-token',
  CHECKSUM = 'x-checksum',
  CID = 'x-cid',
}

export enum AppQuery {
  SESSION_KEY = 'sessionKey',
}

export enum BootstrapEventPriority {
  // Initialise config after other bootstrap services, stop other services from using config on bootstrap
  SystemConfig = 100,
}

export enum QueueName {}
//to-do
//machine-learning-queue
