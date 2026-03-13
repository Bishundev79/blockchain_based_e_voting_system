from __future__ import annotations

import json
from datetime import datetime
from uuid import uuid4

from ..core.database import get_connection
from ..schemas.audit_schema import AuditLogResponse


class AuditService:
    """Persist and read audit trail events for sensitive backend actions."""

    def record_event(
        self,
        *,
        action: str,
        entity_type: str,
        actor_voter_id: str | None = None,
        actor_role: str | None = None,
        entity_id: str | None = None,
        details: dict | None = None,
    ) -> None:
        payload = json.dumps(details or {}, default=str)
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO audit_logs "
                "(log_id, actor_voter_id, actor_role, action, entity_type, entity_id, details_json, created_at) "
                "VALUES (%s, %s, %s, %s, %s, %s, %s, %s)",
                (
                    str(uuid4()),
                    actor_voter_id,
                    actor_role,
                    action,
                    entity_type,
                    entity_id,
                    payload,
                    datetime.utcnow(),
                ),
            )
            conn.commit()
            cursor.close()

    def list_logs(
        self,
        *,
        limit: int = 50,
        actor_voter_id: str | None = None,
        action: str | None = None,
    ) -> list[AuditLogResponse]:
        query = (
            "SELECT log_id, actor_voter_id, actor_role, action, entity_type, entity_id, details_json, created_at "
            "FROM audit_logs"
        )
        conditions: list[str] = []
        params: list[object] = []

        if actor_voter_id:
            conditions.append("actor_voter_id = %s")
            params.append(actor_voter_id)
        if action:
            conditions.append("action = %s")
            params.append(action)

        if conditions:
            query += " WHERE " + " AND ".join(conditions)

        query += " ORDER BY created_at DESC LIMIT %s"
        params.append(limit)

        with get_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            cursor.execute(query, tuple(params))
            rows = cursor.fetchall()
            cursor.close()

        return [self._serialize(row) for row in rows]

    @staticmethod
    def _serialize(row: dict) -> AuditLogResponse:
        details_raw = row.get("details_json") or "{}"
        try:
            details = json.loads(details_raw)
        except json.JSONDecodeError:
            details = {"raw": details_raw}

        return AuditLogResponse(
            log_id=row["log_id"],
            actor_voter_id=row.get("actor_voter_id"),
            actor_role=row.get("actor_role"),
            action=row["action"],
            entity_type=row["entity_type"],
            entity_id=row.get("entity_id"),
            details=details,
            created_at=row["created_at"],
        )
