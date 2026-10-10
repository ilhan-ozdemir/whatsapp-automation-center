from contextlib import closing
import sqlite3
import tempfile
import unittest
from pathlib import Path

class SchemaTests(unittest.TestCase):
    def test_schema_and_persistence(self):
        schema = (Path(__file__).resolve().parents[1] / 'bot/database/schema/schema.sql').read_text()
        with tempfile.TemporaryDirectory() as directory:
            filename = Path(directory) / 'app.db'
            with closing(sqlite3.connect(filename)) as db:
                db.execute('PRAGMA journal_mode=WAL')
                db.executescript(schema)
                db.execute('CREATE TABLE persistence_probe(value TEXT)')
                db.execute('INSERT INTO persistence_probe VALUES (?)', ('retained',))
                db.commit()
            with closing(sqlite3.connect(filename)) as db:
                db.executescript(schema)
                self.assertEqual(db.execute('SELECT value FROM persistence_probe').fetchone()[0], 'retained')
                self.assertEqual(db.execute('PRAGMA journal_mode').fetchone()[0], 'wal')
