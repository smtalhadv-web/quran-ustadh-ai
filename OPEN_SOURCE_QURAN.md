# Open-source Quran data attribution

Quran Ustadh AI uses the IndoPak 15-line Quran text/layout dataset from DigitalKhatt's `digitalkhatt-js` project:

- Repository: https://github.com/DigitalKhatt/digitalkhatt-js
- Source file: `apps/site-angular/src/app/services/quran_text_indopak_15.ts`
- License: MIT (repository license)
- Layout: 610 IndoPak pages, designed as a 15-line Mushaf dataset

The application does not use Quran Foundation Content API credentials or any permission-gated Quran text source.

The dataset is loaded unchanged for rendering. Application code may tokenize a rendered line into selectable UI spans, but does not alter the canonical source string stored in the upstream dataset.
