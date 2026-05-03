const { spawnSync } = require('node:child_process');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..');
const turboBin = path.join(repoRoot, 'node_modules', '.bin', 'turbo.cmd');
const pnpmShim = path.join(repoRoot, 'pnpm.cmd');

const env = {
  ...process.env,
  PATH: `${repoRoot};${process.env.PATH ?? ''}`,
  npm_execpath: pnpmShim
};

const command = process.platform === 'win32' ? 'cmd.exe' : turboBin;
const args =
  process.platform === 'win32'
    ? ['/c', turboBin, 'run', ...process.argv.slice(2)]
    : ['run', ...process.argv.slice(2)];

const result = spawnSync(command, args, {
  cwd: repoRoot,
  env,
  stdio: 'inherit',
  shell: false
});

if (result.error) {
  console.error(result.error);
}

process.exit(result.status ?? 1);
