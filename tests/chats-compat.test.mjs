import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import vm from 'node:vm';
import { patchSource, applyPatch, originalSource } from '../bot/scripts/patch-whatsapp.mjs';

const original = originalSource(readFileSync(new URL('../bot/node_modules/whatsapp-web.js/src/util/Injected/Utils.js', import.meta.url), 'utf8'));
const patched = patchSource(original, '1.34.7');
function load(source, collections) {
    const window = { require(name) {
        if (name === 'WAWebCollections') return collections;
        if (name === 'WALinkify') return { findLinks: () => [] };
        if (name === 'WAWebWidFactory') return { createWid: id => id };
        if (name === 'WAWebLidMigrationUtils') return { toPn: id => id };
        throw new Error('Unexpected module: ' + name);
    } };
    const context = { window, exports: {} };
    vm.runInNewContext(source, context);
    context.exports.LoadUtils();
    return window.WWebJS;
}
function fixture(key, cached = true, group = false) {
    const serialized = { id: key, body: 'synthetic fixture', type: 'image', hasMedia: true };
    const message = { serialize: () => ({ ...serialized }), body: serialized.body };
    const chat = { id: { _serialized: 'fixture@g.us' }, lastReceivedKey: key,
        mute: { expiration: 0 }, formattedTitle: 'fixture',
        serialize: () => ({ id: { _serialized: 'fixture@g.us' }, msgs: [{}], timestamp: 123 }) };
    let updated = 0;
    if (group) chat.groupMetadata = { announce: true, serialize: () => ({ participants: [{ id: 'fixture@c.us' }] }) };
    const collections = { Chat: { getModelsArray: () => [chat] },
        GroupMetadata: { update: async () => { updated++; } },
        Msg: { get(id) { if (!id) throw new Error('r'); return cached ? message : undefined; },
            async getMessagesById(ids) { assert.equal(ids[0], key._serialized ?? key.$1); return { messages: [message] }; } } };
    return { collections, serialized, updates: () => updated };
}
test('reproduces r with renamed key; patched cached and fetched chats preserve media IDs', async () => {
    for (const cached of [true, false]) {
        const f = fixture({ id: 'fixture', remote: 'fixture@c.us', $1: 'false_fixture_key' }, cached);
        await assert.rejects(load(original, f.collections).getChats(), /r/);
        const chats = await load(patched, f.collections).getChats();
        assert.equal(chats.length, 1);
        assert.equal(chats[0].lastMessage.id._serialized, 'false_fixture_key');
        assert.equal(chats[0].lastMessage.hasMedia, true);
        assert.equal(chats[0].lastMessage.id.id, 'fixture');
        assert.equal(f.serialized.id._serialized, undefined);
    }
});
test('legacy key takes precedence; group metadata and empty chats preserved', async () => {
    const f = fixture({ _serialized: 'legacy', $1: 'alternate', id: 'fixture', remote: 'fixture@c.us' }, true, true);
    const api = load(patched, f.collections);
    const chats = await api.getChats();
    assert.equal(chats[0].lastMessage.id._serialized, 'legacy');
    assert.equal(chats[0].isGroup, true);
    assert.equal(chats[0].isReadOnly, true);
    assert.equal(f.updates(), 1);
    f.collections.Chat.getModelsArray = () => [{ serialize: () => ({ msgs: [] }) }];
    assert.equal((await api.getChats())[0].lastMessage, null);
});
test('unrelated and malformed-key failures reject the complete list', async () => {
    const f = fixture({ id: 'fixture', remote: 'fixture@c.us' });
    await assert.rejects(load(patched, f.collections).getChats(), /r/);
    f.collections.Msg.get = () => { throw new Error('lookup failure'); };
    await assert.rejects(load(patched, f.collections).getChats(), /lookup failure/);
});
test('installation is idempotent and refuses version or source drift before writing', () => {
    const root = mkdtempSync(join(tmpdir(), 'wac-patch-'));
    try {
        mkdirSync(join(root, 'src/util/Injected'), { recursive: true });
        const target = join(root, 'src/util/Injected/Utils.js');
        writeFileSync(join(root, 'package.json'), JSON.stringify({ version: '1.34.7' }));
        writeFileSync(target, original);
        applyPatch(root);
        assert.equal(readFileSync(target, 'utf8'), patched);
        applyPatch(root);
        assert.equal(readFileSync(target, 'utf8'), patched);
        writeFileSync(target, patched + '\n// drift');
        assert.throws(() => applyPatch(root), /source mismatch/);
        assert.equal(readFileSync(target, 'utf8'), patched + '\n// drift');
        assert.throws(() => patchSource(original, '1.34.8'), /version/);
    } finally { rmSync(root, { recursive: true, force: true }); }
});
