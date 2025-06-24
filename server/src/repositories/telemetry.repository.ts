import { Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { MetricOptions } from '@opentelemetry/api';
import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { IORedisInstrumentation } from '@opentelemetry/instrumentation-ioredis';
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { AggregationType } from '@opentelemetry/sdk-metrics';
import { contextBase, NodeSDK } from '@opentelemetry/sdk-node';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
import { ClassConstructor } from 'class-transformer';
import { snakeCase, startCase } from 'lodash';
import { MetricService } from 'nestjs-otel';
import { copyMetadataFromFunctionToFunction } from 'nestjs-otel/lib/opentelemetry.utils';
import { serverVersion } from 'src/constants';
import { AppTelemetry, MetadataKey } from 'src/enum';
import { ConfigRepository } from 'src/repositories/config.repository';
import { LoggingRepository } from 'src/repositories/logging.repository';

type MetricGroupOptions = { enabled: boolean };

export class MetricGroupRepository {
  private enabled = false;
  constructor(private metricService: MetricService) {}

  addToCounter(name: string, value: number, options?: MetricOptions) {
    if (this.enabled) {
      this.metricService.getCounter(name, options).add(value);
    }
  }

  addToGauge(name: string, value: number, options?: MetricOptions) {
    if (this.enabled) {
      this.metricService.getUpDownCounter(name, options).add(value);
    }
  }

  addToHistogram(name: string, value: number, options?: MetricOptions): void {
    if (this.enabled) {
      this.metricService.getHistogram(name, options).record(value);
    }
  }

  configure(options: MetricGroupOptions): this {
    this.enabled = options.enabled;
    return this;
  }
}

const aggregationBoundaries = [
  0.1, 0.25, 0.5, 0.75, 1, 2.5, 5, 7.5, 10, 25, 50, 75, 100, 250, 500, 750, 1000, 2500, 5000, 7500, 10_000,
];

let instance: NodeSDK | undefined;

export const bootstrapTelemetry = (port: number, otlpTraceExporterUrl: string) => {
  if (instance) {
    throw new Error('OpenTelemetry SDK already started');
  }
  const otlpTraceExporter = new OTLPTraceExporter({
    url: otlpTraceExporterUrl,
  });

  instance = new NodeSDK({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: 'api',
      [ATTR_SERVICE_VERSION]: serverVersion.toString(),
    }),
    metricReader: new PrometheusExporter({ port }),
    traceExporter: otlpTraceExporter,
    spanProcessor: new BatchSpanProcessor(otlpTraceExporter),
    contextManager: new AsyncLocalStorageContextManager(),
    instrumentations: [new HttpInstrumentation(), new IORedisInstrumentation(), new NestInstrumentation()],
    views: [
      {
        instrumentName: '*',
        instrumentUnit: 'ms',
        aggregation: {
          type: AggregationType.EXPLICIT_BUCKET_HISTOGRAM,
          options: { boundaries: aggregationBoundaries },
        },
      },
    ],
  });
  instance.start();
};

export const shutdownTelemetry = async () => {
  if (instance) {
    await instance.shutdown();
    instance = undefined;
  }
};

@Injectable()
export class TelemetryRepository {
  api: MetricGroupRepository;
  host: MetricGroupRepository;
  repo: MetricGroupRepository;

  constructor(
    private metricService: MetricService,
    private reflect: Reflector,
    private configRepository: ConfigRepository,
    private logger: LoggingRepository,
  ) {
    const { telemetry } = this.configRepository.getEnv();
    const { metrics } = telemetry;
    this.api = new MetricGroupRepository(metricService).configure({ enabled: metrics.has(AppTelemetry.API) });
    this.host = new MetricGroupRepository(metricService).configure({ enabled: metrics.has(AppTelemetry.HOST) });
    this.repo = new MetricGroupRepository(metricService).configure({ enabled: metrics.has(AppTelemetry.REPO) });
  }

  setup({ repositories }: { repositories: ClassConstructor<unknown>[] }) {
    const { telemetry } = this.configRepository.getEnv();
    const { metrics } = telemetry;
    if (!metrics.has(AppTelemetry.REPO)) {
      return;
    }

    for (const Repository of repositories) {
      const isEnabled = this.reflect.get(MetadataKey.TELEMETRY_ENABLED, Repository) ?? true;
      if (!isEnabled) {
        this.logger.debug(`Telemetry disabled for ${Repository.name}`);
        continue;
      }

      this.wrap(Repository);
    }
  }

  private wrap(Repository: ClassConstructor<unknown>) {
    const className = Repository.name;
    const descriptors = Object.getOwnPropertyDescriptors(Repository.prototype);
    const unit = 'ms';

    for (const [propName, descriptor] of Object.entries(descriptors)) {
      const isMethod = typeof descriptor.value == 'function' && propName !== 'constructor';
      if (!isMethod) {
        continue;
      }

      const method = descriptor.value;
      const propertyName = snakeCase(String(propName));
      const metricName = `${snakeCase(className).replaceAll(/_(?=(repository)|(controller)|(provider)|(service)|(module))/g, '.')}.${propertyName}.duration`;

      const histogram = this.metricService.getHistogram(metricName, {
        prefix: 'api',
        description: `The elapsed time in ${unit} for the ${startCase(className)} to ${propertyName.toLowerCase()}`,
        unit,
        valueType: contextBase.ValueType.DOUBLE,
      });

      descriptor.value = function (...args: any[]) {
        const start = performance.now();
        const result = method.apply(this, args);

        void Promise.resolve(result)
          .then(() => histogram.record(performance.now() - start, {}))
          .catch(() => {
            // noop
          });

        return result;
      };

      copyMetadataFromFunctionToFunction(method, descriptor.value);
      Object.defineProperty(Repository.prototype, propName, descriptor);
    }
  }
}
