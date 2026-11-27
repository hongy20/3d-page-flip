# Spec Delta

## ADDED Requirements

### Requirement: Auto-generated static SVG showcase book with embedded APNG

The repository SHALL include a reproducible generator script producing a static SVG showcase book under `public/books/<id>/` registered in `src/books/catalog.ts`, featuring an SVG page with an embedded animated PNG (`APNG`) alongside other SVG capability demonstrations, servable statically with zero runtime dependencies.

#### Scenario: Showcase book appears in catalog and renders generated SVG pages

- **WHEN** the library and reader load the showcase book from `src/books/catalog.ts`
- **THEN** all generated SVG pages (including the embedded APNG page) load cleanly with zero 404s and can be regenerated deterministically by the generator script
