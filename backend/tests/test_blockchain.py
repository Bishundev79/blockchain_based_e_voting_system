import pytest
from blockchain.core.block import Block
from blockchain.core.transaction import Transaction
from blockchain.core.blockchain import Blockchain
from blockchain.utils.keys import Wallet

@pytest.fixture
def test_chain():
    # Difficulty 1 for fast testing
    return Blockchain(difficulty=1)

@pytest.fixture
def wallets():
    return {
        "voter1": Wallet(),
        "voter2": Wallet(),
    }

def test_genesis_block_creation(test_chain):
    assert len(test_chain.chain) == 0
    genesis = test_chain.create_genesis_block()
    assert len(test_chain.chain) == 1
    assert genesis.index == 0
    assert genesis.previous_hash == "0" * 64

def test_add_transaction_to_mempool(test_chain, wallets):
    wallet = wallets["voter1"]
    tx = Transaction(
        vote_id="test-vote-1",
        voter_id=wallet.public_key,
        candidate_id="cand-1",
        election_id="elec-1",
        signature=""
    )
    tx.signature = wallet.sign_transaction(tx.to_signable_dict())
    
    assert tx.is_valid(wallet.public_key)
    test_chain.add_transaction(tx)
    assert len(test_chain.mempool) == 1

def test_mine_pending_transactions(test_chain, wallets):
    test_chain.create_genesis_block()
    
    wallet1 = wallets["voter1"]
    tx1 = Transaction("v1", wallet1.public_key, "c1", "e1", "")
    tx1.signature = wallet1.sign_transaction(tx1.to_signable_dict())
    test_chain.add_transaction(tx1)

    wallet2 = wallets["voter2"]
    tx2 = Transaction("v2", wallet2.public_key, "c2", "e1", "")
    tx2.signature = wallet2.sign_transaction(tx2.to_signable_dict())
    test_chain.add_transaction(tx2)

    assert len(test_chain.mempool) == 2
    
    # Mine
    mined_block = test_chain.mine_pending_transactions()
    
    # Mempool should be empty now
    assert len(test_chain.mempool) == 0
    assert len(test_chain.chain) == 2 # Genesis + new block
    assert test_chain.chain[-1] == mined_block
    assert len(mined_block.transactions) == 2
    
def test_validate_chain(test_chain, wallets):
    # Ensure empty chain adds genesis
    test_chain.create_genesis_block()

    wallet = wallets["voter1"]
    tx = Transaction("v1", wallet.public_key, "c1", "e1", "")
    tx.signature = wallet.sign_transaction(tx.to_signable_dict())
    test_chain.add_transaction(tx)
    test_chain.mine_pending_transactions()

    # The chain should initially be valid
    assert test_chain.validate_chain() is True

    # Tamper with the candidate ID of the transaction in the last block
    last_block = test_chain.chain[-1]
    last_block.transactions[0].candidate_id = "c3-tampered"
    
    # Validation should now fail because signature doesn't match data
    assert test_chain.validate_chain() is False

def test_invalid_previous_hash_linkage(test_chain, wallets):
    test_chain.create_genesis_block()
    
    # Add a mock transaction so it mines a block
    wallet = wallets["voter1"]
    tx = Transaction("v1", wallet.public_key, "c1", "e1", "")
    tx.signature = wallet.sign_transaction(tx.to_signable_dict())
    test_chain.add_transaction(tx)
    
    # Create block 1
    test_chain.mine_pending_transactions()
    
    assert test_chain.validate_chain() is True

    # Tamper with the linkage
    test_chain.chain[1].previous_hash = "bad_hash_link"

    assert test_chain.validate_chain() is False
