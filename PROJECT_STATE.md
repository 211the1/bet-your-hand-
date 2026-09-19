# PLAY YOUR HAND — PROJECT STATE CHECKPOINT

Official game name: PLAY YOUR HAND
Repository: 211the1/bet-your-hand-
Working branch: fresh-rebuild
Render service: play-your-hand
Live URL: https://bet-your-hand.onrender.com

## Locked design
- Keep existing Wild card artwork unchanged.
- Keep existing PLAY YOUR HAND card artwork unchanged.
- Skip and Reverse are being replaced with the clean modern Option 2 style.
- Skip and Reverse show their actual color directly on the card: Red, Blue, Green, Yellow.
- Keep the newer Power Wheel style selected by the user.
- Wild color selection uses four large color buttons, not dropdowns.
- Regular cards play by tapping the card; no separate bottom PLAY YOUR HAND action button.
- Draw and Sort remain bottom actions.
- Cards slide horizontally on mobile.
- Do not redesign approved character artwork.

## Game rules currently in code
- A card is playable by matching color OR character.
- Wild and PLAY YOUR HAND are always playable.
- Keep discard-pile reshuffling after testing; test one thing at a time.

## Current implementation
- Direct card-tap play is implemented.
- Mobile touch handling was changed to avoid double-tap behavior.
- Card color is derived from card identity where possible so label/display/playability stay consistent.
- Player and host Skip/Reverse use the new clean Option 2 rendering.
- Existing Wild and PLAY YOUR HAND special artwork remains unchanged.
- Player app, host app, and game engine parse-checked successfully after recent changes.

## Character assets
Bug.jpg
Face.jpg
Ling_Ling.jpg
Beanz.jpg
The_One.jpg
Boone.jpg
Chicken_Joe.jpg
Juby.jpg
Meemaw.jpg

## Special artwork
Pinned under commit 522dda3f4d19b5024001a74e78d9229b5e0c98b3:
special_cards/WILD.png
special_cards/PLAY_YOUR_HAND.png
special_cards/SKIP/SKIP_ROYAL_BLUE.png
special_cards/SKIP/SKIP_DEEP_PURPLE.png
special_cards/SKIP/SKIP_EMERALD.png
special_cards/SKIP/SKIP_GOLD.png
special_cards/REVERSE/REVERSE_ROYAL_BLUE.png
special_cards/REVERSE/REVERSE_DEEP_PURPLE.png
special_cards/REVERSE/REVERSE_EMERALD.png
special_cards/REVERSE/REVERSE_GOLD.png

## Recent fresh-rebuild commits
e0d92b0de2b74058982cd82dd8142d5333aca89ac4 — Add clean Option 2 Skip and Reverse cards
c75748720b55892c252461a776224738887d046d — Style Skip and Reverse to match clean Option 2
d8575a5df433d884156fecf3da4b9b957eaa0a77 — Match host Skip and Reverse cards to Option 2
ffcb8335d87abce4e75146f04a9a1f1dd70d2f74 — Refresh player app
6a357f7da8182ac76b5fc0269861726f864401f8 — Refresh player styles

## Continuity
Do NOT rebuild from scratch. Continue from fresh-rebuild and Git history. Check this file before making changes in a new chat.

## Latest restart fix (2026-09-19)
- Host RESTART GAME is visible again after a host reconnect.
- Restart now sends connected players a restart signal, closes their old room connection, clears their saved room session, and returns them to JOIN GAME so they can enter the new room code.
- Host remains in control and receives the newly created room after restart.
- Commits: c21921b5c451da641b2cc8300863c20dcbeb06b3, aa6c4602f470e9e8d5140f76eea0a12fc94d473e, fabe3bfc743e2cb934d03a0345d9c8bb0e6d8f24.

## Latest card-color consistency fix (2026-09-19)
- Scanned the authoritative deck/cardColor logic after a screenshot showed a green character card labeled Yellow.
- The engine's cardColor() remains authoritative from card IDs.
- Player and host card labels now display cardColor(), not the potentially stale card.color field.
- Server STATE snapshots now normalize transmitted top cards and player hands to the authoritative cardColor(), preventing persisted stale color fields from disagreeing with the card ID.
- Exported cardColor() from game/engine.js for the server snapshot normalization.
- Commits: 6879a641a32023b37470b6b7af3addc8a11e318d, 7f9fdc843ab1068256febfb0bf5a28d28ce2982f, 9f074dce6013572458a848369e6182cf8a804dc4, plus engine export fix 725ee642c5d04db82b44e6e1e91957d00318e17e.

## Latest Power Wheel update (2026-09-19)
- PLAY YOUR HAND now uses a nine-section Power Wheel matching the game's four actual card colors: Red, Blue, Green, Yellow.
- Each wheel section is an individual labeled wedge with a character and a Power Play result.
- When PLAY YOUR HAND is played, the wheel result now sets the next game color immediately to the color of the section where the wheel lands.
- COLOR_CHOICE remains a Power Play that can override the wheel-selected color after the result.
- The wheel result shows POWER PLAY, selected COLOR, and the landed character.
- The wheel is rendered in the existing player game screen; no separate image upload is required.
- Engine wheel sections are defined in game/engine.js as WHEEL_SECTIONS.

## Latest Power Wheel / laptop hand-scroll fix (2026-09-19)
- Fixed the PLAY YOUR HAND wheel flow after a last-card event: when the last-card video finishes, the client now resets the wheel-spin guard so a pending SPIN_WHEEL action is shown and can run normally.
- Fixed laptop hand scrolling so dragging the hand background no longer competes with dragging/playing an individual card.
- Added a clearer desktop horizontal scrollbar for the hand.
- Player cache bumped to app.js?v=54.
- Commits: 10abfceee8b841e11f209719f770bcd2ac4dd19b, cb2e582c7a04611db95a420acad0730a9d6b78e6, 2296551e056f86efb15f5348d52e2c974b86edcc.
