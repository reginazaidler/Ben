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
  assert.ok(html.includes('id="settingsBtn" href="#settings" data-go="settings"'));
  assert.ok(html.includes('id="settingsBtn" href="#settings" data-go="settings"><span aria-hidden="true">⚙️</span> הגדרות'));
  assert.ok(html.includes('הפרופיל, החוגים וההעדפות האישיות במכשיר הזה'));
  assert.ok(html.includes('id="manageAddBtn" href="#add" data-go="add"'));
  for (const id of ['exportSiteData', 'importSiteData', 'resetSiteData', 'resetSiteDialog']) assert.ok(html.includes(`id="${id}"`));
  assert.ok(html.includes('כל הנתונים שלי'));
  assert.ok(!html.includes('מנהל האתר'));
  assert.ok(!html.includes('id="editSiteCopy"'));
  assert.ok(!html.includes('data-site-text'));
  assert.doesNotMatch(js, /contentEditable='true'/);
  assert.doesNotMatch(js, /mySiteTexts|siteTexts|editingSiteCopy/);
  assert.match(js, /function exportSiteData/);
  assert.match(js, /function importSiteData/);
  assert.match(js, /function resetSiteData/);
  assert.ok(html.includes('data-go="settings"><span>⚙️</span>הגדרות'));
  assert.ok(!html.includes('class="home-settings-link"'));
  assert.match(js, /pages=new Set\(\['home','add','week','food','settings'\]\)/);
  assert.match(js, /function pageFromHash/);
  assert.match(js, /goBtn.*preventDefault\(\)/);
  assert.match(js, /localStorage\.setItem\('myProfile'/);
  assert.match(js, /settingsForm.*addEventListener\('submit'/);
  assert.ok(html.includes('id="largeText"'));
  assert.ok(html.includes('id="reduceMotion"'));
  assert.match(js, /applyPreferences/);
  assert.match(js, /largeText:\$\('#largeText'\)\.checked/);
  for (const id of ['avatarChoices', 'themeColor', 'compactCards', 'showShareCard', 'showFoodSection']) assert.ok(html.includes(`id="${id}"`));
  assert.match(js, /document\.body\.dataset\.theme/);
  assert.match(js, /compactCards:\$\('#compactCards'\)\.checked/);
  assert.match(js, /showFoodSection:\$\('#showFoodSection'\)\.checked/);
});

test('notification controls request permission and schedule activity reminders', () => {
  const html = fs.readFileSync('index.html', 'utf8');
  const js = fs.readFileSync('app.js', 'utf8');
  assert.ok(html.includes('id="enableNotifications"'));
  assert.ok(html.includes('id="notificationStatus"'));
  assert.ok(html.includes('id="notificationHelpDialog"'));
  assert.ok(html.includes('הגדרות אתר'));
  assert.ok(html.includes('ליד כתובת האתר'));
  assert.match(js, /Notification\.requestPermission\(\)/);
  assert.match(js, /Notification.permission==='denied'.*notificationHelpDialog/);
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
  assert.equal(manifest.display, 'standalone');
  assert.ok(manifest.icons.length > 0);
  assert.match(js, /beforeinstallprompt/);
  assert.match(js, /serviceWorker\.register/);
  assert.match(js, /controllerchange/);
  assert.match(js, /registration\.update\(\)/);
  assert.match(js, /updateViaCache:'none'/);
  assert.match(worker, /cache\.addAll\(APP_SHELL\)/);
  assert.match(worker, /caches\.match/);
});

test('food list stores favorites for breakfast, lunch, and dinner without suggestions', () => {
  const html = fs.readFileSync('index.html', 'utf8');
  const js = fs.readFileSync('app.js', 'utf8');
  assert.ok(html.includes('id="foodPage"'));
  assert.ok(html.includes('id="foodChoices"'));
  assert.ok(html.includes('id="customFoodForm"'));
  for (const meal of ['ארוחת בוקר', 'ארוחת צהריים', 'ארוחת ערב']) assert.ok(js.includes(meal));
  assert.match(js, /localStorage\.setItem\('myFavoriteFoods'/);
  assert.ok(!html.includes('id="mealSuggestions"'));
  assert.ok(!html.includes('id="shuffleAllMeals"'));
  assert.doesNotMatch(js, /function suggestedFood/);
  assert.doesNotMatch(js, /data-shuffle-meal/);
  assert.doesNotMatch(js, /foodCatalog/);
  for (const suggestion of ['קורנפלקס עם חלב', 'חביתה וירקות', 'פסטה ברוטב עגבניות', 'פיצה']) assert.ok(!js.includes(suggestion));
  assert.ok(html.includes('כאן מופיעים רק המאכלים שהוספת בעצמך'));
});
