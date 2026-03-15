import { useState } from "react";
import { castVote as castVoteService } from "../services/voteService";
import { getOrCreateWallet } from "../utils/crypto";

export const useVoting = () => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [receipt, setReceipt] = useState(null);

  const castVote = async (electionId, candidateId) => {
    setSubmitting(true);
    setError(null);
    try {
      const wallet = getOrCreateWallet();
      const vote_id = crypto.randomUUID();
      const timestamp = new Date().toISOString();
      const voter_id = wallet.getPublicKey();

      const txDict = {
        vote_id,
        voter_id,
        candidate_id: candidateId,
        election_id: electionId,
        timestamp,
      };

      const signature = wallet.signTransaction(txDict);

      const payload = {
        ...txDict,
        signature
      };

      const res = await castVoteService(payload);
      setReceipt(res.data);
      return res.data;
    } catch (err) {
      const errMessage = err.response?.data?.detail || "Vote submission failed.";
      setError(errMessage);
      throw new Error(errMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return { castVote, submitting, error, setError, receipt, setReceipt };
};
