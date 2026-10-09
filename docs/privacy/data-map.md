# EmpathyLink — Data Lifecycle & Privacy Map

This document outlines the data lifecycle, data minimization principles, export mechanisms, and deletion policies in accordance with global privacy regulations (GDPR, CCPA).

---

## 1. Data Classification Map

| Entity | Sensitivity | Storage Location | Retention / Deletion Strategy | Exportable? |
| :--- | :--- | :--- | :--- | :--- |
| **Account Credentials** | Confidential | PostgreSQL (`passwordHash`, `twoFactorSecret`) | Soft-deleted immediately upon request; purged after 30-day grace window. | No (hashes withheld) |
| **Persona** | Pseudonymous | PostgreSQL | Severed from email link; anonymized to "Deleted Traveler". | Yes |
| **Dream Journal Entries** | Confidential | PostgreSQL | Hard deleted immediately upon user confirmation; reflections cascade deleted. | Yes (Full JSON / Markdown) |
| **HeartLink Requests** | Low / Ephemeral | PostgreSQL / Memory | Automatically expired or deleted upon match closure. | Yes |
| **Direct Chat Messages** | Confidential | PostgreSQL / Redis | Retained for participants; deleted if both participants delete; ephemeral TTL supported. | Yes |
| **Wellness & Mood** | Sensitive | PostgreSQL | Permanently deleted upon account deletion. | Yes |
| **Audit Logs** | Restricted | PostgreSQL (`SecurityEvent`, `ModerationEvent`) | Retained for 90 days for platform safety compliance, with user IDs anonymized. | No |

---

## 2. User Data Rights

1. **Right to Access & Data Portability:** Users can trigger a single-click export at `POST /api/v1/privacy/export`, generating a structured JSON bundle of all personal journals, mood history, and persona attributes.
2. **Right to Erasure (Account Deletion):** Initiated via `POST /api/v1/privacy/delete-account`, which revokes all active device sessions, purges private journal entries, anonymizes persona public codes, and terminates all active HeartLink matchmaking threads.
