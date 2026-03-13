from datetime import datetime, timedelta
from uuid import uuid4

import bcrypt
from fastapi import HTTPException, status
from mysql.connector import IntegrityError

from ..core.config import settings
from ..core.database import get_connection
from ..core.security import create_access_token
from ..schemas.auth_schema import LoginRequest, RegisterRequest
from .audit_service import AuditService


class AuthService:
    def __init__(self, audit_service: AuditService | None = None) -> None:
        self.audit_service = audit_service or AuditService()

    def register_voter(self, payload: RegisterRequest) -> dict:
        email = payload.email.lower()
        password_hash = bcrypt.hashpw(payload.password.encode("utf-8"), bcrypt.gensalt()).decode()
        voter_id = str(uuid4())
        registration_date = datetime.utcnow()

        insert_sql = (
            "INSERT INTO voters (voter_id, name, email, password_hash, role, has_voted, registration_date) "
            "VALUES (%s, %s, %s, %s, %s, %s, %s)"
        )
        values = (
            voter_id,
            payload.name.strip(),
            email,
            password_hash,
            "voter",
            0,
            registration_date,
        )

        try:
            with get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(insert_sql, values)
                conn.commit()
                cursor.close()
        except IntegrityError as exc:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="Email already registered") from exc

        self.audit_service.record_event(
            action="auth.register",
            entity_type="voter",
            actor_voter_id=voter_id,
            actor_role="voter",
            entity_id=voter_id,
            details={"email": email},
        )

        return {
            "voter_id": voter_id,
            "email": email,
            "role": "voter",
            "has_voted": False,
            "registration_date": registration_date,
        }

    def authenticate(self, credentials: LoginRequest) -> dict:
        email = credentials.email.lower()
        query = "SELECT voter_id, password_hash, role FROM voters WHERE email = %s"
        with get_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            cursor.execute(query, (email,))
            voter = cursor.fetchone()
            cursor.close()

        if not voter:
            self.audit_service.record_event(
                action="auth.login_failed",
                entity_type="auth",
                details={"email": email, "reason": "unknown_email"},
            )
            raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

        stored_hash = voter.get("password_hash")
        if not stored_hash or not bcrypt.checkpw(credentials.password.encode("utf-8"), stored_hash.encode("utf-8")):
            self.audit_service.record_event(
                action="auth.login_failed",
                entity_type="auth",
                actor_voter_id=voter.get("voter_id"),
                actor_role=voter.get("role", "voter"),
                details={"email": email, "reason": "invalid_password"},
            )
            raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

        auth_payload = self._issue_access_token(voter_id=voter["voter_id"], role=voter.get("role", "voter"))
        self.audit_service.record_event(
            action="auth.login",
            entity_type="auth",
            actor_voter_id=voter["voter_id"],
            actor_role=voter.get("role", "voter"),
            entity_id=voter["voter_id"],
            details={"email": email},
        )
        return auth_payload

    def refresh_access_token(self, current_user: dict) -> dict:
        auth_payload = self._issue_access_token(
            voter_id=current_user["voter_id"],
            role=current_user.get("role", "voter"),
        )
        self.audit_service.record_event(
            action="auth.refresh",
            entity_type="auth",
            actor_voter_id=current_user["voter_id"],
            actor_role=current_user.get("role", "voter"),
            entity_id=current_user["voter_id"],
        )
        return auth_payload

    def _issue_access_token(self, *, voter_id: str, role: str) -> dict:
        expires_delta = timedelta(minutes=settings.access_token_expire_minutes)
        token = create_access_token(subject=voter_id, role=role, expires_delta=expires_delta)
        return {
            "access_token": token,
            "token_type": "bearer",
            "role": role,
        }
