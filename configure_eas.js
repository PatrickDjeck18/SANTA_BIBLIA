const { spawn } = require('child_process');

const child = spawn('eas', ['build:configure'], {
  stdio: ['pipe', 'inherit', 'inherit']
});

child.stdin.write('y\n');
child.stdin.end();

child.on('close', (code) => {
  console.log(`Process exited with code ${code}`);
});
