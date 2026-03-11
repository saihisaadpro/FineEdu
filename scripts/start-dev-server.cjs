const path = require('path');
const { spawn } = require('child_process');

const cwd = process.cwd();
const logDir = path.join(cwd, '.codex-logs');

require('fs').mkdirSync(logDir, { recursive: true });

const command = 'npm run dev -- --host 127.0.0.1 >> ".codex-logs\\vite.out.log" 2>> ".codex-logs\\vite.err.log"';
const child = spawn(process.env.ComSpec || 'C:\\Windows\\System32\\cmd.exe', ['/d', '/s', '/c', command], {
  cwd,
  detached: true,
  stdio: 'ignore',
  windowsHide: true,
});

console.log(child.pid);
child.unref();
