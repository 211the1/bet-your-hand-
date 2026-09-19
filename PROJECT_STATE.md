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
