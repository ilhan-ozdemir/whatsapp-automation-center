import test from 'node:test';
import assert from 'node:assert/strict';
import config from '../bot/config.js';

test('safe defaults independent of current working directory', () => {
    assert.equal(config.BOT_HOST, '127.0.0.1');
    assert.equal(config.BOT_PORT, 3001);
    assert.equal(config.CHROMIUM_NO_SANDBOX, false);
    assert.ok(config.DATABASE_PATH.endsWith('/database/app.db'));
});
test('environment paths and executable override defaults', async () => {
    Object.assign(process.env, {WAC_ROOT:'/tmp/wac-test', DATABASE_PATH:'data/custom.db', SESSION_PATH:'/tmp/session', CHROMIUM_PATH:'/custom/chrome'});
    const {default: c} = await import('../bot/config.js?override-test');
    assert.equal(c.DATABASE_PATH, '/tmp/wac-test/data/custom.db');
    assert.equal(c.SESSION_PATH, '/tmp/session');
    assert.equal(c.CHROMIUM_PATH, '/custom/chrome');
});
