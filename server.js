const http = require('http');
const fs = require('fs');
const path = require('path');
const {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse
} = require('@simplewebauthn/server');

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
const CREDENTIALS_FILE = path.join(DATA_DIR, 'admin_credentials.json');

let expectedChallenge = '';
let activeAdminToken = '';

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
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (request.method === 'OPTIONS') {
    response.writeHead(204);
    response.end();
    return;
  }

  // --- API ROUTES ---

  // GET /api/auth/status
  if (request.url === '/api/auth/status' && request.method === 'GET') {
    const credentials = readJson(CREDENTIALS_FILE);
    const authHeader = request.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const isAuthenticated = !!(token && token === activeAdminToken);

    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({
      hasAdmin: credentials.length > 0,
      isAuthenticated: isAuthenticated
    }));
    return;
  }

  // GET /api/auth/register-options
  if (request.url === '/api/auth/register-options' && request.method === 'GET') {
    try {
      const credentials = readJson(CREDENTIALS_FILE);
      if (credentials.length > 0) {
        const authHeader = request.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token || token !== activeAdminToken) {
          response.writeHead(401, { 'Content-Type': 'application/json' });
          response.end(JSON.stringify({ error: 'Unauthorized. Admin must be authenticated to add more passkeys.' }));
          return;
        }
      }

      const rpName = 'Coffee Tec';
      const rpID = 'localhost';
      const options = await generateRegistrationOptions({
        rpName,
        rpID,
        userID: new TextEncoder().encode('coffetec-admin'),
        userName: 'admin@coffetec.com',
        userDisplayName: 'Coffee Tec Admin',
        attestationType: 'none',
        authenticatorSelection: {
          residentKey: 'required',
          userVerification: 'preferred',
        },
      });

      expectedChallenge = options.challenge;
      response.writeHead(200, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify(options));
    } catch (e) {
      console.error(e);
      response.writeHead(500, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // POST /api/auth/register-verification
  if (request.url === '/api/auth/register-verification' && request.method === 'POST') {
    try {
      const body = await parseBody(request);
      const credentials = readJson(CREDENTIALS_FILE);

      if (credentials.length > 0) {
        const authHeader = request.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token || token !== activeAdminToken) {
          response.writeHead(401, { 'Content-Type': 'application/json' });
          response.end(JSON.stringify({ error: 'Unauthorized. Admin must be authenticated to add more passkeys.' }));
          return;
        }
      }

      const rpID = 'localhost';
      const origin = 'http://localhost:8000';
      const verification = await verifyRegistrationResponse({
        response: body,
        expectedChallenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
        requireUserVerification: false,
      });

      const registrationInfo = verification.registrationInfo;
      const credential = registrationInfo?.credential ?? registrationInfo;

      if (verification.verified && credential && credential.id && credential.publicKey) {
        // v13: credential.id is already a base64url string
        // credential.publicKey is a Uint8Array
        const newCred = {
          credentialID: credential.id,
          credentialPublicKey: Buffer.from(credential.publicKey).toString('base64'),
          counter: credential.counter || 0,
          transports: body.response?.transports || []
        };
        credentials.push(newCred);
        writeJson(CREDENTIALS_FILE, credentials);

        const crypto = require('crypto');
        activeAdminToken = crypto.randomBytes(32).toString('hex');

        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ verified: true, token: activeAdminToken }));
      } else {
        const errorMessage = verification.verified
          ? 'Verification returned invalid credential data'
          : 'Verification failed';

        response.writeHead(400, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ verified: false, error: errorMessage }));
      }
    } catch (e) {
      console.error(e);
      response.writeHead(500, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // GET /api/auth/login-options
  if (request.url === '/api/auth/login-options' && request.method === 'GET') {
    try {
      const credentials = readJson(CREDENTIALS_FILE);
      if (credentials.length === 0) {
        response.writeHead(400, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ error: 'No admin passkeys registered.' }));
        return;
      }

      const rpID = 'localhost';
      const options = await generateAuthenticationOptions({
        rpID,
        allowCredentials: credentials.map(cred => ({
          id: cred.credentialID,
          type: 'public-key',
          transports: cred.transports,
        })),
        userVerification: 'preferred',
      });

      expectedChallenge = options.challenge;
      response.writeHead(200, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify(options));
    } catch (e) {
      console.error(e);
      response.writeHead(500, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // POST /api/auth/login-verification
  if (request.url === '/api/auth/login-verification' && request.method === 'POST') {
    try {
      const body = await parseBody(request);
      const credentials = readJson(CREDENTIALS_FILE);

      const savedCred = credentials.find(cred => {
        // v13: credential IDs are stored as base64url strings
        // body.id is already a base64url string from the client
        return cred.credentialID === body.id;
      });

      if (!savedCred) {
        response.writeHead(400, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ verified: false, error: 'Credential not found' }));
        return;
      }

      const rpID = 'localhost';
      const origin = 'http://localhost:8000';
      const verification = await verifyAuthenticationResponse({
        response: body,
        expectedChallenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
        requireUserVerification: false,
        credential: {
          id: savedCred.credentialID,
          publicKey: new Uint8Array(Buffer.from(savedCred.credentialPublicKey, 'base64')),
          counter: savedCred.counter,
        }
      });

      if (verification.verified) {
        savedCred.counter = verification.authenticationInfo.newCounter;
        writeJson(CREDENTIALS_FILE, credentials);

        const crypto = require('crypto');
        activeAdminToken = crypto.randomBytes(32).toString('hex');

        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ verified: true, token: activeAdminToken }));
      } else {
        response.writeHead(400, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ verified: false, error: 'Authentication signature invalid' }));
      }
    } catch (e) {
      console.error(e);
      response.writeHead(500, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // GET /api/products
  if (request.url === '/api/products' && request.method === 'GET') {
    const products = readJson(PRODUCTS_FILE);
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(products));
    return;
  }

  // POST /api/products (Add/Register Product)
  if (request.url === '/api/products' && request.method === 'POST') {
    const authHeader = request.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token || token !== activeAdminToken) {
      response.writeHead(401, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ error: 'Unauthorized' }));
      return;
    }

    try {
      const body = await parseBody(request);
      const products = readJson(PRODUCTS_FILE);

      const newProduct = {
        id: Date.now(),
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
    const authHeader = request.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token || token !== activeAdminToken) {
      response.writeHead(401, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ error: 'Unauthorized' }));
      return;
    }

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
        ...body,
        serverDate: new Date().toISOString()
      };

      orders.unshift(newOrder);
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
