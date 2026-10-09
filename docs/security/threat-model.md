# EmpathyLink — Security Threat Model

This document outlines the threat model for EmpathyLink, following the STRIDE methodology, identifying key risks and corresponding countermeasures.

---

## 1. Assets to Protect

1. **User Identity & Anonymity:** Protecting real-world identities, IP addresses, and email addresses from being linked to DreamVerse personas.
2. **Private Journal Entries:** Intimate user reflections stored securely and accessible only with explicit user authorization.
3. **Private Direct Messages:** Confidential peer conversations between matched travelers.
4. **AI Boundary Integrity:** Ensuring Sol API keys, prompts, and training data remain strictly isolated from client exposure and external scraping.

---

## 2. Threat Analysis (STRIDE)

| Threat | Description | Countermeasure / Mitigation |
| :--- | :--- | :--- |
| **Spoofing** | Adversary attempts to impersonate another traveler or forge a JWT session. | Argon2id password hashing, cryptographic JWT signing with `jose` HS256, refresh token rotation with single-use revocation, WebSocket handshake token verification. |
| **Tampering** | Modifying private messages or altering moderation logs in transit. | Strict TLS transport, Zod input validation on all REST and WebSocket payloads, read-only audit log records for moderation events. |
| **Repudiation** | Denying having submitted an abusive message or report. | Structured immutable audit ledger (`SecurityEvent` and `ModerationEvent`) logging timestamp, actor ID, and IP address hash. |
| **Information Disclosure** | Leakage of private journal text or database records. | Explicit field redaction in Pino structured logging, zero exposure of OpenAI API keys to client browsers, separate trust boundary for Sol AI reflections. |
| **Denial of Service** | Flooding authentication or Sol endpoints to disrupt the platform. | Multi-tier rate limiting via `express-rate-limit` (auth limit 10/15m, Sol limit 20/min, standard API limit 120/min). |
| **Elevation of Privilege** | Normal user attempting to access `/api/v1/admin` moderation endpoints. | Role-Based Access Control (`requireRole('ADMIN', 'MODERATOR')`) enforced at the Express router layer. |

---

## 3. Cryptographic Standards

- **Password Hashing:** Argon2id (`memoryCost: 64MB`, `timeCost: 3`, `parallelism: 4`) with cryptographically secure PBKDF2 fallback.
- **JWT Lifetimes:** Short-lived access tokens (15 minutes), rotated refresh tokens (30 days).
- **Session Revocation:** Centralized invalidation via session hash tracking in database.
