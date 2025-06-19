import { readFileSync } from 'node:fs';
import { SemVer } from 'semver';
export const IWorker = 'IWorker';

const { version } = JSON.parse(readFileSync('./package.json', 'utf8'));
export const serverVersion = new SemVer(version);

export const excludePaths = ['/.well-known/powersync'];
