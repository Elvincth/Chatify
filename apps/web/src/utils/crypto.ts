import {
  Message,
  generateKey,
  createMessage,
  readMessage,
  decrypt,
  encrypt,
  readPrivateKey,
  readKey,
  PrivateKey,
  Key,
  generateSessionKey,
  VerificationResult,
  enums,
  PublicKey,
  decryptKey,
} from "openpgp";
import JSZip from "jszip";

import { encode } from "base64-arraybuffer";

export interface ArmoredKeyPair {
  publicKeyArmored: string;
  privateKeyArmored: string;
  passphrase: string;
}
export interface EncDecMessageParams extends ArmoredKeyPair {
  message: string;
}

export interface PgpEncryptDetails {
  encryptedMessage: string;
  decryptedMessage: string;
  signKey: Key;
  signKeyRaw: string;
  encryptionKeys: PublicKey;
  encryptionKeyRaw: string;
  sessionKeyAlgorithm: string;
  sessionKey: string;
  compressionAlgorithm: string;
}

// Encrypt and sign a message using PGP
export const encryptPgpMessage = async ({
  message,
  publicKeyArmored,
  privateKeyArmored,
  passphrase,
}: EncDecMessageParams) => {
  const { publicKey, privateKey } = await readPgpArmoredKeys({
    publicKeyArmored,
    privateKeyArmored,
    passphrase,
  });

  const _message = await createMessage({ text: message });

  //Generate a random one time session key
  const sessionKey = await generateSessionKey({
    encryptionKeys: publicKey,
  });

  const encrypted = await encrypt({
    sessionKey,
    message: _message,
    encryptionKeys: publicKey,
    signingKeys: privateKey, // optional
    config: { preferredCompressionAlgorithm: enums.compression.zlib },
  });

  const details: PgpEncryptDetails = {
    encryptedMessage: encrypted.toString(),
    decryptedMessage: message,
    sessionKeyAlgorithm: sessionKey.algorithm,
    sessionKey: encode(sessionKey.data),
    compressionAlgorithm: enums
      .read(enums.compression, preferredCompressionAlgorithm)
      .toString(),
    signKey: privateKey,
    signKeyRaw: privateKeyArmored,
    encryptionKeys: publicKey,
    encryptionKeyRaw: publicKeyArmored,
  };

  return { encryptedMessage: encrypted.toString(), details };
};

export interface PgpDecryptDetails {
  encryptedMessage: string;
  decryptedMessage: string;
  parseArmoredMessage: Message<string>;
  verificationKeys: Key;
  verificationKeyRaw: string;
  decryptionKeys: PrivateKey;
  decryptionKeyRaw: string;
  signatures: VerificationResult[];
  sessionKeyAlgorithm: string;
  sessionKey: string;
  compressionAlgorithm: string;
  signatureVerified: boolean;
  decryptionFailed: boolean;
  decryptionFailedReason: string;
}

const preferredCompressionAlgorithm = enums.compression.zlib;

// Decrypt and verify a message using PGP
export const decryptPgpMessage = async ({
  message,
  publicKeyArmored,
  privateKeyArmored,
  passphrase, //Used to decrypt the private key
}: EncDecMessageParams): Promise<PgpDecryptDetails> => {
  //As the saved key is in pem format, so we need to convert it to openpgp format
  //Read the key pairs
  const { publicKey, privateKey } = await readPgpArmoredKeys({
    publicKeyArmored,
    privateKeyArmored,
    passphrase,
  });

  //console.log(publicKey, privateKey);

  const parseArmoredMessage = await readMessage({
    armoredMessage: message,
  });

  //console.log("sessionKey", sessionKey);

  const details: PgpDecryptDetails = {
    encryptedMessage: message,
    decryptionFailed: false,
    decryptedMessage: "",
    parseArmoredMessage: parseArmoredMessage,
    verificationKeys: publicKey,
    decryptionKeys: privateKey,
    signatures: [],
    verificationKeyRaw: publicKeyArmored,
    decryptionKeyRaw: privateKeyArmored,
    sessionKeyAlgorithm: "",
    sessionKey: "",
    compressionAlgorithm: enums
      .read(enums.compression, preferredCompressionAlgorithm)
      .toString(),
    signatureVerified: false,
    decryptionFailedReason: "",
  };

  try {
    const { data: decrypted, signatures } = await decrypt({
      message: parseArmoredMessage,
      verificationKeys: publicKey,
      decryptionKeys: privateKey,
      config: {
        preferredCompressionAlgorithm,
      },
    });

    details.decryptedMessage = decrypted.toString();
    details.signatures = signatures;

    //console.log("signatures", signatures);
  } catch (e) {
    details.decryptionFailed = true;
    //@ts-ignore
    details.decryptionFailedReason =
      "(" +
      (e as string)
        .toString()
        .replace("Error: Error decrypting message: ", "") +
      ")";
    console.log(e);
  }

  //get the session key from the message (preview only)
  if (parseArmoredMessage.packets.length > 0) {
    try {
      //@ts-ignore
      const packet: SymmetricallyEncryptedDataPacket =
        parseArmoredMessage.packets[0];
      //@ts-ignore
      //This is the session key
      const sessionKey: Uint8Array = packet.sessionKey;
      details.sessionKey = encode(sessionKey);
      //Here we can get the algorithm used to encrypt the session key for display purposes
      const sessionKeyAlgorithm: number = packet.sessionKeyAlgorithm;

      details.sessionKeyAlgorithm = enums.read(
        enums.symmetric,
        sessionKeyAlgorithm
      );

      //encode to base64
    } catch (e) {
      console.log("Session key preview fail", e);
    }
  }

  //Here we can verify the signature
  try {
    const signaturesResult = await details.signatures;
    const verified = await signaturesResult[0].verified;

    details.signatureVerified = verified;

    // console.log("signatures", signaturesResult);
    //console.log("signature verified: ", verified);
    return details;
  } catch (e) {
    console.log(e);
    return {
      ...details,
      signatureVerified: false,
    };
  }
};

