const http = require('http');
const fs = require('fs');
const path = require('path');
const connect = require('connect');
const livereload = require('livereload');
const connectLivereload = require('connect-livereload');

const PORT = 8080;

// Start livereload server
const lrserver = livereload.createServer();
lrserver.watch(__dirname);

const app = connect();
app.use(connectLivereload());


app.use((req, res) => {
  // Remove query string from URL
  let filePath = req.url.split('?')[0];
  if (filePath === '/' || filePath === '/index.html') {
    filePath = '/index.html';
  }
  const ext = path.extname(filePath);
  const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'font/otf',
    '.wasm': 'application/wasm'
  };
  const absPath = path.join(__dirname, filePath);
  fs.readFile(absPath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
      return;
    }
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

http.createServer(app).listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
