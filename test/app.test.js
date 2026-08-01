const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');

test('application shell includes core Hebrew navigation and form', () => {
  const html = fs.readFileSync('index.html', 'utf8');
  for (const text of ['החוגים שלי', 'שלום בן!', 'הפרופיל של בן', 'הוספת חוג חדש', 'השבוע שלי', 'שמור את החוג']) assert.ok(html.includes(text));
  assert.ok(!html.includes('נועם'));
  assert.ok(html.includes('class="star-banner"'));
  assert.equal((html.match(/<span>★<\/span>/g) || []).length, 7);
});

test('application logic persists activities and supports editing and deletion', () => {
  const js = fs.readFileSync('app.js', 'utf8');
  assert.match(js, /localStorage\.setItem/);
  assert.match(js, /openEdit/);
  assert.match(js, /confirmDelete/);
});

test('settings page edits and locally persists the profile', () => {
  const html = fs.readFileSync('index.html', 'utf8');
  const js = fs.readFileSync('app.js', 'utf8');
  assert.ok(html.includes('id="settingsPage"'));
  assert.ok(html.includes('id="settingsForm"'));
  assert.ok(html.includes('id="settingsActivityList"'));
  assert.match(js, /localStorage\.setItem\('myProfile'/);
  assert.match(js, /settingsForm.*addEventListener\('submit'/);
  assert.match(js, /settingsBtn.*go\('settings'\)/);
  assert.ok(html.includes('id="largeText"'));
  assert.ok(html.includes('id="reduceMotion"'));
  assert.match(js, /applyPreferences/);
  assert.match(js, /largeText:\$\('#largeText'\)\.checked/);
});

test('notification controls request permission and schedule activity reminders', () => {
  const html = fs.readFileSync('index.html', 'utf8');
  const js = fs.readFileSync('app.js', 'utf8');
  assert.ok(html.includes('id="enableNotifications"'));
  assert.ok(html.includes('id="notificationStatus"'));
  assert.match(js, /Notification\.requestPermission\(\)/);
  assert.match(js, /function nextReminderDate/);
  assert.match(js, /function scheduleNotifications/);
  assert.match(js, /new Notification/);
});

test('friends can share the application link with a native or clipboard fallback', () => {
  const html = fs.readFileSync('index.html', 'utf8');
  const js = fs.readFileSync('app.js', 'utf8');
  assert.ok(html.includes('id="shareAppBtn"'));
  assert.ok(html.includes('שיתוף עם חברים'));
  assert.ok(html.includes('נשמרים רק בדפדפן ובמכשיר שלו'));
  assert.match(js, /navigator\.share/);
  assert.match(js, /navigator\.clipboard\.writeText/);
  assert.match(js, /shareAppBtn.*shareApp/);
});

test('application can be installed and works offline as a PWA', () => {
  const html = fs.readFileSync('index.html', 'utf8');
  const js = fs.readFileSync('app.js', 'utf8');
  const manifest = JSON.parse(fs.readFileSync('manifest.webmanifest', 'utf8'));
  const worker = fs.readFileSync('service-worker.js', 'utf8');
  assert.ok(html.includes('rel="manifest"'));
  assert.ok(html.includes('id="installAppBtn"'));
  assert.ok(html.includes('id="installDialog"'));
  assert.ok(html.includes('iPhone / iPad'));
  assert.equal(manifest.display, 'standalone');
  assert.ok(manifest.icons.length > 0);
  assert.match(js, /beforeinstallprompt/);
  assert.match(js, /installInstructions/);
  assert.match(js, /showInstallInstructions/);
  assert.match(js, /serviceWorker\.register/);
  assert.match(worker, /cache\.addAll\(APP_SHELL\)/);
  assert.match(worker, /caches\.match/);
});
