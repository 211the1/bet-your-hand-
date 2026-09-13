# BET YOUR HAND — GAME MASTER SPEC

## Purpose
This is the single source of truth for the complete BET YOUR HAND game. New code, screens, art, audio, tests, and deployment must follow this document. Do not revive obsolete mechanics from older prototypes.

## 1. Game identity
- Title: BET YOUR HAND
- Presentation: Game Night / neon arcade
- Platform: player phones + host/TV display
- Players: 2–6 actual players
- Host/TV is not a player
- Game uses fictional game points only. No real-money wagering or gambling mechanics.

## 2. Locked core rules
- Starting hand: 8 cards
- Starting points: 500
- Deck: exactly 108 cards
- Colors: Red, Blue, Green, Yellow
- A normal card is playable when it matches the current color OR the current top-card character.
- WILD and BET YOUR HAND special cards are playable when appropriate.
- If a player has no playable card, the game automatically draws until a playable card is available. That turn receives no +150 bonus.
- If a playable card exists at the start of a player's turn, award +150 points.
- SKIP skips the next player's turn unless that player has SHIELD.
- REVERSE changes direction. With 2 players, reversing direction effectively skips the other player.
- WILD lets its player choose Red, Blue, Green, or Yellow. The chosen color becomes the next required color.

## 3. Deck composition — locked
- 9 characters × 4 colors × 2 copies = 72 character cards
- SKIP = 8
- REVERSE = 8
- WILD = 8
- BET YOUR HAND / SPECIAL POWER = 12
- TOTAL = 108

## 4. Characters — locked order
1. Bug
2. Face
3. Ling Ling
4. Beanz
5. The One
6. Boone
7. Chicken Joe
8. Juby
9. Meemaw

Use the supplied character images. Keep each character's image/name mapping correct and center the head/face appropriately without unwanted cropping.

## 5. BET YOUR HAND special card / Power Wheel
Playing a BET YOUR HAND card activates the Power Wheel. It is not a wager.

The wheel has 9 equal sections. Every section has exactly a 1/9 chance on every spin. Spins are independent and cannot favor a player or remember previous results.

Wheel assignments:
1. Bug → EXTRA PLAY
2. Face → SHIELD
3. Ling Ling → COLOR CHOICE
4. Beanz → EXTRA PLAY
5. The One → TURN SWITCH
6. Boone → SHIELD
7. Chicken Joe → COLOR CHOICE
8. Juby → EXTRA PLAY
9. Meemaw → TURN SWITCH

All four powers are one-time-use powers. A power is consumed when used and is not available again until a new BET YOUR HAND card awards it.

### EXTRA PLAY
Immediately gives the current player another turn. Complete the current action, then take the extra turn. Normal turn order resumes afterward.

### SHIELD
Protects the player from one SKIP. It matters only when the player is actually targeted by SKIP.

### COLOR CHOICE
Opens Red / Blue / Green / Yellow choice on that player's phone. The chosen color becomes the next required color and is shown on the TV.

### TURN SWITCH
Changes the direction of play once.

## 6. Rounds and winning
- There are exactly 2 rounds.
- Round 2 carries forward every player's Round 1 points.
- Points do not reset between rounds.
- After Round 2, total points determine the winner.
- Highest total wins.
- There is no Round 3.

## 7. Required screens
### Host / TV
1. Host / Create Room
2. Lobby / Waiting for Players
3. TV Main Gameplay
4. Power Wheel display
5. Round Complete / leaderboard
6. Final Winner
7. Final Thank You / Game Night
8. Rules
9. Sound / music controls

### Player phone
1. Join Game
2. Character selection
3. Lobby / Waiting
4. In-game YOUR TURN
5. In-game WAITING FOR PLAYER
6. CALL PLAYER overlay/button
7. WILD color choice
8. Power Wheel / power result
9. COLOR CHOICE power screen
10. Final / round screens
11. Rules
12. Sound / settings

The active player's name/character uses the locked flame effect as the turn indicator.

## 8. Arcade presentation mode
The finished game should have a polished neon arcade presentation without changing the locked game rules:
- neon Game Night atmosphere
- animated transitions
- card animations
- character/portrait presentation
- Power Wheel animation
- glowing buttons and active-turn effects
- celebratory round and winner animations
- responsive phone layout and TV/large-screen layout

Arcade presentation is visual/audio polish layered on top of the tested game engine. It must not change gameplay logic.

## 9. Audio requirements
Audio is part of the finished product, not an optional afterthought.

