/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

const base = '{{baseUrl}}/api/v1';

function req(name, method, urlPath, options = {}) {
  const item = {
    name,
    request: {
      method,
      header: options.headers ?? [{ key: 'Content-Type', value: 'application/json' }],
      url: `${base}${urlPath}`,
    },
  };
  if (options.body !== undefined) {
    item.request.body = { mode: 'raw', raw: JSON.stringify(options.body, null, 2) };
  }
  if (options.auth) {
    item.request.auth = {
      type: 'bearer',
      bearer: [{ key: 'token', value: '{{accessToken}}', type: 'string' }],
    };
  }
  if (options.testScript) {
    item.event = [
      {
        listen: 'test',
        script: { type: 'text/javascript', exec: options.testScript },
      },
    ];
  }
  return item;
}

const collection = {
  info: {
    name: 'Sport Booking API',
    description: 'REST API đặt sân — import kèm SportBooking.postman_environment.json',
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
  },
  item: [
    {
      name: 'Health',
      item: [req('GET health', 'GET', '/health')],
    },
    {
      name: 'Auth',
      item: [
        req('Register customer', 'POST', '/auth/register', {
          body: {
            fullName: 'Postman User',
            email: '{{customerEmail}}',
            password: '{{customerPassword}}',
            phone: '0909123456',
          },
        }),
        req('Login customer', 'POST', '/auth/login', {
          body: { email: '{{customerEmail}}', password: '{{customerPassword}}' },
          testScript: [
            'const json = pm.response.json();',
            'if (pm.response.code === 200 && json.data?.accessToken) {',
            "  pm.environment.set('accessToken', json.data.accessToken);",
            "  pm.environment.set('userId', String(json.data.user.id));",
            '}',
          ],
        }),
        req('Login admin', 'POST', '/auth/login', {
          body: { email: '{{adminEmail}}', password: '{{adminPassword}}' },
          testScript: [
            'const json = pm.response.json();',
            'if (pm.response.code === 200 && json.data?.accessToken) {',
            "  pm.environment.set('accessToken', json.data.accessToken);",
            '}',
          ],
        }),
        req('GET me', 'GET', '/auth/me', { auth: true, headers: [] }),
        req('Refresh token', 'POST', '/auth/refresh', { headers: [] }),
        req('Logout', 'POST', '/auth/logout', { auth: true, headers: [] }),
      ],
    },
    {
      name: 'Fields & schedule',
      item: [
        req('List fields', 'GET', '/fields?limit=20&status=Active', { headers: [] }),
        req('Get field by id', 'GET', '/fields/{{fieldId}}', { headers: [] }),
        req('Field schedule', 'GET', '/fields/{{fieldId}}/schedule?date={{bookingDate}}', { headers: [] }),
        req('Schedule board', 'GET', '/schedule?fieldTypeId={{fieldTypeId}}&date={{bookingDate}}', {
          headers: [],
        }),
        req('List field types', 'GET', '/field-types', { headers: [] }),
        req('List time slots', 'GET', '/time-slots?fieldTypeId={{fieldTypeId}}', { headers: [] }),
      ],
    },
    {
      name: 'Bookings',
      item: [
        req('Create booking', 'POST', '/bookings', {
          auth: true,
          body: {
            fieldId: '{{fieldId}}',
            timeSlotId: '{{timeSlotId}}',
            bookingDate: '{{bookingDate}}',
            customerName: 'Postman',
            customerPhone: '0909123456',
            paymentMethod: 'Online',
          },
          testScript: [
            'if (pm.response.code === 201) {',
            "  pm.environment.set('bookingId', String(pm.response.json().data.id));",
            '}',
          ],
        }),
        req('My bookings', 'GET', '/bookings/me', { auth: true, headers: [] }),
        req('Get booking', 'GET', '/bookings/{{bookingId}}', { auth: true, headers: [] }),
        req('Simulate payment', 'POST', '/bookings/{{bookingId}}/payment', { auth: true, headers: [] }),
        req('Cancel booking', 'PATCH', '/bookings/{{bookingId}}/cancel', {
          auth: true,
          body: { reason: 'Postman test' },
        }),
        req('Admin list bookings', 'GET', '/bookings?limit=20', { auth: true, headers: [] }),
        req('Admin update status', 'PATCH', '/bookings/{{bookingId}}/status', {
          auth: true,
          body: { status: 'Confirmed' },
        }),
      ],
    },
    {
      name: 'Stats',
      item: [
        req('Overview', 'GET', '/stats/overview', { auth: true, headers: [] }),
        req('Revenue by day', 'GET', '/stats/revenue?groupBy=day', { auth: true, headers: [] }),
        req('Field performance', 'GET', '/stats/fields', { auth: true, headers: [] }),
      ],
    },
    {
      name: 'CMS',
      item: [
        req('List news', 'GET', '/news-posts?limit=10', { headers: [] }),
        req('List partners', 'GET', '/partner-items?limit=10', { headers: [] }),
      ],
    },
  ],
};

const out = path.join(__dirname, '..', 'SportBooking.postman_collection.json');
fs.writeFileSync(out, `${JSON.stringify(collection, null, 2)}\n`);
console.log(`Wrote ${out}`);
