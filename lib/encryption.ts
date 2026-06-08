import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto"

function getEncryptionKey() {
    const encryptionKey = process.env.CHANNEL_TOKEN_ENCRYPTION_KEY
    if(!encryptionKey){
        throw new Error("CHANNEL_TOKEN_ENCRYPTION_KEY is not defined")
    }
    return createHash("sha256").update(encryptionKey).digest()
}

export function encrypt(text: string | null | undefined){
    if(!text) return null
     const iv = randomBytes(12);

     const cipher = createCipheriv("aes-256-gcm", getEncryptionKey(), iv)

     const encryted = Buffer.concat([
        cipher.update(text, "utf-8"),
        cipher.final()
     ])

     const tag = cipher.getAuthTag()

     const result = [iv.toString("base64url"), tag.toString("base64url"), encryted.toString("base64url")].join(".")
    return result
}

export function decrypt(encrypted: string | null | undefined){
    if(!encrypted) return null;

    const [iv, tag, encryted] = encrypted.split(".")

    if(!iv || !tag || !encryted) return null;

    const decipher = createDecipheriv("aes-256-gcm", getEncryptionKey(), Buffer.from(iv, "base64url"))

    decipher.setAuthTag(Buffer.from(tag, "base64url"))
    
    const decrypted = Buffer.concat([
        decipher.update(Buffer.from(encryted, "base64url")),
        decipher.final()
    ])
    return decrypted.toString("utf-8")
}
