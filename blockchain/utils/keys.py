import hashlib
import json
from ecdsa import SigningKey, VerifyingKey, SECP256k1
from ecdsa.util import sigencode_der, sigdecode_der


class Wallet:
    def __init__(self, private_key_hex: str | None = None) -> None:
        """
        Initialize a wallet. If a private_key is provided, loads it.
        Otherwise generates a new SECP256k1 keypair.
        """
        if private_key_hex:
            self._sk = SigningKey.from_string(bytes.fromhex(private_key_hex), curve=SECP256k1)
        else:
            self._sk = SigningKey.generate(curve=SECP256k1)

        self._vk = self._sk.get_verifying_key()

    @property
    def public_key(self) -> str:
        return self._vk.to_string().hex()

    @property
    def private_key(self) -> str:
        return self._sk.to_string().hex()

    def sign_transaction(self, tx_dict: dict) -> str:
        """
        Takes a transaction dictionary (without the signature), stringifies it deterministically,
        and returns a DER-encoded hex signature.
        """
        # separators=(',', ':') removes spaces to match JS JSON.stringify exactly
        payload = json.dumps(tx_dict, sort_keys=True, separators=(',', ':')).encode("utf-8")
        signature = self._sk.sign(payload, hashfunc=hashlib.sha256, sigencode=sigencode_der)
        return signature.hex()

    @staticmethod
    def verify_signature(public_key_hex: str, signature_hex: str, tx_dict: dict) -> bool:
        """
        Verifies the signature of a deterministically stringified transaction dictionary.
        """
        try:
            vk = VerifyingKey.from_string(bytes.fromhex(public_key_hex), curve=SECP256k1)
            payload = json.dumps(tx_dict, sort_keys=True, separators=(',', ':')).encode("utf-8")
            return vk.verify(
                bytes.fromhex(signature_hex),
                payload,
                hashfunc=hashlib.sha256,
                sigdecode=sigdecode_der,
            )
        except Exception:
            return False
