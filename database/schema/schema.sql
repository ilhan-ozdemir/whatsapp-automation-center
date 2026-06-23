CREATE TABLE IF NOT EXISTS settings(

    key TEXT PRIMARY KEY,

    value TEXT

);

CREATE TABLE IF NOT EXISTS chats(

    id TEXT PRIMARY KEY,

    name TEXT,

    is_group INTEGER DEFAULT 0,

    unread_count INTEGER DEFAULT 0,

    last_message_id TEXT,

    updated_at INTEGER

);

CREATE TABLE IF NOT EXISTS contacts(

    id TEXT PRIMARY KEY,

    push_name TEXT,

    name TEXT,

    number TEXT,

    avatar TEXT,

    updated_at INTEGER

);

CREATE TABLE IF NOT EXISTS messages(

    id TEXT PRIMARY KEY,

    chat_id TEXT NOT NULL,

    from_me INTEGER,

    body TEXT,

    type TEXT,

    timestamp INTEGER,

    has_media INTEGER DEFAULT 0,

    media_id TEXT,

    author TEXT,

    forwarded INTEGER DEFAULT 0,

    status TEXT,

    reply_to TEXT

);

CREATE INDEX IF NOT EXISTS idx_messages_chat
ON messages(chat_id);

CREATE INDEX IF NOT EXISTS idx_messages_timestamp
ON messages(timestamp);

CREATE TABLE IF NOT EXISTS media(

    id TEXT PRIMARY KEY,

    message_id TEXT,

    mime TEXT,

    filename TEXT,

    local_path TEXT,

    size INTEGER,

    hash TEXT,

    downloaded INTEGER DEFAULT 0

);

CREATE INDEX IF NOT EXISTS idx_media_message
ON media(message_id);
