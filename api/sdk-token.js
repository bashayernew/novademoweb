// Vercel serverless function: /api/sdk-token
// Mints a REAL Novagates session token for the Web SDK.
//
// Flow (OAuth2 private_key_jwt, per the dashboard's /api/token):
//   1. Build a client_assertion JWT (ES256) signed with our PRIVATE key.
//      - header.jwk = our PUBLIC JWK (server matches its thumbprint to the
//        apiKey's stored JKT)
//      - payload.iss = payload.sub = our public apiKey (pk_...)
//      - payload.jti = unique (replay protection)
//   2. POST it to staging's /api/token with Origin set to our whitelisted
//      domain (so the brand domain-whitelist check passes).
//   3. Return the issued access_token as { sessionToken }.
//
// The private key NEVER ships to the browser — it lives only in the
// NOVAGATES_PRIVATE_KEY env var and is used here, server-side.

import crypto from "node:crypto";
import https from "node:https";

const API_KEY = process.env.NOVAGATES_API_KEY || "pk_3b5f9c910f25d414aa97dca4551914b8";
const PRIVATE_KEY_RAW = process.env.NOVAGATES_PRIVATE_KEY || "";
const TOKEN_URL = process.env.NOVAGATES_TOKEN_URL || "https://staging.novagates.com/api/token";
// The browser origin the SDK runs on — must be a whitelisted domain on the brand.
const SDK_ORIGIN = process.env.NOVAGATES_ORIGIN || "https://novademoweb.vercel.app";

function b64url(input) {
  return Buffer.from(input).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// Accepts the private key as JWK ({...}) or PEM (PKCS8 / SEC1). Un-escapes
// "\n" in case it was pasted as a single line into the env var.
function loadPrivateKey(raw) {
  let s = String(raw).trim();
  if (s.includes("\\n")) s = s.replace(/\\n/g, "\n");
  if (s.startsWith("{")) return crypto.createPrivateKey({ key: JSON.parse(s), format: "jwk" });
  return crypto.createPrivateKey(s);
}

// POST JSON via node:https so we can reliably set the Origin header
// (fetch/undici may drop it as a forbidden header).
function postJson(urlStr, bodyObj, extraHeaders) {
  return new Promise((resolve, reject) => {
    const u = new URL(urlStr);
    const body = Buffer.from(JSON.stringify(bodyObj));
    const r = https.request(
      {
        method: "POST",
        hostname: u.hostname,
        port: u.port || 443,
        path: u.pathname + u.search,
        headers: { "Content-Type": "application/json", "Content-Length": body.length, ...extraHeaders },
      },
      (resp) => {
        const chunks = [];
        resp.on("data", (c) => chunks.push(c));
        resp.on("end", () => {
          const text = Buffer.concat(chunks).toString("utf8");
          let json;
          try { json = JSON.parse(text); } catch { json = { raw: text }; }
          resolve({ status: resp.statusCode || 0, json });
        });
      },
    );
    r.on("error", reject);
    r.write(body);
    r.end();
  });
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  if (req.method === "OPTIONS") { res.status(204).end(); return; }

  try {
    if (!PRIVATE_KEY_RAW) {
      res.status(500).json({ error: "Server is missing the NOVAGATES_PRIVATE_KEY environment variable." });
      return;
    }

    const privKey = loadPrivateKey(PRIVATE_KEY_RAW);
    const pub = crypto.createPublicKey(privKey).export({ format: "jwk" }); // { kty, crv, x, y }
    const jwk = { kty: pub.kty, crv: pub.crv, x: pub.x, y: pub.y };

    const now = Math.floor(Date.now() / 1000);
    const header = { alg: "ES256", typ: "JWT", jwk };
    const payload = { iss: API_KEY, sub: API_KEY, jti: crypto.randomUUID(), iat: now, exp: now + 120 };
    const signingInput = b64url(JSON.stringify(header)) + "." + b64url(JSON.stringify(payload));
    // ES256 JWS needs the raw R||S signature (IEEE P1363), not DER.
    const sig = crypto.sign("sha256", Buffer.from(signingInput), { key: privKey, dsaEncoding: "ieee-p1363" });
    const clientAssertion = signingInput + "." + b64url(sig);

    const { status, json } = await postJson(
      TOKEN_URL,
      {
        client_assertion: clientAssertion,
        client_assertion_type: "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
      },
      { Origin: SDK_ORIGIN },
    );

    if (status < 200 || status >= 300 || !json || !json.access_token) {
      res.status(status || 502).json({ error: "Token exchange failed", upstreamStatus: status, detail: json });
      return;
    }

    res.status(200).json({
      sessionToken: json.access_token,
      token_type: json.token_type || "Bearer",
      expires_in: json.expires_in,
    });
  } catch (err) {
    res.status(500).json({ error: "sdk-token error", detail: String((err && err.message) || err) });
  }
}
