from fastapi import APIRouter, Depends, Query, status

from ..controllers.candidate_controller import CandidateController
from ..core.dependencies import get_current_user, require_roles
from ..schemas.candidate_schema import CandidateCreate, CandidateResponse, CandidateUpdate
from ..services.audit_service import AuditService

router = APIRouter(prefix="/candidates", tags=["Candidates"])
controller = CandidateController()
audit_service = AuditService()


@router.get("/", response_model=list[CandidateResponse])
def list_candidates(
    election_id: str | None = Query(default=None),
    _user: dict = Depends(get_current_user),
) -> list[CandidateResponse]:
    return controller.list_candidates(election_id)


@router.get("/{candidate_id}", response_model=CandidateResponse)
def get_candidate(
    candidate_id: str,
    _user: dict = Depends(get_current_user),
) -> CandidateResponse:
    return controller.get_candidate(candidate_id)


@router.post("/", response_model=CandidateResponse, status_code=status.HTTP_201_CREATED)
def create_candidate(
    payload: CandidateCreate,
    current_user: dict = Depends(require_roles("admin")),
) -> CandidateResponse:
    candidate = controller.create_candidate(payload)
    audit_service.record_event(
        action="candidate.create",
        entity_type="candidate",
        actor_voter_id=current_user["voter_id"],
        actor_role=current_user["role"],
        entity_id=candidate.candidate_id,
        details={"election_id": candidate.election_id, "name": candidate.name},
    )
    return candidate


@router.patch("/{candidate_id}", response_model=CandidateResponse)
def update_candidate(
    candidate_id: str,
    payload: CandidateUpdate,
    current_user: dict = Depends(require_roles("admin")),
) -> CandidateResponse:
    candidate = controller.update_candidate(candidate_id, payload)
    audit_service.record_event(
        action="candidate.update",
        entity_type="candidate",
        actor_voter_id=current_user["voter_id"],
        actor_role=current_user["role"],
        entity_id=candidate.candidate_id,
        details={"election_id": candidate.election_id, "name": candidate.name},
    )
    return candidate


@router.delete("/{candidate_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_candidate(
    candidate_id: str,
    current_user: dict = Depends(require_roles("admin")),
) -> None:
    controller.delete_candidate(candidate_id)
    audit_service.record_event(
        action="candidate.delete",
        entity_type="candidate",
        actor_voter_id=current_user["voter_id"],
        actor_role=current_user["role"],
        entity_id=candidate_id,
    )
