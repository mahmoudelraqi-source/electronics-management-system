/** @jsx jsx */
/** @jsxImportSource hono/jsx */

import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>نظام إدارة المحترف للإلكترونيات</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .container {
          width: 100%;
          max-width: 1200px;
        }

        .login-container {
          background: white;
          border-radius: 10px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.2);
          padding: 40px;
          max-width: 400px;
          margin: 0 auto;
        }

        .login-container h1 {
          text-align: center;
          color: #333;
          margin-bottom: 30px;
          font-size: 24px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          color: #555;
          font-weight: 500;
        }

        .form-group input {
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 5px;
          font-size: 14px;
          transition: border-color 0.3s;
        }

        .form-group input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 5px rgba(102, 126, 234, 0.3);
        }

        .btn {
          width: 100%;
          padding: 12px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 5px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .btn:hover {
          transform: translateY(-2px);
        }

        .btn:active {
          transform: translateY(0);
        }

        .error {
          color: #e74c3c;
          font-size: 14px;
          margin-top: 10px;
          text-align: center;
        }

        .dashboard {
          display: none;
          background: white;
          border-radius: 10px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.2);
          padding: 30px;
        }

        .dashboard.active {
          display: block;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #f0f0f0;
          padding-bottom: 20px;
        }

        .header h1 {
          color: #333;
          font-size: 28px;
        }

        .logout-btn {
          background: #e74c3c;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
          font-weight: 600;
        }

        .nav-tabs {
          display: flex;
          gap: 10px;
          margin-bottom: 30px;
          flex-wrap: wrap;
        }

        .nav-tabs button {
          padding: 10px 20px;
          background: #f0f0f0;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s;
        }

        .nav-tabs button.active {
          background: #667eea;
          color: white;
        }

        .tab-content {
          display: none;
        }

        .tab-content.active {
          display: block;
        }

        .form-section {
          background: #f9f9f9;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .form-section h3 {
          color: #333;
          margin-bottom: 15px;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }

        table th {
          background: #667eea;
          color: white;
          padding: 12px;
          text-align: right;
        }

        table td {
          padding: 12px;
          border-bottom: 1px solid #ddd;
        }

        table tr:hover {
          background: #f9f9f9;
        }

        .alert {
          padding: 15px;
          border-radius: 5px;
          margin-bottom: 20px;
        }

        .alert.success {
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .alert.error {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .alert.warning {
          background: #fff3cd;
          color: #856404;
          border: 1px solid #ffeeba;
        }

        select, input {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 5px;
          font-size: 14px;
        }

        @media (max-width: 768px) {
          .login-container {
            padding: 20px;
          }

          .header {
            flex-direction: column;
            gap: 15px;
          }

          .nav-tabs {
            flex-direction: column;
          }

          .nav-tabs button {
            width: 100%;
          }

          table {
            font-size: 12px;
          }

          table th, table td {
            padding: 8px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Login Form -->
        <div id="loginForm" class="login-container">
          <h1>🔐 نظام الإدارة</h1>
          <form onsubmit="handleLogin(event)">
            <div class="form-group">
              <label for="username">اسم المستخدم</label>
              <input type="text" id="username" required>
            </div>
            <div class="form-group">
              <label for="password">كلمة المرور</label>
              <input type="password" id="password" required>
            </div>
            <button type="submit" class="btn">دخول</button>
            <div id="loginError" class="error"></div>
          </form>
        </div>

        <!-- Dashboard -->
        <div id="dashboard" class="dashboard">
          <div class="header">
            <h1>📊 لوحة التحكم</h1>
            <button class="logout-btn" onclick="handleLogout()">تسجيل خروج</button>
          </div>

          <div class="nav-tabs">
            <button class="active" onclick="switchTab('inventory')">📦 المخزن</button>
            <button onclick="switchTab('sales')">🛒 المبيعات</button>
            <button onclick="switchTab('accounts')">💰 الحسابات</button>
            <button onclick="switchTab('archive')">📁 الأرشيف</button>
          </div>

          <!-- Inventory Tab -->
          <div id="inventory" class="tab-content active">
            <div class="form-section">
              <h3>إضافة منتج جديد</h3>
              <form onsubmit="handleAddProduct(event)" style="display: grid; gap: 10px;">
                <input type="text" placeholder="اسم الصنف" id="productName" required>
                <input type="number" placeholder="سعر الجملة" id="wholesalePrice" step="0.01" required>
                <input type="number" placeholder="سعر البيع" id="retailPrice" step="0.01" required>
                <input type="number" placeholder="الكمية" id="quantity" required>
                <input type="number" placeholder="الحد الأدنى للتنبيه" id="minQuantity" value="10">
                <button type="submit" class="btn">إضافة منتج</button>
              </form>
            </div>

            <h3>قائمة المنتجات</h3>
            <table id="productsTable">
              <thead>
                <tr>
                  <th>اسم الصنف</th>
                  <th>سعر الجملة</th>
                  <th>سعر البيع</th>
                  <th>الكمية</th>
                  <th>الحالة</th>
                </tr>
              </thead>
              <tbody></tbody>
            </table>
          </div>

          <!-- Sales Tab -->
          <div id="sales" class="tab-content">
            <div class="form-section">
              <h3>إنشاء فاتورة جديدة</h3>
              <form onsubmit="handleCreateSale(event)" style="display: grid; gap: 10px;">
                <input type="text" placeholder="اسم العميل" id="customerName" required>
                <input type="tel" placeholder="رقم الموبايل" id="customerPhone" required>
                
                <div>
                  <label>اختر الأصناف:</label>
                  <div id="itemsContainer" style="margin-top: 10px;"></div>
                  <button type="button" class="btn" onclick="addItemRow()" style="margin-top: 10px;">+ إضافة صنف</button>
                </div>

                <select id="paymentType" required>
                  <option value="">اختر طريقة الدفع</option>
                  <option value="cash">نقداً</option>
                  <option value="credit">آجل</option>
                </select>

                <button type="submit" class="btn">إنشاء الفاتورة</button>
              </form>
            </div>

            <h3>الفواتير الحديثة</h3>
            <table id="salesTable">
              <thead>
                <tr>
                  <th>اسم العميل</th>
                  <th>الرقم</th>
                  <th>المبلغ</th>
                  <th>نوع الدفع</th>
                  <th>التاريخ</th>
                </tr>
              </thead>
              <tbody></tbody>
            </table>
          </div>

          <!-- Accounts Tab -->
          <div id="accounts" class="tab-content">
            <h3>العملاء والحسابات</h3>
            <table id="accountsTable">
              <thead>
                <tr>
                  <th>اسم العميل</th>
                  <th>الرقم</th>
                  <th>المبلغ المستحق</th>
                  <th>المبلغ المدفوع</th>
                </tr>
              </thead>
              <tbody></tbody>
            </table>
          </div>

          <!-- Archive Tab -->
          <div id="archive" class="tab-content">
            <div class="form-section">
              <h3>أرشفة المبيعات الشهرية</h3>
              <form onsubmit="handleArchive(event)" style="display: grid; gap: 10px;">
                <input type="number" placeholder="السنة" id="archiveYear" min="2020" max="2099" required>
                <input type="number" placeholder="الشهر" id="archiveMonth" min="1" max="12" required>
                <button type="submit" class="btn">أرشفة</button>
              </form>
            </div>

            <h3>المبيعات المؤرشفة</h3>
            <table id="archiveTable">
              <thead>
                <tr>
                  <th>اسم العميل</th>
                  <th>الرقم</th>
                  <th>المبلغ</th>
                  <th>التاريخ</th>
                </tr>
              </thead>
              <tbody></tbody>
            </table>
          </div>
        </div>
      </div>

      <script>
        const API_URL = '/api';
        let token = localStorage.getItem('token');
        let products = [];

        if (token) {
          showDashboard();
          loadProducts();
          loadSales();
          loadAccounts();
        }

        async function handleLogin(e) {
          e.preventDefault();
          const username = document.getElementById('username').value;
          const password = document.getElementById('password').value;

          try {
            const response = await fetch(\`\${API_URL}/auth/login\`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
              token = data.token;
              localStorage.setItem('token', token);
              showDashboard();
              loadProducts();
              loadSales();
              loadAccounts();
            } else {
              document.getElementById('loginError').textContent = data.error || 'خطأ في تسجيل الدخول';
            }
          } catch (error) {
            document.getElementById('loginError').textContent = 'خطأ في الاتصال';
          }
        }

        function handleLogout() {
          localStorage.removeItem('token');
          token = null;
          document.getElementById('loginForm').style.display = 'block';
          document.getElementById('dashboard').classList.remove('active');
          document.getElementById('username').value = '';
          document.getElementById('password').value = '';
        }

        function showDashboard() {
          document.getElementById('loginForm').style.display = 'none';
          document.getElementById('dashboard').classList.add('active');
        }

        async function loadProducts() {
          try {
            const response = await fetch(\`\${API_URL}/products\`);
            products = await response.json();
            displayProducts();
            updateItemsDropdown();
          } catch (error) {
            console.error('Error loading products:', error);
          }
        }

        function displayProducts() {
          const tbody = document.querySelector('#productsTable tbody');
          tbody.innerHTML = products.map(p => \`
            <tr>
              <td>\${p.name}</td>
              <td>\${p.wholesale_price}</td>
              <td>\${p.retail_price}</td>
              <td>\${p.quantity}</td>
              <td>\${p.quantity <= p.min_quantity ? '⚠️ منخفض' : '✅ متوفر'}</td>
            </tr>
          \`).join('');
        }

        function updateItemsDropdown() {
          const container = document.getElementById('itemsContainer');
          if (container.children.length === 0) {
            addItemRow();
          }
        }

        function addItemRow() {
          const container = document.getElementById('itemsContainer');
          const row = document.createElement('div');
          row.style.display = 'grid';
          row.style.gridTemplateColumns = '1fr 100px';
          row.style.gap = '10px';
          row.style.marginBottom = '10px';
          row.innerHTML = \`
            <select class="product-select" required>
              <option value="">اختر صنف</option>
              \${products.map(p => \`<option value="\${p.id}">\${p.name} (متوفر: \${p.quantity})</option>\`).join('')}
            </select>
            <input type="number" class="product-qty" placeholder="الكمية" min="1" required>
          \`;
          container.appendChild(row);
        }

        async function handleAddProduct(e) {
          e.preventDefault();
          const product = {
            name: document.getElementById('productName').value,
            wholesale_price: parseFloat(document.getElementById('wholesalePrice').value),
            retail_price: parseFloat(document.getElementById('retailPrice').value),
            quantity: parseInt(document.getElementById('quantity').value),
            min_quantity: parseInt(document.getElementById('minQuantity').value)
          };

          try {
            const response = await fetch(\`\${API_URL}/products\`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(product)
            });

            if (response.ok) {
              loadProducts();
              e.target.reset();
              alert('تم إضافة المنتج بنجاح');
            }
          } catch (error) {
            alert('خطأ في إضافة المنتج');
          }
        }

        async function handleCreateSale(e) {
          e.preventDefault();
          const items = [];
          document.querySelectorAll('.product-select').forEach((select, idx) => {
            if (select.value) {
              items.push({
                product_id: parseInt(select.value),
                quantity: parseInt(document.querySelectorAll('.product-qty')[idx].value)
              });
            }
          });

          if (items.length === 0) {
            alert('اختر صنفاً واحداً على الأقل');
            return;
          }

          const sale = {
            customer_name: document.getElementById('customerName').value,
            customer_phone: document.getElementById('customerPhone').value,
            items,
            payment_type: document.getElementById('paymentType').value
          };

          try {
            const response = await fetch(\`\${API_URL}/sales\`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(sale)
            });

            if (response.ok) {
              loadProducts();
              loadSales();
              loadAccounts();
              e.target.reset();
              document.getElementById('itemsContainer').innerHTML = '';
              alert('تم إنشاء الفاتورة بنجاح');
            }
          } catch (error) {
            alert('خطأ في إنشاء الفاتورة');
          }
        }

        async function loadSales() {
          try {
            const response = await fetch(\`\${API_URL}/sales\`);
            const sales = await response.json();
            const tbody = document.querySelector('#salesTable tbody');
            tbody.innerHTML = sales.map(s => \`
              <tr>
                <td>\${s.customer_name}</td>
                <td>\${s.customer_phone}</td>
                <td>\${s.total_amount}</td>
                <td>\${s.payment_type === 'cash' ? 'نقداً' : 'آجل'}</td>
                <td>\${new Date(s.created_at).toLocaleDateString('ar-EG')}</td>
              </tr>
            \`).join('');
          } catch (error) {
            console.error('Error loading sales:', error);
          }
        }

        async function loadAccounts() {
          try {
            const response = await fetch(\`\${API_URL}/accounts/customers\`);
            const accounts = await response.json();
            const tbody = document.querySelector('#accountsTable tbody');
            tbody.innerHTML = accounts.map(a => \`
              <tr>
                <td>\${a.customer_name}</td>
                <td>\${a.customer_phone}</td>
                <td>\${a.debt || 0}</td>
                <td>\${a.paid || 0}</td>
              </tr>
            \`).join('');
          } catch (error) {
            console.error('Error loading accounts:', error);
          }
        }

        async function handleArchive(e) {
          e.preventDefault();
          const year = parseInt(document.getElementById('archiveYear').value);
          const month = parseInt(document.getElementById('archiveMonth').value);

          try {
            const response = await fetch(\`\${API_URL}/archive/monthly\`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ year, month })
            });

            if (response.ok) {
              const data = await response.json();
              alert(\`تم أرشفة \${data.count} فاتورة\`);
              loadSales();
            }
          } catch (error) {
            alert('خطأ في الأرشفة');
          }
        }

        function switchTab(tabName) {
          document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
          document.querySelectorAll('.nav-tabs button').forEach(btn => btn.classList.remove('active'));
          document.getElementById(tabName).classList.add('active');
          event.target.classList.add('active');
        }
      </script>
    </body>
    </html>
  `);
});

export default app;
