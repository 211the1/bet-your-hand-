PLAY YOUR HAND — STABLE QR SCANNER SHELL (TEST COPY ONLY)

WHAT THIS ADDS
- A separate app shell with an in-app camera QR scanner.
- It recognizes the current HTTPS *.trycloudflare.com link in a QR code and loads that URL inside the installed shell.
- QR paths determine role: /host/... opens the host screen; /?code=ROOM opens the player join screen.
- SCAN NEW QR lets the same installed shell switch to a new tunnel URL.
- It does not edit server.js, the existing host screen, player screen, game rules, or QR generation.

IMPORTANT LIMITS
- The shell must be installed from a stable HTTPS origin, not from a changing trycloudflare.com URL. GitHub Pages can provide that stable origin.
- This folder is intended to be served at https://211the1.github.io/bet-your-hand-/app-shell/ if GitHub Pages is configured to serve the fresh-rebuild branch/root. Verify that URL loads before installing.
- The scanner uses native BarcodeDetector when available and jsQR from jsDelivr as a fallback. Camera scanning needs browser camera permission and internet access for the fallback library.
- The existing code in this test copy currently generates the player QR at the host screen. I did not find a separate host QR generator in the checked files. A host QR must encode https://CURRENT-TUNNEL.trycloudflare.com/host/index_fixed.html (or the correct host route). This shell can open it when scanned.
- Iframes across the tunnel origin and stable GitHub Pages origin need to be allowed by the browser/server. If the browser blocks the host/player screen from loading in the frame, the architecture needs a small follow-up server/header adjustment or a stable relay; do not change game behavior blindly.

TEST PLAN
1. Publish ONLY the app-shell folder and its referenced icon files to the stable GitHub Pages origin. Do not replace the game branch or upload this ZIP over the original folder.
2. Open the stable /app-shell/ URL on the host phone and use the browser's Add to Home Screen / Install option once. Repeat on a player phone.
3. Start the laptop server and Cloudflare Quick Tunnel. Open the current tunnel host page on the laptop.
4. Scan a QR containing the current player URL (https://CURRENT-TUNNEL.trycloudflare.com/?code=ROOMCODE). The player UI should appear inside the installed shell.
5. Scan a host QR containing https://CURRENT-TUNNEL.trycloudflare.com/host/index_fixed.html. The host UI should appear inside the installed shell.
6. Restart the tunnel so the URL changes. Reopen the installed shell and scan the new QR. The installed app should remain the same and load the new address.

DO NOT TEST ON THE ORIGINAL OR BACKUP COPY.
