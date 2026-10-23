# Spot64 V1.0 — Source Audit

## Scope

This source is reconstructed from uploaded extensions and subsequent incremental patches. It has not been compared against the exact installed Windows configuration.

## Completed

- Standardized product identification to Spot64 and version notation to V1.0.
- Standardized active extension filenames. New core source: `spot64Core.js`.
- Removed 152 JavaScript comments, 61 shader line comments, and 25 CSS/template comments from the active source.
- Removed the legacy cover-toggle extension from the active repository. Its target visualizer is not present in the supplied core code.
- Preserved all existing browser storage keys, theme IDs, CSS selectors, waveform rendering, Dither effects, and embedded ASCII recordings.
- Updated source signatures to avoid relying on removed explanatory header comments.
- Preserved typed-buffer reuse in the Dither renderer.
- Retained existing CSS override order rather than risk changing specificity and theme appearance.

## Known limitations

- The large ASCII data block remains embedded. It has not been re-encoded or split into modules.
- The repo has not been validated against the exact working installed files.
- Windows/PowerShell installer and restore behavior requires live verification.
- WebGL shader compilation and frame rate require testing in Spotify on the target GPU.
- The core extension upgrade currently recognizes an existing legacy filename and preserves it in place to avoid breaking installed Spicetify configuration. Rename/migration requires a separately verified operation.
- The source scan does not constitute a full security assessment or a formal proof that every effect behaves identically.

## Publication gate

Do not publish Spot64 V1.0 as a stable release until the [release checklist](RELEASE-CHECKLIST.md) passes.
