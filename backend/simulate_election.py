import urllib.request
import json
import urllib.error
import random
import string
import time
import sys
import uuid
import datetime
from pathlib import Path

# Add project root to path to import blockchain package
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from blockchain.utils.keys import Wallet

base_url = "http://localhost:8000/api"

def make_request(method, endpoint, payload=None, token=None):
    url = f"{base_url}{endpoint}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    data = json.dumps(payload).encode() if payload else None
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    
    while True:
        try:
            with urllib.request.urlopen(req) as response:
                return json.loads(response.read().decode())
        except urllib.error.HTTPError as e:
            err_text = e.read().decode()
            if e.code == 429:
                print("Rate limited, sleeping 5 seconds...")
                time.sleep(5)
                continue
            elif e.code == 409 and "already voted" in err_text:
                return None
            else:
                print(f"Error {e.code} on {endpoint}: {err_text}")
                return None

# 1. Login as admin
print("Logging in as admin...")
admin_auth = make_request("POST", "/auth/login", {"email": "admin@evoting.com", "password": "Admin@12345"})
if not admin_auth:
    print("Failed to login as admin.")
    sys.exit(1)
admin_token = admin_auth["access_token"]

# 2. Get active elections or create one
elections = make_request("GET", "/elections?status=active", token=admin_token)
if not elections:
    print("No active elections found. Creating a sample election...")
    election = make_request("POST", "/elections", {
        "name": "General Election 2026",
        "description": "Electing the new president.",
        "status": "active"
    }, token=admin_token)
    
    # Create candidates
    print("Creating candidates for the election...")
    for name, party in [("Alice Smith", "Party A"), ("Bob Jones", "Party B"), ("Charlie Brown", "Independent")]:
        make_request("POST", "/candidates", {
            "election_id": election["election_id"],
            "name": name,
            "party": party,
            "description": "A great candidate."
        }, token=admin_token)
    
    elections = make_request("GET", "/elections?status=active", token=admin_token)
    if not elections:
        print("Failed to setup sample election.")
        sys.exit(1)

# 3. Get candidates for each election
election_candidates = {}
for el in elections:
    cands = make_request("GET", f"/candidates?election_id={el['election_id']}", token=admin_token)
    if cands:
        election_candidates[el["election_id"]] = [c["candidate_id"] for c in cands]

if not any(election_candidates.values()):
    print("No candidates found in the active elections.")
    sys.exit(1)

# 4. Generate voters, register, login, and vote
num_voters = 30
print(f"Simulating {num_voters} voters...")
successful_votes = 0

for i in range(1, num_voters + 1):
    suffix = "".join(random.choices(string.ascii_lowercase + string.digits, k=4))
    email = f"simvoter_{i}_{suffix}@example.com"
    password = "SimPassword123!"
    name = f"Simulated Voter {i}"
    
    # Register
    make_request("POST", "/auth/register", {"name": name, "email": email, "password": password})
    
    # Login
    auth = make_request("POST", "/auth/login", {"email": email, "password": password})
    if not auth:
        continue
    token = auth["access_token"]
    
    # Cast votes
    for eid, cand_ids in election_candidates.items():
        if not cand_ids:
            continue
        chosen_cand = random.choice(cand_ids)

        # Generate a wallet to simulate a frontend client making the vote
        wallet = Wallet()
        vote_id = str(uuid.uuid4())
        timestamp = datetime.datetime.utcnow().isoformat()
        
        tx_payload = {
            "vote_id": vote_id,
            "voter_id": wallet.public_key,
            "candidate_id": chosen_cand,
            "election_id": eid,
            "timestamp": timestamp,
        }
        signature = wallet.sign_transaction(tx_payload)
        
        tx_payload["signature"] = signature

        vote_res = make_request("POST", "/votes/cast", tx_payload, token=token)
        if vote_res:
            successful_votes += 1
            print(f"Voter {i} voted in election {eid[:8]}...")

# 5. Mine all the pending transactions
print("\nMining the blocks...")
mine_res = make_request("POST", "/blockchain/mine", token=admin_token)
if mine_res:
    print(f"Mined block Hash: {mine_res['hash']}")
    print(f"Transactions included: {mine_res['transactions_count']}")
else:
    print("No pending transactions or mining failed.")

print(f"\nSimulation complete! Successfully cast {successful_votes} votes.")
