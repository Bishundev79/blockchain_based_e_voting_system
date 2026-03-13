from fastapi import APIRouter, Depends, Query

from ..controllers.admin_controller import AdminController
from ..core.dependencies import require_roles
from ..schemas.audit_schema import AuditLogResponse

router = APIRouter(prefix="/admin", tags=["Admin"])
controller = AdminController()


@router.get("/dashboard")
def admin_dashboard(_user: dict = Depends(require_roles("admin"))) -> dict:
    return controller.get_dashboard_stats()


@router.get("/recent-votes")
def recent_votes(
    limit: int = Query(default=20, ge=1, le=100),
    _user: dict = Depends(require_roles("admin")),
) -> list:
    return controller.get_recent_votes(limit)


@router.get("/audit-logs", response_model=list[AuditLogResponse])
def audit_logs(
    limit: int = Query(default=50, ge=1, le=200),
    actor_voter_id: str | None = Query(default=None),
    action: str | None = Query(default=None),
    _user: dict = Depends(require_roles("admin")),
) -> list[AuditLogResponse]:
    return controller.get_audit_logs(limit=limit, actor_voter_id=actor_voter_id, action=action)
