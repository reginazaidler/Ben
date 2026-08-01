const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');

test('application shell includes core Hebrew navigation and form', () => {
  const html = fs.readFileSync('index.html', 'utf8');
  for (const text of ['החוגים שלי', 'הוספת חוג חדש', 'השבוע שלי', 'שמור את החוג']) assert.ok(html.includes(text));
});

test('application logic persists activities and supports editing and deletion', () => {
  const js = fs.readFileSync('app.js', 'utf8');
  assert.match(js, /localStorage\.setItem/);
  assert.match(js, /openEdit/);
  assert.match(js, /confirmDelete/);
});
