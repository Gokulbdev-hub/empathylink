# EmpathyLink — Cryptographic & Privacy Boundaries

This specification defines the cryptographic boundaries, E2EE status disclosure, and external AI isolation policies for EmpathyLink.

---

## 1. Private Chat Security & E2EE Disclosure

> [!IMPORTANT]
> **No Cryptography Invention & Honest Labeling:**
> EmpathyLink strictly adheres to the principle of never inventing ad-hoc cryptographic schemes.
> For the first production milestone, audited client-side E2EE integration is explicitly marked as **PENDING THIRD-PARTY AUDIT**. 
> EmpathyLink does **not** falsely advertise client-side E2EE until independent formal verification has concluded.

### Current Implementation:
- **Encrypted Transport:** Enforced TLS 1.3 across all HTTP and WebSocket connections.
- **Payload Relaying:** The server functions as a message router and persistence coordinator.
- **Admin Access Restriction:** System administrators and moderators have **NO** administrative backdoor to decrypt or view private human-to-human conversations without user-initiated flagged reports.

---

## 2. AI Reflection Boundary (Sol)

When a user exercises their autonomous choice to interact with Sol or clicks the **“Reflect with Sol”** button in their Dream Journal:

1. **Explicit Boundary Crossing:** The client UI renders an explicit notice stating that content is leaving the human-to-human communication boundary for on-demand reflection.
2. **Data Minimization:** Only the specific text chunk requested for reflection is transmitted to the AI backend service.
3. **No Model Training:** Content sent through the OpenAI API is dispatched using the zero-data-retention API flag, ensuring private journal reflections are never used to train public language models.
4. **Key Isolation:** The `OPENAI_API_KEY` is maintained exclusively within backend environment variables and is never exposed to browser or client code.
