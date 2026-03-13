from fastapi import APIRouter, Depends, HTTPException, status

from ..core.dependencies import get_current_user, require_roles
from ..services.audit_service import AuditService
from ..services.blockchain_service import BlockchainService

router = APIRouter(prefix="/blockchain", tags=["Blockchain"])
service = BlockchainService()
audit_service = AuditService()


@router.get("/chain")
def get_chain(_user: dict = Depends(get_current_user)) -> list:
    return service.get_chain()


@router.get("/stats")
def get_stats(_user: dict = Depends(get_current_user)) -> dict:
    return service.get_stats()


@router.get("/validate")
def validate_chain(_user: dict = Depends(get_current_user)) -> dict:
    return {"is_valid": service.validate_chain()}


@router.get("/pending")
def get_pending(_user: dict = Depends(require_roles("admin"))) -> list:
    return service.get_pending_transactions()


@router.post("/mine")
def mine_pending(current_user: dict = Depends(require_roles("admin"))) -> dict:
    result = service.mine_pending()
    if result is None:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="No pending transactions to mine")
    audit_service.record_event(
        action="blockchain.mine",
        entity_type="block",
        actor_voter_id=current_user["voter_id"],
        actor_role=current_user["role"],
        entity_id=str(result["index"]),
        details={"hash": result["hash"], "transactions_count": result["transactions_count"]},
    )
    return result


@router.get("/blocks/{index}")
def get_block(index: int, _user: dict = Depends(get_current_user)) -> dict:
    block = service.get_block(index)
    if block is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Block not found")
    return block
