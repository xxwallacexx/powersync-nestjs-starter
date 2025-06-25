import { ChildProcess, fork } from 'node:child_process';
import { Worker } from 'node:worker_threads';
import { AppWorker } from 'src/enum';
import { ConfigRepository } from 'src/repositories/config.repository';

let apiProcess: ChildProcess | undefined;

const onError = (name: string, error: Error) => {
  console.error(`${name} worker error: ${error}, stack: ${error.stack}`);
};

const onExit = (name: string, exitCode: number | null) => {
  console.log(name, exitCode);
  if (exitCode !== 0) {
    console.error(`${name} worker exited with code ${exitCode}`);

    if (apiProcess && name !== AppWorker.API) {
      console.error('Killing api process');
      apiProcess.kill('SIGTERM');
      apiProcess = undefined;
    }
  }

  process.exit(exitCode);
};

function bootstrapWorker(name: AppWorker) {
  console.log(`Starting ${name} worker`);

  let worker: Worker | ChildProcess;
  if (name === AppWorker.API) {
    worker = fork(`./dist/workers/${name}.js`, [], {
      execArgv: process.execArgv.map((arg) => (arg.startsWith('--inspect') ? '--inspect=0.0.0.0:9231' : arg)),
    });
    apiProcess = worker;
  } else {
    worker = new Worker(`./dist/workers/${name}.js`);
  }

  worker.on('error', (error) => onError(name, error));
  worker.on('exit', (exitCode) => onExit(name, exitCode));
}

async function bootstrap() {
  process.title = 'powerSync';
  const { workers } = new ConfigRepository().getEnv();
  for (const worker of workers) {
    bootstrapWorker(worker);
  }
}
bootstrap();