Required audio categories:
- opening Game Night music
- start/countdown sound
- turn/notification sound
- card-play sound
- draw sound
- SKIP sound
- REVERSE sound
- WILD/color-choice sound
- BET YOUR HAND activation sound
- Power Wheel spin and result sound
- EXTRA PLAY sound
- SHIELD sound
- TURN SWITCH sound
- CALL PLAYER notification
- round-complete music
- winner celebration
- final Game Night / thank-you music

Voice lines requested for the game:
- Opening: “Get ready for game night.”
- Ending: “Thank you everybody for coming out the game night, thank you for playing the game.”

Do not copy a real artist's voice or copyrighted lyrics. Use original/licensed audio or generated game-style sounds.

## 10. Visual direction
Primary locked colors:
- Royal Blue #1687ff
- Deep Purple #713cff
- Emerald #08b978
- Gold #D4AF37

Optional arcade neon accents:
- Neon Blue #20a8ff
- Neon Purple #8b35ff
- Neon Pink #ff2fa6
- Neon Yellow #ffd21c
- Neon Green #21f17d
- Neon Red #ff3048

Do not mix in obsolete designs that conflict with the locked rules.

## 11. Existing design references
The project has previously created UI storyboard/mockup files covering host, player, lobby, TV gameplay, waiting/call, wheel, color choice, round end, winner, rules, and thank-you screens. These are visual references, not authority for gameplay rules where they conflict with this master spec.

Important: older mockups that show wagering/risk choices such as “PLAY IT SAFE,” “PLAY IT BOLD,” or “GO BIG” are obsolete and must not be implemented.

## 12. Asset requirements
Required character images:
- Bug.jpg
- Face.jpg
- Ling_Ling.jpg
- Beanz.jpg
- The_One.jpg
- Boone.jpg
- Chicken_Joe.jpg
- Juby.jpg
- Meemaw.jpg

Required additional production assets:
- card backs
- character card artwork/layout
- SKIP artwork
- REVERSE artwork
- WILD artwork
- BET YOUR HAND artwork
- Power Wheel artwork
- arcade backgrounds / table scene
- buttons/icons
- sound effects
- music beds
- original voice prompts

## 13. Technical architecture for the fresh build
Build the new product as a clean, tested system rather than patching the previous prototype.

Recommended separation:
- `game/` — pure rules/game engine
- `server/` — multiplayer room/session transport only
- `client/` — player phone UI
- `host/` — host/TV UI
- `assets/` — all images, audio, fonts, and visual assets
- `tests/` — unit, integration, and end-to-end tests
- `docs/` — this master specification and build notes

The game engine must be independent of the browser UI. The multiplayer layer must be tested separately from the UI. The final test must exercise the complete host → server → player → game → round 2 → winner path.

## 14. Build discipline — prevents the previous cycle
1. This file is the source of truth.
2. Do not change locked rules without explicitly updating this file first.
3. Do not patch unrelated old prototype code into the new build.
4. Keep gameplay logic separate from presentation.
5. Every major feature gets an automated test before it is called complete.
6. Multiplayer gets an integration test, not just isolated unit tests.
7. Deployment gets a live smoke test.
8. A feature is not called “working” merely because its source code looks correct; it must pass its relevant test.
9. Preserve the supplied assets and design references separately from generated code.
10. Do not send the user through repeated troubleshooting loops. Fix the underlying system first, then give one clear test step.

## 15. Definition of DONE
The game is ready for real user testing only when all of these work together:
- Host opens and creates a room automatically.
- A real 4-character room code appears.
- 2–6 phones can join the same room.
- Host sees every player and character correctly.
- Host can start the game.
- Every player receives exactly 8 cards.
- Turns advance correctly.
- Color/character matching works.
- Automatic drawing works.
- +150 rule works correctly.
- SKIP / SHIELD works.
- REVERSE works, including 2-player behavior.
- WILD color choice works on phone and TV.
- BET YOUR HAND activates the Power Wheel.
- All 9 wheel sections are equally random.
- All four powers work and are consumed correctly.
- Round 1 ends correctly.
- Round 2 carries points correctly.
- Final winner is correct.
- Final audio/visual celebration works.
- Player and host can reconnect without corrupting the game.
- The live deployed build passes the end-to-end smoke test.

## 16. Reset strategy
The previous prototype code may be discarded for the fresh build. The supplied character images and useful design/audio assets are retained separately. Git history can remain as an archive, but the new working tree should contain only the new build and retained assets.

This document must remain in the project for the entire rebuild.
