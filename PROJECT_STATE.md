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

## Card play scan/fix (2026-09-19)
- Full scan found the server/engine PLAY_YOUR_HAND wheel path is intact: PLAY_YOUR_HAND sets pending=SPIN_WHEEL, and SPIN_WHEEL assigns the nine-section wheel result and color.
- The actual player-card failure was in the client gesture handler: it was rejecting ordinary taps and only sending PLAY_CARD after an upward 70px swipe. That contradicted the locked direct/tap card-play behavior.
- Fixed card input so a normal tap plays the card, while an upward swipe still plays it and horizontal dragging remains available for scrolling.
- Cache bumped to app.js?v=55.
- Commit: 568a48e35151a6b52ab321c47765a9de68c816c8.

## Power Wheel / desktop card fix (2026-09-19)
- PLAY YOUR HAND cards now have a desktop click fallback in addition to pointer/tap handling, so a laptop mouse click can trigger PLAY_CARD reliably.
- The nine-section wheel now displays each section's character, actual game color, and Power Play label.
- The wheel result now visibly lands on the actual server-selected section instead of always stopping at the same visual position.
- The result panel explicitly shows POWER PLAY, CHARACTER, and NEXT COLOR.
- GAME INFO now displays the wheel-selected color from wheelResult first, keeping the information panel synchronized with the Power Wheel.
- Player app cache bumped to app.js?v=56.
- Commits: ec5fb767a996298b983858f9a33d91e2bb52f7bb, a846678b876dac93215a00b84e1ac962070d2d5c, 9010bb5a14cefe34f30a20791fd56afcc1b94295.

## Wheel control-block fix (2026-09-19)
- Full player/client/server scan traced the new Power Wheel path and normal controls.
- Added defensive layering so the display-only Power Wheel cannot intercept mouse/touch clicks meant for MENU, CALL, CARD PILES, hand arrows, DRAW, SORT, or other game controls.
- Power-panel buttons remain explicitly clickable.
- Player cache bumped to app.js?v=57.
- Commit: bc5126580b36b453226099d131c95111ca5d9333; cache commit: 8eeb69c36c67c9d12f2f61596eb3ab086e9a0e72.

## Top display card consistency fix (2026-09-19)
- The laptop TV display was still rendering SKIP/REVERSE through a fallback branch, which replaced the shared special-card visual with a plain text label such as REVERSE.
- Fixed the TV markup to always use the same `topCardVisual` renderer used for special cards, so SKIP and REVERSE use the approved shared card design on the TV display, matching the hand/card-pile appearance.
- No game rules, laptop controls, or card engine behavior changed.
- Player cache bumped to app.js?v=61.
- Commits: 1e0c48df78511ead89dee188b2042b8c6e25a483, 0e83c33684b6331750b131815e047d4792050a16.

## Player score display restored (2026-09-19)
- Restored the current SCORE on every player tile in the arcade player screen.
- Score comes directly from the existing server snapshot `p.points`; scoring rules/engine were not changed.
- Player tiles now show character, player name, SCORE, and hand-card count.
- Added a visible gold score treatment with a star marker.
- Laptop controls, wheel behavior, card rules, and card visuals were not changed.
- Player cache bumped to app.js?v=62.
- Commits: 23c2b265099b7aa2d8b64248f75713a2b03aaca7, 22c5acdbb501e8df5729de41c79278ba504a8ba9, ddf614d144d5d99d582f36cf69192e71a621057c.

## TV character card lettering restored (2026-09-19)
- The TV top-card renderer was changed to a shared special-card visual, but that also removed the character name/color labels beneath normal character cards.
- Restored the character name and authoritative color text directly beneath the character image on the TV card.
- No controls, scoring, wheel, card rules, or special-card artwork were changed.
- Player cache bumped to app.js?v=63.
- Commits: 9af3b6fdc45d95ddfdcdfca06a6a9edf88ee5982, 0733d345197dab670f41998cfef7871dfc1881f3.


## Latest Power Wheel asset hookup (2026-09-19)
- Connected the uploaded `assets/power_wheel_style2.png` artwork to the live player Power Wheel.
- The existing server-selected wheel section/result logic remains unchanged; the artwork rotates to the selected section and the existing result panel still shows POWER PLAY, PLAYER/CHARACTER, and NEXT COLOR.
- Added a persistent power badge to each player tile when that player has an unused power.
- SHIELD uses the uploaded blue shield artwork at `power-play/shields/shield_blue.png`; the badge remains until the existing engine consumes the SHIELD power.
- Other powers show compact text badges until consumed.
- No game rules, laptop controls, CALL/WAKE PLAYER behavior, or existing card artwork were changed.
- Player cache bumped to app.js?v=64 and style.css?v=43.
- Commits: 624a1bc55a8450b5b1f1e829a7f9eb084b977cdb, 50f45ebf9077e7428389890613265336aba473ca, 3684f19fed36a9229f4933abddc5dfda131d15cb.


## Power badge placement update (2026-09-19)
- Moved persistent player power badges out of the top player tiles.
- Power badges now appear directly below the TV screen and identify the character/player who currently owns the unused power.
- Existing power state and consumption logic is unchanged.
- Commits: b8531c139ce227ea3dec970fe9ba665daace1fff, 443801bd10d223f38469a5bf7b709d837129f659, 7f0e3cb4435d729470d362bbed16b2c050d29353.


## Emoji reaction system (2026-09-20)
- EMOJI SMILE now opens a player-targeted reaction menu.
- Players can send the selected reaction to another player; the recipient sees it pop up, float upward, and fade away without interrupting the game.
- Menu includes the approved regular reactions plus the user's custom image at assets/custom_emoji.jpg.
- Emoji reactions do not change game rules, scoring, turns, cards, or laptop game controls.
- Player app cache bumped to app.js?v=68.
