# Fresh rebuild build notes

The repository was inspected before this rebuild. The old root server and old test architecture are intentionally bypassed by the new `game/`, `server/`, `client/`, `host/`, and `tests/` layers. The root `GAME_MASTER_SPEC.md` remains authoritative and the supplied character JPGs are retained unchanged.

Stage 1 acceptance gate: the pure engine and multiplayer room lifecycle tests must pass before UI/integration work is treated as complete.