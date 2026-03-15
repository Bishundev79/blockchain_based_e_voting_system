import { ec as EC } from "elliptic";
import CryptoJS from "crypto-js";

const ec = new EC("secp256k1");

export class Wallet {
  constructor(privateKeyHex = null) {
    if (privateKeyHex) {
      this.keyPair = ec.keyFromPrivate(privateKeyHex, "hex");
    } else {
      this.keyPair = ec.genKeyPair();
    }
  }

  getPublicKey() {
    // Return uncompressed public key matching python ecdsa default format
    return this.keyPair.getPublic(false, "hex");
  }

  getPrivateKey() {
    return this.keyPair.getPrivate("hex");
  }

  signTransaction(txDict) {
    // Keep it exactly the same as python backend dict sorting
    // Python sorts keys: candidate_id, election_id, timestamp, vote_id, voter_id
    const keys = Object.keys(txDict).sort();
    let sortedDict = {};
    for (let k of keys) {
      sortedDict[k] = txDict[k];
    }
    
    // Hash it using sha256
    const payloadStr = JSON.stringify(sortedDict);
    const hash = CryptoJS.SHA256(payloadStr).toString(CryptoJS.enc.Hex);
    
    // Sign the hash
    const signature = this.keyPair.sign(hash);
    
    // DER-encode the signature matching Python's sigencode_der
    return signature.toDER("hex");
  }
}

export const getOrCreateWallet = () => {
    let pk = localStorage.getItem("voter_private_key");
    if (!pk) {
        const wallet = new Wallet();
        pk = wallet.getPrivateKey();
        localStorage.setItem("voter_private_key", pk);
        return wallet;
    }
    return new Wallet(pk);
};
