# Mother Terminal Simulation

A web-based experience that simulates the **MOTHER 6000** computer aboard the USCSS Nostromo. The interface doubles as an immersive training scenario devised by Weyland-Yutani: users uncover hidden directives by exploring a layered command system presented through a vintage terminal aesthetic.

## Experience Blueprint

### Narrative & Game Concept
- **Surface layer:** An authentic-feeling terminal that responds with canonical ship data, crew rosters, and diagnostic output from the Nostromo.
- **Hidden layer:** Decrypting corporate traffic (`DECODE SION-306`) unlocks **Special Order 937**. From there, escalating authorisations expose a thermal-trace minigame and ultimately reveal a meta twist—the entire exchange is a corporate training simulation masquerading as the real Mother.
- **Player tension:** Continue to serve Weyland-Yutani interests (purge the memory banks) or leave traces that could aid the crew. Different responses in the final `REPORT` summarise the player’s path.

### Visual Direction
- **Retro-futuristic CRT look** with emerald phosphor text, faint glow, and animated scanlines.
- **Fixed viewport "console"** framed by dim industrial chrome, centred on the screen.
- **Tactile feedback**: typed commands appear instantly, while Mother’s responses use a deliberate type-on effect.

### System Architecture
- `index.html`: semantic structure for the terminal surface (header, output screen, input form).
- `styles.css`: encapsulates the display aesthetic—scanline overlays, neon glow, responsive layout tweaks.
- `script.js`:
  - `Terminal` class handles input capture, history navigation, prompt updates, output rendering, and the typing animation.
  - `MotherCore` orchestrates game state, command parsing, and story progression. The state machine tracks clearance levels (`general → special → override → inquest`), the trace minigame, and the final corporate reveal.
  - Commands (`HELP`, `STATUS`, `LOGS`, `DECODE`, `TRACE`, etc.) correspond to narrative beats. As the user issues correct sequences (e.g. `ACCESS 937`, `CONFIRM EIDOLON`, `OVERRIDE 180924609`), deeper layers unlock.

### Interaction Flow
1. **Boot sequence** introduces the interface and instructs players to ask for help.
2. **Exploration** through basic commands reveals lore and hints toward encrypted traffic.
3. **Decryption** of `SION-306` unlocks priority access and the hidden directive cache.
4. **Override** leads to the thermal trace puzzle (`TRACE` + `PATH` commands) that requires reading the earlier scan data.
5. **Endgame choice** between purging the logs to protect the corporation or leaving them intact, followed by the meta twist via `REPORT`.

## Running the Simulation
Open `index.html` in any modern browser. All assets are static—no build step is required.

## Command Primer
- `HELP` — List available commands based on clearance.
- `STATUS`, `CREW`, `MANIFEST`, `LOGS`, `SCAN`, `IDENTIFY <SURNAME>` — Surface telemetry.
- `DECODE SION-306` — Unlock the hidden directive.
- `ACCESS 937` → `CONFIRM EIDOLON` — Gain priority clearance.
- `OVERRIDE 180924609` — Engage corporate override.
- `TRACE` plus the correct `PATH <SECTOR>` sequence — Complete the thermal routing minigame.
- `PURGE MEMORY` / `REPORT` — Trigger the twist and summarise choices.

Enjoy the descent into corporate duplicity.
