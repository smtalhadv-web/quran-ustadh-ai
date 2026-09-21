# Quran Ustadh AI — Phase 1 Functional Prototype

Mobile-first installable PWA prototype for the “Quran teacher who remembers me” experience.

## Run

```bash
python3 -m http.server 4173
# open http://localhost:4173
```

## Working flow
Create student → Home → Start Class → Quran appears → real microphone capture → simulated recitation evaluation → correction flow → Hifz hide interaction → complete lesson → progress persists locally.

## Architecture
- `OpenIndoPakService`: permission-free/open-source 610-page IndoPak 15-line Quran reader.
- `MockRecitationEvaluationService`: clearly mocked phase-1 evaluation.
- `LearningEngine`: deterministic lesson/progression logic independent of LLM.
- `RecorderService`: real browser microphone capture and playback.
- `StorageService`: local prototype persistence.
- `SupabaseService`: optional persistence hook; no Quran content dependency.
- `supabase/migrations/001_initial_schema.sql`: production-oriented schema.

## Quran source policy
The full reader uses DigitalKhatt's open-source IndoPak 15-line Quran dataset from the `digitalkhatt-js` repository.

- 610 pages
- physical 15-line page layout data
- no API key
- no login
- no Quran Foundation credentials
- no permission-gated Quran content
- no LLM-generated Quran text

The browser loads the source from jsDelivr's GitHub CDN and validates that the dataset contains exactly 610 pages before rendering it.

## Audio policy
External Quran recitation audio is disabled for now because the project should only use audio with an explicit open redistribution/use licence. The student's own microphone recording still works. A verified open-licensed recitation source can be added later.

## Not yet real
Quran speech recognition/alignment, Tajweed/makhraj scoring, parent dashboard, teacher dashboard and full Supabase auth are not yet connected.
