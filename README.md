# Plants vs Zombies: Lawn Defense 🌱🧟

> **🤖 Built entirely with AI using Claude Code + Kimi K2 Anthropic compatible API**

Here is [some info](https://www.reddit.com/r/ChatGPTCoding/comments/1m0boxc/using_claude_code_with_kimi_2/) on how to setup Claude Code with the Kimi K2 API.

<img width="1115" height="1145" alt="image" src="https://github.com/user-attachments/assets/7a0e53c8-c91f-4e11-bf45-64643d9b6774" />


A Plants vs Zombies themed minesweeper game - vanilla JS, no dependencies.

## 🎮 Quick Play
- Left-click to plant 🌱, right-click to place 🌰
- 3 difficulty levels: 9×9, 16×16, 30×16
- First-click safety - no zombies on first move
- Real-time zombie counter and timer

## 🚀 How to Play
**Important:** This game must be served via HTTP to work properly. Do not open the file directly.

1. Open terminal in the project directory
2. Run: `npx serve .`
3. Open your browser to the shown URL (usually `http://localhost:3000`)
4. Click on `index.html` to start playing
5. Select difficulty from dropdown
6. Left-click to plant, right-click to mark zombies
7. Reveal all safe squares to win!

## 🛠️ Technical
- Vanilla JavaScript, HTML, CSS
- Responsive design for mobile/desktop
- No dependencies or build process

## 📱 Mobile Support
Fully responsive - works on all devices and browsers.

## 🎨 Customization
Edit `difficulties` in `script.js` to add new levels:
```javascript
custom: { rows: 20, cols: 20, zombies: 50 }
```

## 📄 License
GPL-3.0 - free to use, modify, and distribute under GPL terms.
