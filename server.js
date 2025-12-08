const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8000;

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.wasm': 'application/wasm'
};

const DATA_DIR = path.join(__dirname, 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

// Helper to read JSON
const readJson = (file) => {
  try {
    if (!fs.existsSync(file)) return [];
    const data = fs.readFileSync(file, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    console.error("Error reading " + file, e);
    return [];
  }
};

// Helper to write JSON
const writeJson = (file, data) => {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (e) {
    console.error("Error writing " + file, e);
    return false;
  }
};

// Helper to parse body
const parseBody = (req) => {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        if (!body) resolve({});
        else resolve(JSON.parse(body));
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', (err) => reject(err));
  });
};

http.createServer(async function (request, response) {
  console.log(`${request.method} ${request.url}`);

  // CORS for local dev flex
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    response.writeHead(204);
    response.end();
    return;
  }

  // --- API ROUTES ---

  // GET /api/products
  if (request.url === '/api/products' && request.method === 'GET') {
    const products = readJson(PRODUCTS_FILE);
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(products));
    return;
  }

  // POST /api/products (Add/Register Product)
  if (request.url === '/api/products' && request.method === 'POST') {
    try {
      const body = await parseBody(request);
      const products = readJson(PRODUCTS_FILE);

      const newProduct = {
        id: Date.now(), // simple ID
        name: body.name || "Nuevo Producto",
        price: body.price || "0",
        desc: body.desc || "Sin descripción",
        icon: body.icon || "📦"
      };

      products.push(newProduct);
      writeJson(PRODUCTS_FILE, products);

      response.writeHead(201, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ success: true, product: newProduct }));
    } catch (e) {
      response.writeHead(400, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ error: 'Invalid JSON' }));
    }
    return;
  }

  // GET /api/orders
  if (request.url === '/api/orders' && request.method === 'GET') {
    const orders = readJson(ORDERS_FILE);
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(orders));
    return;
  }

  // POST /api/orders (Register Sale)
  if (request.url === '/api/orders' && request.method === 'POST') {
    try {
      const body = await parseBody(request);
      const orders = readJson(ORDERS_FILE);

      const newOrder = {
        id: Date.now(),
        ...body, // expects { productId, productName, price, buyer, date }
        serverDate: new Date().toISOString()
      };

      orders.unshift(newOrder); // Newest first
      writeJson(ORDERS_FILE, orders);

      response.writeHead(201, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ success: true, order: newOrder }));
    } catch (e) {
      response.writeHead(400, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ error: 'Invalid JSON' }));
    }
    return;
  }

  // --- STATIC FILE SERVER ---

  let filePath = '.' + request.url;
  if (filePath === './') {
    filePath = './index.html';
  }

  // Avoid traversing up
  const finalPath = path.resolve(filePath);
  if (!finalPath.startsWith(__dirname)) {
    response.writeHead(403);
    response.end('Forbidden');
    return;
  }

  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = MIME_TYPES[extname] || 'application/octet-stream';

  fs.readFile(filePath, function (error, content) {
    if (error) {
      if (error.code == 'ENOENT') {
        // If api route not found but tried as file
        if (request.url.startsWith('/api/')) {
          response.writeHead(404, { 'Content-Type': 'application/json' });
          response.end(JSON.stringify({ error: 'Not Found' }));
          return;
        }

        fs.readFile('./404.html', function (error, content) {
          response.writeHead(404, { 'Content-Type': 'text/html' });
          response.end(content || '404 Not Found', 'utf-8');
        });
      }
      else {
        response.writeHead(500);
        response.end('Sorry, check with the site admin for error: ' + error.code + ' ..\n');
      }
    }
    else {
      response.writeHead(200, { 'Content-Type': contentType });
      response.end(content, 'utf-8');
    }
  });

}).listen(PORT);

console.log(`Server running at http://localhost:${PORT}/`);
console.log('API Endpoints available at /api/products and /api/orders');
console.log('Press Ctrl+C to stop.');
