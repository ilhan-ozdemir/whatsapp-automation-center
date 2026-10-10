import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const originalHash = '0d0f88565f481dbfeb9493b04b24033a2cb60f5fd2fd0e84e543b461d98878fe';
const hash = text => createHash('sha256').update(text).digest('hex');
const replacements = [
    ['        const msg = message.serialize();', `        const msg = message.serialize();
        // WAC: only MsgKey's serialized field changed on affected Web builds.
        if (msg.id && msg.id._serialized == null && typeof msg.id.$1 === 'string') {
            msg.id = Object.assign({}, msg.id, { _serialized: msg.id.$1 });
        }`],
    ['        model.lastMessage = null;', `        model.lastMessage = null;
        const lastReceivedId = chat.lastReceivedKey?._serialized ?? chat.lastReceivedKey?.$1;`],
    ['chat.lastReceivedKey._serialized', 'lastReceivedId'],
];

function transform(source) {
    for (const [before, after] of replacements) {
        const expected = before === 'chat.lastReceivedKey._serialized' ? 2 : 1;
        if (source.split(before).length - 1 !== expected) {
            throw new Error('WhatsApp patch source mismatch');
        }
        source = source.split(before).join(after);
    }
    return source;
}

export function originalSource(source) {
    if (hash(source) === originalHash) return source;
    // Validate already-patched files against the complete original, not a marker.
    let restored = source;
    for (const [before, after] of replacements) {
        restored = restored.split(after).join(before);
    }
    if (hash(restored) === originalHash && transform(restored) === source) return restored;
    throw new Error('WhatsApp patch source mismatch');
}

export function patchSource(source, version) {
    if (version !== '1.34.7') throw new Error('WhatsApp patch requires version 1.34.7');
    return transform(originalSource(source));
}

export function applyPatch(packageRoot) {
    const { version } = JSON.parse(readFileSync(resolve(packageRoot, 'package.json'), 'utf8'));
    const target = resolve(packageRoot, 'src/util/Injected/Utils.js');
    const source = readFileSync(target, 'utf8');
    const patched = patchSource(source, version);
    if (patched !== source) writeFileSync(target, patched);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    applyPatch(fileURLToPath(new URL('../node_modules/whatsapp-web.js/', import.meta.url)));
    console.info('WhatsApp 1.34.7 compatibility patch verified');
}
