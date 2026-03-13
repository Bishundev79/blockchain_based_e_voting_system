from ..services.admin_service import AdminService


class AdminController:
    """Admin operations: dashboard metrics and audit views."""

    def __init__(self, service: AdminService | None = None) -> None:
        self.service = service or AdminService()

    def get_dashboard_stats(self) -> dict:
        return self.service.get_dashboard_stats()

    def get_recent_votes(self, limit: int = 20) -> list:
        return self.service.get_recent_votes(limit)

    def get_audit_logs(
        self,
        *,
        limit: int = 50,
        actor_voter_id: str | None = None,
        action: str | None = None,
    ) -> list:
        return self.service.get_audit_logs(limit=limit, actor_voter_id=actor_voter_id, action=action)
