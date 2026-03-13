from contextlib import contextmanager

from mysql.connector import pooling

from .config import settings

POOL_NAME = "evoting_pool"
POOL_SIZE = 5

connection_pool = pooling.MySQLConnectionPool(
    pool_name=POOL_NAME,
    pool_size=POOL_SIZE,
    host=settings.mysql_host,
    port=settings.mysql_port,
    user=settings.mysql_user,
    password=settings.mysql_password,
    database=settings.mysql_database,
    charset="utf8mb4",
)


@contextmanager
def get_connection():
    conn = connection_pool.get_connection()
    try:
        yield conn
    finally:
        conn.close()


def _safe_alter(cursor, sql: str) -> None:
    """Run an ALTER TABLE silently – ignores errors when column/key already exists."""
    try:
        cursor.execute(sql)
    except Exception:
        pass


def init_tables() -> None:
    # NOTE: elections must be created before candidates (FK dependency).
    voter_table_sql = """
        CREATE TABLE IF NOT EXISTS voters (
            voter_id          VARCHAR(64)  PRIMARY KEY,
            name              VARCHAR(255) NOT NULL,
            email             VARCHAR(255) NOT NULL UNIQUE,
            password_hash     VARCHAR(255) NOT NULL,
            role              VARCHAR(32)  NOT NULL DEFAULT 'voter',
            has_voted         TINYINT(1)   NOT NULL DEFAULT 0,
            registration_date DATETIME     NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    """

    elections_table_sql = """
        CREATE TABLE IF NOT EXISTS elections (
            election_id VARCHAR(64)  PRIMARY KEY,
            name        VARCHAR(255) NOT NULL,
            status      VARCHAR(32)  NOT NULL DEFAULT 'draft',
            start_date  DATETIME     NULL,
            end_date    DATETIME     NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    """

    candidates_table_sql = """
        CREATE TABLE IF NOT EXISTS candidates (
            candidate_id VARCHAR(64)  PRIMARY KEY,
            election_id  VARCHAR(64)  NOT NULL,
            name         VARCHAR(255) NOT NULL,
            party        VARCHAR(255) NULL,
            description  TEXT         NULL,
            FOREIGN KEY (election_id) REFERENCES elections(election_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    """

    votes_table_sql = """
        CREATE TABLE IF NOT EXISTS votes (
            vote_id      VARCHAR(64) PRIMARY KEY,
            election_id  VARCHAR(64) NOT NULL,
            voter_id     VARCHAR(64) NOT NULL,
            candidate_id VARCHAR(64) NOT NULL,
            tx_hash      VARCHAR(64) NULL,
            created_at   DATETIME    NOT NULL,
            FOREIGN KEY (voter_id)     REFERENCES voters(voter_id),
            FOREIGN KEY (election_id)  REFERENCES elections(election_id),
            FOREIGN KEY (candidate_id) REFERENCES candidates(candidate_id),
            UNIQUE KEY uq_voter_election (voter_id, election_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    """

    audit_logs_table_sql = """
        CREATE TABLE IF NOT EXISTS audit_logs (
            log_id          VARCHAR(64)  PRIMARY KEY,
            actor_voter_id  VARCHAR(64)  NULL,
            actor_role      VARCHAR(32)  NULL,
            action          VARCHAR(128) NOT NULL,
            entity_type     VARCHAR(64)  NOT NULL,
            entity_id       VARCHAR(64)  NULL,
            details_json    LONGTEXT     NOT NULL,
            created_at      DATETIME     NOT NULL,
            INDEX idx_audit_created_at (created_at),
            INDEX idx_audit_actor (actor_voter_id),
            INDEX idx_audit_action (action)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    """

    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(voter_table_sql)
        cursor.execute(elections_table_sql)
        cursor.execute(candidates_table_sql)
        cursor.execute(votes_table_sql)
        cursor.execute(audit_logs_table_sql)
        # Migrations: add columns that may be missing from older installs
        _safe_alter(cursor, "ALTER TABLE candidates ADD COLUMN election_id VARCHAR(64) NOT NULL DEFAULT ''")
        _safe_alter(cursor, "ALTER TABLE candidates ADD COLUMN description TEXT NULL")
        _safe_alter(cursor, "ALTER TABLE votes ADD COLUMN tx_hash VARCHAR(64) NULL")
        _safe_alter(cursor, "ALTER TABLE audit_logs ADD COLUMN actor_voter_id VARCHAR(64) NULL")
        _safe_alter(cursor, "ALTER TABLE audit_logs ADD COLUMN actor_role VARCHAR(32) NULL")
        _safe_alter(cursor, "ALTER TABLE audit_logs ADD COLUMN entity_id VARCHAR(64) NULL")
        _safe_alter(cursor, "ALTER TABLE audit_logs ADD COLUMN details_json LONGTEXT NOT NULL")
        conn.commit()
        cursor.close()


init_tables()
