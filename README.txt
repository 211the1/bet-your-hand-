BET YOUR HAND — MULTIPLAYER GAME-NIGHT PROTOTYPE

WHAT THIS IS
A browser-based, play-points-only multiplayer prototype. One device is the Host/TV and 2–6 people can join from phones.

HOW IT CONNECTS
This version uses PeerJS for browser-to-browser signaling/data connections. The web page itself can be hosted as a static site (for example, GitHub Pages). The host creates a room code and players use the same code.

IMPORTANT
- Game coins are fictional points only. No real-money betting, wagering, or cash-out is included.
- Everyone needs an internet connection for the PeerJS connection.
- Keep the host page open during the game.

QUICK TEST
1. Open index.html in Chrome.
2. Choose HOST / TV and tap CREATE GAME.
3. On another phone, open the same page.
4. Choose PLAYER PHONE, enter a name and the 4-digit code, then JOIN GAME.
5. Repeat with another phone.
6. On the host, press START GAME.
7. Players play cards from their phones.

FOR A REAL TV + PHONE SETUP
Host: open the page on the TV or a laptop connected to the TV.
Players: open the same web address on their phones.

NEXT BUILD IDEAS
- Better UNO-style rules and special-card effects
- Host controls and round reset
- Player predictions/votes
- End-of-game scoreboard
- Sound effects and animations
- QR code for instant joining
- Installable PWA/app-like experience
