/* End-to-end check against the local server; only creates and removes its own fixtures. */
const assert = require('node:assert/strict');
const { randomBytes } = require('node:crypto');
const mongoose = require('mongoose');
const dns = require('node:dns');
process.loadEnvFile();
const origin = process.env.TEST_APP_URL || 'http://localhost:3001';
const tag = randomBytes(5).toString('hex');
const emails = [`cookbook-test-${tag}@example.com`, `cookbook-test-other-${tag}@example.com`];
const password = randomBytes(8).toString('hex');
const ids = [];
const request = async (path, options = {}) => {
  const response = await fetch(origin + path, options);
  return { response, body: await response.json() };
};
async function register(index) {
  const result = await request('/api/sign-up', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'CookBook test', username: `test_${tag}${index}`, email: emails[index], password }) });
  assert.equal(result.response.status, 201, result.body.message);
}
async function login(email) {
  const cookies = new Map();
  const capture = response => { for (const cookie of response.headers.getSetCookie()) { const first = cookie.split(';')[0]; const i = first.indexOf('='); cookies.set(first.slice(0, i), first.slice(i + 1)); } };
  const header = () => Array.from(cookies, ([key, value]) => `${key}=${value}`).join('; ');
  const csrf = await request('/api/auth/csrf'); capture(csrf.response);
  const auth = await request('/api/auth/callback/credentials', { method: 'POST', headers: { Cookie: header(), 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ csrfToken: csrf.body.csrfToken, identifier: email, password, json: 'true', callbackUrl: origin + '/dashboard' }) });
  capture(auth.response);
  assert.ok(!auth.body.url?.includes('error='), 'Credential sign-in failed');
  const session = await request('/api/auth/session', { headers: { Cookie: header() } });
  assert.ok(session.body.user?._id, 'Session must contain a database user id');
  ids.push(session.body.user._id);
  return header();
}
(async () => {
  if (process.env.MONGODB_DNS_SERVERS) { const servers = process.env.MONGODB_DNS_SERVERS.split(','); dns.setServers(servers); dns.promises.setServers(servers); }
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
  try {
    await register(0); await register(1);
    const owner = await login(emails[0]); const other = await login(emails[1]);
    const dup = await request('/api/sign-up', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Duplicate', username: `test_${tag}0`, email: emails[0], password }) });
    assert.equal(dup.response.status, 409);
    const recipe = { title: `Smoke recipe ${tag}`, bodyOfBlog: 'Test recipe: combine ingredients and simmer for ten minutes.' };
    const post = await request('/api/post-blog', { method: 'POST', headers: { Cookie: owner, 'Content-Type': 'application/json' }, body: JSON.stringify(recipe) });
    assert.equal(post.response.status, 200, post.body.message);
    const collection = await request('/api/get-user-blogs', { headers: { Cookie: owner } });
    const blog = collection.body.data.find(item => item.title === recipe.title); assert.ok(blog);
    const update = cookie => request(`/api/update-blog?id=${blog._id}`, { method: 'POST', headers: { Cookie: cookie, 'Content-Type': 'application/json' }, body: JSON.stringify({ ...recipe, title: recipe.title + ' edited' }) });
    assert.equal((await update(other)).response.status, 404, 'Another user must not edit a recipe');
    assert.equal((await request(`/api/delete-blog?id=${blog._id}`, { method: 'DELETE', headers: { Cookie: other } })).response.status, 404);
    assert.equal((await update(owner)).response.status, 200);
    assert.equal((await request(`/api/delete-blog?id=${blog._id}`, { method: 'DELETE', headers: { Cookie: owner } })).response.status, 200);
    console.log('PASS: registration without OTP, immediate sign-in, database session identity, duplicate protection, recipe create/edit/delete, and ownership isolation.');
  } finally {
    await mongoose.connection.db.collection('blogs').deleteMany({ ownedById: { $in: ids.map(id => new mongoose.Types.ObjectId(id)) } });
    await mongoose.connection.db.collection('users').deleteMany({ email: { $in: emails } });
    await mongoose.disconnect();
  }
})().catch(error => { console.error('FAIL:', error.message); process.exitCode = 1; });
