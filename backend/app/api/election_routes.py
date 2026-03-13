from fastapi import APIRouter, Depends, Query, status

from ..core.dependencies import require_roles
from ..schemas.election_schema import ElectionCreate, ElectionResponse, ElectionStatusUpdate
from ..services.audit_service import AuditService
from ..services.election_service import ElectionService

router = APIRouter(prefix="/elections", tags=["Elections"])
service = ElectionService()
audit_service = AuditService()


@router.post("/", response_model=ElectionResponse, status_code=status.HTTP_201_CREATED)
def create_election(
    payload: ElectionCreate,
    current_user: dict = Depends(require_roles("admin")),
) -> ElectionResponse:
    election = service.create_election(payload)
    audit_service.record_event(
        action="election.create",
        entity_type="election",
        actor_voter_id=current_user["voter_id"],
        actor_role=current_user["role"],
        entity_id=election.election_id,
        details={"name": election.name, "status": election.status},
    )
    return election


@router.get("/", response_model=list[ElectionResponse])
def list_elections(status: str | None = Query(default=None)) -> list[ElectionResponse]:
    return service.list_elections(status)


@router.get("/{election_id}", response_model=ElectionResponse)
def get_election(election_id: str) -> ElectionResponse:
    return service.get_election(election_id)


@router.patch("/{election_id}/status", response_model=ElectionResponse)
def update_status(
    election_id: str,
    payload: ElectionStatusUpdate,
    current_user: dict = Depends(require_roles("admin")),
) -> ElectionResponse:
    election = service.update_status(election_id, payload)
    audit_service.record_event(
        action="election.status_update",
        entity_type="election",
        actor_voter_id=current_user["voter_id"],
        actor_role=current_user["role"],
        entity_id=election.election_id,
        details={"status": election.status, "start_date": election.start_date, "end_date": election.end_date},
    )
    return election
