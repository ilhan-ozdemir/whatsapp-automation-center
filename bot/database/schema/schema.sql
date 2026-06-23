PRAGMA journal_mode=WAL;

CREATE TABLE IF NOT EXISTS chats(

    id TEXT PRIMARY KEY,

    name TEXT,

    is_group INTEGER,

    unread_count INTEGER,

    last_message_id TEXT,

    updated_at INTEGER

);

CREATE TABLE IF NOT EXISTS messages(

    id TEXT PRIMARY KEY,

    chat_id TEXT,

    from_me INTEGER,

    body TEXT,

    type TEXT,

    timestamp INTEGER,

    has_media INTEGER,

    media_endpoint TEXT,

    author TEXT,

    forwarded INTEGER,

    status TEXT,

    reply_to TEXT

);

CREATE INDEX IF NOT EXISTS idx_chat
ON messages(chat_id);

CREATE INDEX IF NOT EXISTS idx_time
ON messages(timestamp);
