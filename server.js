const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8000;

const USERS = [
  { username: 'admin', password: 'admin123', name: 'System Administrator', role: 'ROLE_ADMIN', distrCode: 'ADMIN-001', userType: 'COMPANY' },
  { username: 'boopathy', password: 'boopathy123', name: 'Boopathy Periyaswamy', role: 'ROLE_DISTRIBUTOR', distrCode: 'DIST-10001', userType: 'DISTRIBUTOR' },
  { username: 'alex.morgan', password: 'Password@123', name: 'Alex Morgan & Co.', role: 'DISTRIBUTOR', distrCode: 'DIST-99999', userType: 'DISTRIBUTOR' },
  { username: 'sds', password: 'Welcome@01', name: 'Raj R', role: 'DISTRIBUTOR', distrCode: 'DIST-33245', userType: 'DISTRIBUTOR' }
];

const mockMasterData = {
  customer: [
    { CustomerCode: 'CUST-001', CustomerName: 'Apex Retailers Pvt Ltd', City: 'Chennai', Phone: '9876543210' },
    { CustomerCode: 'CUST-002', CustomerName: 'Metro Departmental Store', City: 'Coimbatore', Phone: '9876543211' }
  ],
  product: [
    { ProductCode: 'PROD-001', ProductName: 'Premium Wheat Flour 5kg', Category: 'Staples', Price: 250 },
    { ProductCode: 'PROD-002', ProductName: 'Sunflower Cooking Oil 1L', Category: 'Edible Oils', Price: 165 }
  ],
  salesman: [
    { SalesmanCode: 'SM-01', SalesmanName: 'Karthik Raja', Mobile: '9123456780', Territory: 'Zone-A' }
  ],
  route: [
    { RouteCode: 'RT-01', RouteName: 'Central Express Beat', TotalOutlets: 42 }
  ]
};

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  let bodyStr = '';
  req.on('data', chunk => { bodyStr += chunk; });
  req.on('end', () => {
    let body = {};
    try { if (bodyStr) body = JSON.parse(bodyStr); } catch (e) {}

    const url = req.url;

    if (url === '/webportal-login') {
      const u = USERS.find(user => user.username === body.username && user.password === body.password);
      if (u) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'success',
          token: 'mock-jwt-session-' + Date.now(),
          user: {
            username: u.username,
            name: u.name,
            role: u.role,
            distrCode: u.distrCode,
            userType: u.userType,
            sourceMode: body.sourceMode || 'xml'
          }
        }));
      } else {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'error',
          message: 'Invalid username or password credentials.'
        }));
      }
      return;
    }

    if (url === '/webportal-master-data') {
      const entity = body.entity || 'customer';
      const records = mockMasterData[entity] || [];
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'success', records }));
      return;
    }

    if (url === '/webportal-dashboard-kpi') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'success',
        todayOrders: 18,
        todaySales: 64200,
        pendingReturns: 2,
        stockValue: 1450000
      }));
      return;
    }

    if (url === '/webportal-orders') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'success', orders: [] }));
      return;
    }

    if (url === '/webportal-sales-returns') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'success', returns: [] }));
      return;
    }

    if (url === '/webportal-purchases') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'success', purchases: [] }));
      return;
    }

    if (url === '/webportal-stock-adjustments') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'success', adjustments: [] }));
      return;
    }

    if (url === '/webportal-stock-ledger') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'success', ledger: [] }));
      return;
    }

    if (url === '/webportal-db-status') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'success', active: true, mode: 'xml' }));
      return;
    }

    if (url === '/webportal-ping') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok' }));
      return;
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'success', data: [] }));
  });
});

server.listen(PORT, () => {
  console.log(`Distributor Web Portal Backend Server running on http://localhost:${PORT}`);
});
