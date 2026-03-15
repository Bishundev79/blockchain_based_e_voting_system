from datetime import datetime
from uuid import uuid4

from fastapi import HTTPException, status
from ..core.database import IntegrityError

from ..core.chain_instance import Transaction, get_chain, persist_chain
from ..core.database import get_connection
from ..schemas.vote_schema import CandidateResult, ElectionResults, VoteCastRequest, VoteResponse


class VotingService:
    def cast_vote(self, voter_id: str, payload: VoteCastRequest) -> VoteResponse:
        election = self._get_election(payload.election_id)
        if not election:
            raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Election not found")
        if election["status"] != "active":
            raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="Election is not active")

        now = datetime.utcnow()

        def _parse_dt(val):
            """Parse an ISO string from SQLite into a datetime, or return None."""
            if val is None:
                return None
            if isinstance(val, datetime):
                return val
            try:
                return datetime.fromisoformat(str(val))
            except ValueError:
                return None

        start_dt = _parse_dt(election.get("start_date"))
        end_dt   = _parse_dt(election.get("end_date"))

        if start_dt and now < start_dt:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="Election has not started yet")
        if end_dt and now > end_dt:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="Election has ended")

        if not self._candidate_in_election(payload.candidate_id, payload.election_id):
            raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="Candidate not in this election")

        if self._has_voted(voter_id, payload.election_id):
            raise HTTPException(status.HTTP_409_CONFLICT, detail="You have already voted in this election")

        # Now constructing the transaction using the client-provided values
        tx = Transaction(
            vote_id=payload.vote_id,
            voter_id=payload.voter_id,  # This must be the public key hex provided by frontend
            candidate_id=payload.candidate_id,
            election_id=payload.election_id,
            signature=payload.signature,
            timestamp=payload.timestamp
        )
        
        # Validate signature before adding to mempool
        if not tx.is_valid(payload.voter_id):
            raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="Transaction signature is invalid")
            
        chain = get_chain()
        chain.add_transaction(tx)
        
        # Persist the mempool state
        persist_chain()
        tx_hash = None

        # Persist vote record and mark voter
        try:
            with get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(
                    "INSERT INTO votes (vote_id, election_id, voter_id, candidate_id, tx_hash, created_at) "
                    "VALUES (%s, %s, %s, %s, %s, %s)",
                    (payload.vote_id, payload.election_id, voter_id, payload.candidate_id, tx_hash, payload.timestamp),
                )
                conn.commit()
                cursor.close()
        except IntegrityError as exc:
            raise HTTPException(status.HTTP_409_CONFLICT, detail="You have already voted in this election") from exc

        return VoteResponse(
            vote_id=payload.vote_id,
            election_id=payload.election_id,
            candidate_id=payload.candidate_id,
            tx_hash=tx_hash,
            created_at=datetime.fromisoformat(payload.timestamp),
        )

    def get_results(self, election_id: str) -> ElectionResults:
        election = self._get_election(election_id)
        if not election:
            raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Election not found")

        with get_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                "SELECT candidate_id, name, party FROM candidates WHERE election_id = %s",
                (election_id,),
            )
            candidates = cursor.fetchall()
            cursor.close()

        # Tally results directly from the blockchain for verifiable transparency
        chain = get_chain()
        if not chain.validate_chain():
            raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Blockchain data integrity check failed.")

        tally = {c["candidate_id"]: 0 for c in candidates}
        for block in chain.chain:
            for tx in block.transactions:
                if tx.election_id == election_id and tx.candidate_id in tally:
                    # Depending on security logic, you might also `tx.is_valid()` again here.
                    tally[tx.candidate_id] += 1

        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM voters WHERE role = 'voter'")
            (total_voters,) = cursor.fetchone()
            cursor.close()

        total_votes = sum(tally.values())
        results = [
            CandidateResult(
                candidate_id=c["candidate_id"],
                candidate_name=c["name"],
                party=c.get("party"),
                votes=tally.get(c["candidate_id"], 0),
                percentage=round(tally.get(c["candidate_id"], 0) / total_votes * 100, 2) if total_votes else 0.0,
            )
            for c in candidates
        ]
        results.sort(key=lambda r: r.votes, reverse=True)

        return ElectionResults(
            election_id=election_id,
            election_name=election["name"],
            total_votes=total_votes,
            total_voters=total_voters,
            turnout_percentage=round(total_votes / total_voters * 100, 2) if total_voters else 0.0,
            results=results,
        )

    # ── private helpers ────────────────────────────────────────────────────────

    def _get_election(self, election_id: str) -> dict | None:
        with get_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                "SELECT election_id, name, status, start_date, end_date FROM elections WHERE election_id = %s",
                (election_id,),
            )
            row = cursor.fetchone()
            cursor.close()
        return row

    def _candidate_in_election(self, candidate_id: str, election_id: str) -> bool:
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT 1 FROM candidates WHERE candidate_id = %s AND election_id = %s",
                (candidate_id, election_id),
            )
            result = cursor.fetchone()
            cursor.close()
        return result is not None

    def _has_voted(self, voter_id: str, election_id: str) -> bool:
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT 1 FROM votes WHERE voter_id = %s AND election_id = %s",
                (voter_id, election_id),
            )
            result = cursor.fetchone()
            cursor.close()
        return result is not None