interface exportAscKeyPair {
  publicKey: string;
  privateKey: string;
  userId: string;
}

//export the key pair in .asc format and zip it
export const exportAscKeyPair = async ({
  publicKey,
  privateKey,
  userId,
}: exportAscKeyPair) => {
  const zip = new JSZip();
  zip.file("public.asc", publicKey);
  zip.file("private.asc", privateKey);

  const content = await zip.generateAsync({ type: "blob" });

  const link = document.createElement("a");
  link.href = window.URL.createObjectURL(content);
  link.download = `${userId}-keys.zip`;
  link.click();
};

//import the key pair from .asc format and unzip it
export const importAscKeyPair = async (file: File) => {
  const zip = await JSZip.loadAsync(file);
  const publicKey = await zip.file("public.asc")?.async("string");
  const privateKey = await zip.file("private.asc")?.async("string");

  return { publicKey, privateKey };
};

//Read the pgp armored keys to object format
export const readPgpArmoredKeys = async ({
  publicKeyArmored,
  privateKeyArmored,
  passphrase, //Decryption the private key by passphrase
}: ArmoredKeyPair) => {
  const publicKey = await readKey({ armoredKey: publicKeyArmored });

  const privateKey = await decryptPrivateKey({
    privateKeyArmored,
    passphrase,
  });

  return { publicKey, privateKey };
};

export interface DecryptPrivateKey {
  privateKeyArmored: string;
  passphrase: string;
}

export const decryptPrivateKey = async ({
  privateKeyArmored,
  passphrase,
}: DecryptPrivateKey) => {
  const decryptedPrivateKey = await decryptKey({
    privateKey: await readPrivateKey({ armoredKey: privateKeyArmored }),
    passphrase,
  });

  return decryptedPrivateKey;
};

export interface GenerateKeyPairParams {
  name: string;
  email: string;
  passphrase?: string;
}

//Gen a new key pair using PGP for the user
export const generatePgpKeyPair = async ({
  name,
  email,
  passphrase, //TODO: add passphrase
}: GenerateKeyPairParams) => {
  const { privateKey, publicKey, revocationCertificate } = await generateKey({
    type: "rsa",
    rsaBits: 4096,
    userIDs: [{ name, email }], // you can pass multiple user IDs
    passphrase, // protects the private key
    format: "armored",
  });

  return { privateKey, publicKey, revocationCertificate };
};

// /***
//  * Previously used for RSA only encryption and decryption
//  * Now change to PGP, but still keep it here for reference
//  */

//  export const generateRsaPair = async () => {
//   const pki = forge.pki;
//   // Generate an RSA key pair in pem format using async
//   const keys = await new Promise<forge.pki.rsa.KeyPair>((resolve, reject) => {
//     pki.rsa.generateKeyPair(
//       {
//         bits: 2048,
//         workers: 2,
//       },
//       (err, keys) => {
//         if (err) {
//           reject(err);
//         } else {
//           resolve(keys);
//         }
//       }
//     );
//   });

//   // convert a Forge private key to PEM format, so we can save it to a local file
//   const publicKey = pki.publicKeyToPem(keys.publicKey);
//   const privateKey = pki.privateKeyToPem(keys.privateKey);

//   return {
//     publicKey,
//     privateKey,
//   };
// };

// //Generate a digital signature using the private key
// //use SHA-1 to hash the message
// //Then  encrypt with RSA using the sender private key
// export const signMessage = (privateKey: string, data: string) => {
//   const pki = forge.pki;
//   const md = forge.md.sha1.create();
//   md.update(data, "utf8");
//   const signature = pki.privateKeyFromPem(privateKey).sign(md);
//   return forge.util.encode64(signature);
// };

// //Verify the digital signature using the public key
// //use SHA-1 to hash the message
// //Then decrypt with RSA using the sender public key
// export const verifyMessage = (
//   publicKey: string,
//   data: string,
//   signature: string
// ) => {
//   const pki = forge.pki;
//   const md = forge.md.sha1.create();
//   md.update(data, "utf8");
//   return pki
//     .publicKeyFromPem(publicKey)
//     .verify(md.digest().bytes(), forge.util.decode64(signature));
// };

// //Encrypt the message with signed digital signature

// export const encryptRsa = (publicKey: string, data: string) => {
//   //Encrypt data with public key with RSA
//   const pki = forge.pki;
//   const publicKeyForge = pki.publicKeyFromPem(publicKey);
//   // encrypt data with a public key using RSAES-OAEP/SHA-256
//   //See: https://github.com/digitalbazaar/forge#rsa
//   const encrypted = publicKeyForge.encrypt(data, "RSA-OAEP", {
//     md: forge.md.sha256.create(),
//   });

//   return forge.util.encode64(encrypted);
// };

// export const decryptRsa = (privateKey: string, data: string) => {
//   //Decrypt data with private key with RSA
//   const pki = forge.pki;
//   const privateKeyForge = pki.privateKeyFromPem(privateKey);
//   // decrypt data with a public key using RSAES-OAEP/SHA-256
//   const decrypted = privateKeyForge.decrypt(
//     forge.util.decode64(data),
//     "RSA-OAEP",
//     {
//       md: forge.md.sha256.create(),
//     }
//   );

//   return decrypted;
// };
