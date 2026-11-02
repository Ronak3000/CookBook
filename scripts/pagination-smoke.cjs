/* Local HTTP integration check; creates and removes only its own fixture records. */
const assert = require('node:assert/strict');
const { randomBytes } = require('node:crypto');
const mongoose = require('mongoose');
const dns = require('node:dns');
process.loadEnvFile();
const origin = process.env.TEST_APP_URL || 'http://localhost:3001';
const tag = `page_${randomBytes(5).toString('hex')}`;
const emails = [0, 1].map(i => `${tag}_${i}@example.com`);
const password = randomBytes(8).toString('hex');
const recipeIds = [];
const request = async (path, options = {}) => {
  const response = await fetch(origin + path, options);
  return { status: response.status, body: await response.json() };
};
async function registerAndLogin(index) {
  const registration = await request('/api/sign-up', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Pagination fixture', username: `${tag}_${index}`, email: emails[index], password }) });
  assert.equal(registration.status, 201, registration.body.message);
  const cookies = new Map();
  const capture = response => response.headers.getSetCookie().forEach(cookie => { const first = cookie.split(';')[0], pos = first.indexOf('='); cookies.set(first.slice(0, pos), first.slice(pos + 1)); });
  const header = () => Array.from(cookies, ([key, value]) => `${key}=${value}`).join('; ');
  const csrf = await fetch(origin + '/api/auth/csrf'); capture(csrf); const { csrfToken } = await csrf.json();
  const auth = await fetch(origin + '/api/auth/callback/credentials', { method: 'POST', headers: { Cookie: header(), 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ csrfToken, identifier: emails[index], password, json: 'true', callbackUrl: origin + '/dashboard' }) }); capture(auth);
  const session = await request('/api/auth/session', { headers: { Cookie: header() } });
  assert.ok(session.body.user?._id);
  return { id: new mongoose.Types.ObjectId(session.body.user._id), cookie: header() };
}
async function page(params = {}, cookie, endpoint = '/api/get-all-blogs') {
  const result = await request(`${endpoint}?${new URLSearchParams({ q: tag, limit: '5', ...params })}`, { headers: cookie ? { Cookie: cookie } : {} });
  assert.equal(result.status, 200, result.body.message);
  assert.ok(result.body.data.length <= Number(params.limit || 5));
  for (const item of result.body.data) assert.deepEqual(Object.keys(item).sort(), ['_id', 'createdAt', 'title']);
  assert.equal(Boolean(result.body.pagination.nextCursor), result.body.pagination.hasMore);
  return result.body;
}
async function collect(params = {}, cookie, endpoint) {
  const all = []; let cursor;
  for (let count = 0; count < 30; count++) {
    const result = await page({ ...params, ...(cursor ? { cursor } : {}) }, cookie, endpoint);
    all.push(...result.data);
    if (!result.pagination.hasMore) { assert.equal(new Set(all.map(item => item._id)).size, all.length, 'No duplicates across page boundaries'); return all; }
    assert.notEqual(result.pagination.nextCursor, cursor); cursor = result.pagination.nextCursor;
  }
  throw new Error('Pagination did not terminate');
}
(async () => {
  if (process.env.MONGODB_DNS_SERVERS) { const servers = process.env.MONGODB_DNS_SERVERS.split(','); dns.setServers(servers); dns.promises.setServers(servers); }
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
  const blogs = mongoose.connection.db.collection('blogs');
  try {
    const users = [await registerAndLogin(0), await registerAndLogin(1)];
    const fixtures = Array.from({ length: 31 }, (_, i) => ({ _id: new mongoose.Types.ObjectId(), ownedById: users[i % 2].id, title: `${tag} ${i === 30 ? '[chef]+' : i % 3 === 0 ? 'Quick rice' : i % 3 === 1 ? 'Chocolate cake' : 'Garden salad'} ${i}`, bodyOfBlog: 'Pagination fixture, removed after the test.', createdAt: new Date(i < 20 ? '2020-01-01T00:00:00Z' : '2019-01-01T00:00:00Z') }));
    recipeIds.push(...fixtures.map(item => item._id)); await blogs.insertMany(fixtures);
    const expected = fixtures.slice().sort((a, b) => b.createdAt - a.createdAt || String(b._id).localeCompare(String(a._id))).map(item => String(item._id));
    assert.deepEqual((await collect()).map(item => item._id), expected, 'Equal timestamps must have stable ID ordering');
    assert.equal((await collect({ limit: '36' })).length, 31);
    const defaults = await request('/api/get-all-blogs?' + new URLSearchParams({ q: tag })); assert.equal(defaults.body.data.length, 12);
    assert.equal((await collect({ category: 'Sweet treats' })).length, 10, 'Filtering must happen before pagination');
    assert.equal((await collect({ q: `${tag} [chef]+` })).length, 1, 'Search punctuation is literal');
    assert.equal((await collect({ q: `${tag} absent` })).length, 0);
    for (const user of users) {
      const own = await collect({}, user.cookie, '/api/get-user-blogs');
      const ownIds = fixtures.filter(item => item.ownedById.equals(user.id)).map(item => String(item._id));
      assert.equal(own.length, ownIds.length); assert.ok(own.every(item => ownIds.includes(item._id)));
    }
    const otherCursor = (await page({}, users[1].cookie, '/api/get-user-blogs')).pagination.nextCursor;
    const scoped = await page({ cursor: otherCursor }, users[0].cookie, '/api/get-user-blogs');
    assert.ok(scoped.data.every(item => fixtures.find(row => String(row._id) === item._id).ownedById.equals(users[0].id)), 'Cursors cannot change owner scope');
    assert.equal((await request('/api/get-user-blogs')).status, 401);
    for (const invalid of [{ limit: '0' }, { limit: '37' }, { limit: '1.5' }, { limit: 'abc' }, { cursor: 'not-a-cursor' }, { cursor: Buffer.from(JSON.stringify({ date: 'invalid', id: 'x' })).toString('base64url') }, { q: 'x'.repeat(101) }, { category: 'unknown' }]) {
      assert.equal((await request('/api/get-all-blogs?' + new URLSearchParams(invalid))).status, 400);
    }
    const search = await request('/api/search-blog', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ searchWord: tag, limit: 4 }) });
    assert.equal(search.status, 200); assert.equal(search.body.data.length, 4); assert.equal(search.body.pagination.hasMore, true);
    // Removing the cursor row must not break navigation; a newly inserted first row must not duplicate older rows.
    const first = await page(); const anchor = first.data.at(-1)._id;
    await blogs.deleteOne({ _id: new mongoose.Types.ObjectId(anchor) });
    const inserted = { ...fixtures[0], _id: new mongoose.Types.ObjectId(), createdAt: new Date() };
    recipeIds.push(inserted._id); await blogs.insertOne(inserted);
    const remaining = await collect({ cursor: first.pagination.nextCursor });
    assert.deepEqual([...first.data, ...remaining].map(item => item._id), expected);
    console.log('PASS: default/capped pages, tied timestamps, complete traversal, filtered pages, literal search, empty results, owner isolation, malformed inputs, bounded legacy search, and concurrent insert/delete behavior.');
  } finally {
    await blogs.deleteMany({ _id: { $in: recipeIds } });
    await mongoose.connection.db.collection('users').deleteMany({ email: { $in: emails } });
    await mongoose.disconnect();
  }
})().catch(error => { console.error('FAIL:', error.message); process.exitCode = 1; });
