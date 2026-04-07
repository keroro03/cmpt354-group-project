import os
import psycopg2
import psycopg2.extras
from contextlib import contextmanager


def get_db():
    """Create a new database connection."""
    return psycopg2.connect(os.getenv("DATABASE_URL"))


@contextmanager
def get_cursor(dict_cursor=True):
    """Context manager for database cursor with automatic cleanup."""
    conn = get_db()
    cursor_factory = psycopg2.extras.RealDictCursor if dict_cursor else None
    cur = conn.cursor(cursor_factory=cursor_factory)
    try:
        yield cur, conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        cur.close()
        conn.close()
