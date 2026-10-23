# Spot64 V1.0 — Release Checklist

- [ ] Obtain the active Spot64 extensions from the current Windows installation and compare with this source tree.
- [ ] Confirm the renamed `spot64Core.js` is recognized during an upgrade from `terminalMinimal.js` without duplication.
- [ ] Validate all six built-in themes and saved custom themes.
- [ ] Validate animated Dither, the 33 pointer effects, independent parallax, click effects, and color synchronization.
- [ ] Validate the Focus Mode overlay, ASCII artwork, themed panel borders, seeking, volume, and playback.
- [ ] Verify CSS customization persistence and restoration of saved preferences.
- [ ] Run the source checks and verify every checksum in `manifest.json`.
- [ ] Test fresh install, upgrade, and restore on Windows with Spicetify.
- [ ] Test interrupted installation, checksum mismatch, duplicate extensions, and user-modified files.
- [ ] Benchmark CPU, memory and GPU performance in Spotify.
- [ ] Confirm authorship, licences, and redistribution rights for embedded recordings and assets.
- [ ] Review the public `dotded/Spot64-Spicetify-Theme` GitHub repository.
- [ ] Create an immutable, preferably signed, `V1.0` tag after final acceptance.
- [ ] Test the published version-pinned bootstrap end-to-end.
