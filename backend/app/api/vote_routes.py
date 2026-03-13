from fastapi import APIRouter, Depends, status

from ..controllers.vote_controller import VoteController
from ..core.dependencies import get_current_user, require_roles
from ..schemas.vote_schema import ElectionResults, VoteCastRequest, VoteResponse
from ..services.audit_service import AuditService

router = APIRouter(prefix="/votes", tags=["Votes"])
controller = VoteController()
audit_service = AuditService()


@router.post("/cast", response_model=VoteResponse, status_code=status.HTTP_201_CREATED)
def cast_vote(
    payload: VoteCastRequest,
    current_user: dict = Depends(require_roles("voter")),
) -> VoteResponse:
    vote = controller.cast_vote(current_user["voter_id"], payload)
    audit_service.record_event(
        action="vote.cast",
        entity_type="vote",
        actor_voter_id=current_user["voter_id"],
        actor_role=current_user["role"],
        entity_id=vote.vote_id,
        details={"election_id": vote.election_id, "candidate_id": vote.candidate_id, "tx_hash": vote.tx_hash},
    )
    return vote


@router.get("/results/{election_id}", response_model=ElectionResults)
def get_results(
    election_id: str,
    _user: dict = Depends(get_current_user),
) -> ElectionResults:
    return controller.get_results(election_id)
