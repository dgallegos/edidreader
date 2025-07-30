const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const port = process.argv[2] || 3847;

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url);
  let pathname = `.${parsedUrl.pathname}`;
  
  // Default to index.html if root requested
  if (pathname === './') {
    pathname = './app/index.html';
  }
  
  const ext = path.parse(pathname).ext;
  const map = mimeTypes[ext] || 'text/plain';

  fs.readFile(pathname, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('File not found!');
      return;
    }
    
    res.writeHead(200, { 'Content-Type': map });
    res.end(data);
  });
});

server.listen(port, () => {
  console.log(`HTTP Server running at http://localhost:${port}/`);
  console.log(`Test runner available at: http://localhost:${port}/test-runner-standalone.html`);
});