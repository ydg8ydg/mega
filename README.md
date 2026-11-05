# Greedy Gala – Party Board (self-hosted)

No accounts, no installs for players: everyone just opens your link.

## 1. Test on your own computer (2 minutes)
1. Install Node.js 18+ from nodejs.org
2. In this folder run:  `node server.js`
3. Open http://localhost:3000 in two browser tabs. Join with a different character in each, then start.
   (Same wifi? Friends can use http://YOUR-COMPUTER-IP:3000)

## 2. Put it online for friends (Render, free)
1. Make a free account at github.com and create a new repository. Upload everything in this folder.
2. Make a free account at render.com → New → Web Service → connect that repository.
3. Settings: Runtime = Node, Build command = (leave blank or `npm install`), Start command = `npm start`, Instance = Free.
4. Deploy. You get a link like https://your-name.onrender.com — send it to your friends.
   (Free instances sleep when idle; the first visit can take ~30 seconds to wake up.)

## Playing
- Each friend opens the link, types a name, taps a character. The first person in is the host and presses Start (2–4 players).
- Separate games: add a room name to the link, e.g. https://your-name.onrender.com/?room=friday
- Players are remembered per browser, so a refresh puts you back in your seat.

## Customising
Edit `public/game-data.js` — characters, items, events, settings, and the board path are all there.
The game rules live in `server.js`.
