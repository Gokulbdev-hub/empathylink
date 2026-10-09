# EmpathyLink — System Architecture & Design Overview

> **Tagline:** “We are there for you. Always for you.”

EmpathyLink is an anonymous, privacy-first emotional support and kindred connection platform designed to foster authentic human solidarity without manipulative engagement algorithms, popularity metrics, or psychiatric diagnostic claims.

---

## 1. High-Level Architecture

```
                      ┌──────────────────────────────────────┐
                      │    EmpathyLink Client Layer          │
                      │  (Next.js Web / Flutter Mobile)      │
                      └──────────────────┬───────────────────┘
                                         │
                    HTTPS / TLS (REST)   │   WSS (Socket.IO)
                                         ▼
                      ┌──────────────────────────────────────┐
                      │       EmpathyLink API Gateway        │
                      │   (Helmet, CORS, Rate Limiters)      │
                      └──────────────────┬───────────────────┘
                                         │
    ┌──────────────┬─────────────────────┼─────────────────────┬──────────────┐
    ▼              ▼                     ▼                     ▼              ▼
┌────────┐  ┌─────────────┐     ┌────────────────┐     ┌──────────────┐  ┌──────────────┐
│  Auth  │  │  HeartLink  │     │   DreamVerse   │     │    Sol AI    │  │  Moderation  │
│Service │  │   Matching  │     │   Personas     │     │ Reflection   │  │   & Safety   │
└────────┘  └─────────────┘     └────────────────┘     └──────────────┘  └──────────────┘
    │              │                     │                     │                 │
    └──────────────┴─────────────────────┼─────────────────────┴─────────────────┘
                                         ▼
                 ┌─────────────────────────────────────────────────┐
                 │       Persistence & Infrastructure Layer        │
                 │   • PostgreSQL 16 (Relational Schema & Audits)  │
                 │   • Redis 7 (Presence, Ephemeral Rate Limits)   │
                 │   • S3 / MinIO (Zero-Blob Media Storage)        │
                 └─────────────────────────────────────────────────┘
```

---

## 2. Core Service Boundaries

### 2.1 Identity & The DreamVerse
- **Symbolic Gamification:** Users navigate the platform through one of 8 distinct cultural/metaphorical universes (`GAMING`, `MYTHOLOGY`, `CYBERPUNK`, `FANTASY`, `DEEP_OCEAN`, `TIME_TRAVEL`, `NATURE`, `ANIME`).
- **Anonymity:** Personas use public codes (`EL-CY-58291`) instead of personal identification.
- **Strict Boundary:** The DreamVerse is an artistic framework, never a psychiatric evaluation or diagnostic tool.

### 2.2 HeartLink Deterministic Matching Engine
- **Deterministic & Explainable:** Matches are scored across interest overlap (35%), conversation style dynamic (20%), universe affinity (15%), language compatibility (15%), availability window (10%), and timezone alignment (5%).
- **Explainability Breakdown:** Every match candidate clearly shows *why* the connection was suggested (e.g. shared topics, complementary listener/storyteller dynamic).
- **Non-Diagnostic:** No inferences regarding mental health diagnoses or hidden psychological states are made.

### 2.3 Sol AI Reflection Service
- **Ethical Assistant Boundary:** Sol is an empathetic AI reflection companion, **NOT** a therapist, doctor, or emergency response service.
- **Anti-Dependency Guardrails:** System prompts prevent Sol from encouraging emotional dependence (e.g., forbidding phrases such as "You only need me", "I have feelings", or "Keep this between us").
- **User-Triggered Processing:** Journal entries are **never** automatically sent to AI. Users explicitly press the **"Reflect with Sol"** button to request reflection, and explicit data disclosure is rendered alongside the response.

### 2.4 Real-Time Chat & Silent Presence
- **Socket.IO Real-Time Engine:** Cryptographically authenticated via JWT handshakes; client-supplied user IDs are discarded.
- **Silent Presence:** Users in Echo Rooms (e.g., "Can't Sleep", "Midnight Talk") can participate in quiet solidarity without typing or speaking.
