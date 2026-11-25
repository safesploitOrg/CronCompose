import {spawnSync} from 'node:child_process';
import {delimiter, isAbsolute, join} from 'node:path';

function isGnuDate(executable, env) {
  const probe = spawnSync(executable, ['--version'], {
    encoding: 'utf8', env: {...env, LC_ALL: 'C'}, timeout: 3000
  });
  return probe.status === 0 && /\bGNU coreutils\b/.test(probe.stdout);
}

/** Resolve one absolute, verified GNU date executable for the shell fixtures. */
export function findGnuDate(env = process.env) {
  if (env.GNU_DATE !== undefined) {
    if (isAbsolute(env.GNU_DATE) && isGnuDate(env.GNU_DATE, env)) return env.GNU_DATE;
    throw new Error('GNU_DATE must point to an absolute path to a working GNU Coreutils date executable.');
  }
  // Search in PATH order: GNU date, Homebrew gdate, and Ubuntu gnudate.
  // Ignore empty/relative
  // entries so a file in the working directory cannot shadow the test tool.
  for (const directory of (env.PATH || '').split(delimiter).filter(isAbsolute)) {
    for (const name of ['date', 'gdate', 'gnudate']) {
      const executable = join(directory, name);
      if (isGnuDate(executable, env)) return executable;
    }
  }
  throw new Error('GNU Coreutils date is required for integration tests. On macOS: brew install coreutils; ensure gdate is on PATH. Alternatively set GNU_DATE to its absolute path. On Ubuntu 25.10+ check gnudate --version (gnu-coreutils package); on other Linux distributions install GNU coreutils.');
}
