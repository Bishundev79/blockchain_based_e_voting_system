from ..core.chain_instance import get_chain
from ..core.database import get_connection
from .audit_service import AuditService


class AdminService:
    def __init__(self, audit_service: AuditService | None = None) -> None:
        self.audit_service = audit_service or AuditService()

    def get_dashboard_stats(self) -> dict:
        with get_connection() as conn:
            cursor = conn.cursor()

            cursor.execute("SELECT COUNT(*) FROM voters WHERE role = 'voter'")
            (total_voters,) = cursor.fetchone()

            cursor.execute("SELECT COUNT(*) FROM voters WHERE has_voted = 1 AND role = 'voter'")
            (voters_who_voted,) = cursor.fetchone()

            cursor.execute("SELECT COUNT(*) FROM elections")
            (total_elections,) = cursor.fetchone()

            cursor.execute("SELECT COUNT(*) FROM elections WHERE status = 'active'")
            (active_elections,) = cursor.fetchone()

            cursor.execute("SELECT COUNT(*) FROM candidates")
            (total_candidates,) = cursor.fetchone()

            cursor.execute("SELECT COUNT(*) FROM votes")
            (total_votes,) = cursor.fetchone()

            cursor.close()

        chain = get_chain()
        return {
            "total_voters": total_voters,
            "voters_who_voted": voters_who_voted,
            "total_elections": total_elections,
            "active_elections": active_elections,
            "total_candidates": total_candidates,
            "total_votes_cast": total_votes,
            "blockchain_length": len(chain.chain),
            "pending_transactions": len(chain.mempool),
            "chain_valid": chain.validate_chain(),
        }

    def get_recent_votes(self, limit: int = 20) -> list[dict]:
        with get_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                "SELECT v.vote_id, v.election_id, e.name AS election_name, "
                "v.candidate_id, c.name AS candidate_name, v.tx_hash, v.created_at "
                "FROM votes v "
                "JOIN elections e ON v.election_id = e.election_id "
                "JOIN candidates c ON v.candidate_id = c.candidate_id "
                "ORDER BY v.created_at DESC LIMIT %s",
                (limit,),
            )
            rows = cursor.fetchall()
            cursor.close()
        for row in rows:
            if row.get("created_at"):
                row["created_at"] = row["created_at"].isoformat()
        return rows

    def get_audit_logs(
        self,
        *,
        limit: int = 50,
        actor_voter_id: str | None = None,
        action: str | None = None,
    ) -> list:
        return self.audit_service.list_logs(limit=limit, actor_voter_id=actor_voter_id, action=action)
