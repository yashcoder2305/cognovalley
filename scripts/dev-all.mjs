#!/usr/bin/env node
/**
 * Starts the Next.js app and the Python YOLO scanner together.
 *
 *   npm run dev:all
 *
 * Ctrl+C stops both processes.
 */
import { spawn } from 'node:child_process';

const isWindows = process.platform === 'win32';
const npm = isWindows ? 'npm.cmd' : 'npm';

const tasks = [
  { name: 'web', color: '\x1b[36m', args: ['run', 'dev'] },
  { name: 'scan', color: '\x1b[35m', args: ['run', 'scan:server'] },
];

const children = [];
let shuttingDown = false;

function prefixStream(name, color, stream, target) {
  let buffer = '';
  stream.on('data', (chunk) => {
    buffer += chunk.toString();
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      if (line.trim()) target.write(`${color}[${name}]\x1b[0m ${line}\n`);
    }
  });
}

function killTree(child) {
  if (!child?.pid) return;
  if (isWindows) {
    spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
  } else {
    try {
      process.kill(-child.pid, 'SIGTERM');
    } catch {
      child.kill('SIGTERM');
    }
  }
}

function shutdown(exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) killTree(child);
  setTimeout(() => process.exit(exitCode), 500);
}

for (const task of tasks) {
  const child = spawn(npm, task.args, {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: process.env,
    shell: isWindows,
    detached: !isWindows,
  });

  prefixStream(task.name, task.color, child.stdout, process.stdout);
  prefixStream(task.name, task.color, child.stderr, process.stderr);

  child.on('exit', (code) => {
    if (!shuttingDown) {
      console.error(`${task.color}[${task.name}]\x1b[0m exited with code ${code}`);
      shutdown(code ?? 1);
    }
  });

  children.push(child);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
console.log('\x1b[36m[web]\x1b[0m  http://localhost:3000');
console.log('\x1b[35m[scan]\x1b[0m http://127.0.0.1:8000/health');
console.log('Press Ctrl+C to stop both.\n');
