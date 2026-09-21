# Quran Ustadh AI — Phase 1 Functional Prototype

Mobile-first installable PWA prototype for the “Quran teacher who remembers me” experience.

## Run

```bash
python3 -m http.server 4173
# open http://localhost:4173
```

## Working flow
Create student → Home → Start Class → Quran appears → reference audio → simulated recitation → deterministic mistake → reference word/ayah audio → mark corrected → Hifz hide-word interaction → complete lesson → progress persisted in localStorage → Home reflects updated progress.

## Architecture
- `QuranService`: canonical Quran content/audio abstraction. UI never invents Quran text.
- `MockRecitationEvaluationService`: clearly mocked phase-1 evaluation. Replace with provider adapter later.
- `LearningEngine`: deterministic lesson/progression logic independent of LLM.
- `StorageService`: local prototype persistence. SQL migration maps the production shape to Supabase/PostgreSQL.
- `supabase/migrations/001_initial_schema.sql`: initial production-oriented schema.

## Quran data safety
The sample includes verified Quran Arabic for Surah An-Naba 78:11–15 and recorded recitation URLs. Production should import a complete authoritative/licensed IndoPak 15-line Quran dataset, persist checksums, and keep all canonical content outside conversational AI generation.

## Not yet real
Speech recognition, Quran audio alignment, microphone recording upload, AI TTS, parent dashboard, teacher dashboard and Supabase auth are intentionally not connected in this phase-1 prototype.


## Full Quran provider (IndoPak 15-line)
The reader is wired to Quran Foundation Content APIs through the server-only `/api/quran` Vercel function using Mushaf ID 6 (IndoPak 15-line, 610 pages).

Required Vercel environment variables:
- `QF_CLIENT_ID`
- `QF_CLIENT_SECRET`
- `QF_ENV=production` for the full Quran dataset

Do not expose `QF_CLIENT_SECRET` in browser code. The API route obtains and caches a Client Credentials token server-side.

Until production Quran Foundation credentials are configured, the verified local An-Naba sample remains as a safe fallback.
