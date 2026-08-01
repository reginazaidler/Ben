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

test('reminders have an enabled-by-default sound and a sound test control', () => {
  const html = fs.readFileSync('index.html', 'utf8');
  const js = fs.readFileSync('app.js', 'utf8');
  assert.ok(html.includes('id="soundEnabled"'));
  assert.ok(html.includes('id="testSound"'));
  assert.match(js, /function playReminderSound/);
  assert.match(js, /showActivityNotification[\s\S]*playReminderSound\(\)/);
  assert.match(js, /window\.AudioContext\|\|window\.webkitAudioContext/);
});
