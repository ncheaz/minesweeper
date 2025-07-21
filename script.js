class Minesweeper {
    constructor() {
        this.difficulties = {
            easy: { rows: 9, cols: 9, zombies: 10 },
            medium: { rows: 16, cols: 16, zombies: 40 },
            hard: { rows: 16, cols: 30, zombies: 99 }
        };
        
        this.currentDifficulty = 'easy';
        this.board = [];
        this.gameState = 'playing';
        this.firstClick = true;
        this.flaggedCount = 0;
        this.revealedCount = 0;
        this.startTime = null;
        this.timerInterval = null;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.newGame();
    }
    
    setupEventListeners() {
        document.getElementById('reset-btn').addEventListener('click', () => this.newGame());
        document.getElementById('difficulty').addEventListener('change', (e) => {
            this.currentDifficulty = e.target.value;
            this.newGame();
        });
    }
    
    newGame() {
        this.gameState = 'playing';
        this.firstClick = true;
        this.flaggedCount = 0;
        this.revealedCount = 0;
        this.startTime = null;
        this.clearTimer();
        
        const { rows, cols, zombies } = this.difficulties[this.currentDifficulty];
        this.rows = rows;
        this.cols = cols;
        this.totalZombies = zombies;
        
        this.createBoard();
        this.renderBoard();
        this.updateZombieCount();
        this.updateTimer();
        
        document.getElementById('reset-btn').textContent = '🌻';
        this.removeGameOverScreen();
    }
    
    createBoard() {
        this.board = Array(this.rows).fill().map(() => 
            Array(this.cols).fill().map(() => ({
                isZombie: false,
                isRevealed: false,
                isFlagged: false,
                neighborZombies: 0
            }))
        );
    }
    
    placeZombies(excludeRow, excludeCol) {
        const { zombies } = this.difficulties[this.currentDifficulty];
        let zombiesPlaced = 0;
        
        while (zombiesPlaced < zombies) {
            const row = Math.floor(Math.random() * this.rows);
            const col = Math.floor(Math.random() * this.cols);
            
            if (!this.board[row][col].isZombie && 
                !(row === excludeRow && col === excludeCol)) {
                this.board[row][col].isZombie = true;
                zombiesPlaced++;
            }
        }
        
        this.calculateNeighborZombies();
    }
    
    calculateNeighborZombies() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (!this.board[row][col].isZombie) {
                    let count = 0;
                    for (let dr = -1; dr <= 1; dr++) {
                        for (let dc = -1; dc <= 1; dc++) {
                            const newRow = row + dr;
                            const newCol = col + dc;
                            if (this.isValidPosition(newRow, newCol) && 
                                this.board[newRow][newCol].isZombie) {
                                count++;
                            }
                        }
                    }
                    this.board[row][col].neighborZombies = count;
                }
            }
        }
    }
    
    isValidPosition(row, col) {
        return row >= 0 && row < this.rows && col >= 0 && col < this.cols;
    }
    
    renderBoard() {
        const gameBoard = document.getElementById('game-board');
        gameBoard.innerHTML = '';
        
        const grid = document.createElement('div');
        grid.className = 'grid';
        grid.style.gridTemplateColumns = `repeat(${this.cols}, 30px)`;
        
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                cell.addEventListener('click', (e) => this.handleCellClick(e));
                cell.addEventListener('contextmenu', (e) => this.handleRightClick(e));
                
                grid.appendChild(cell);
            }
        }
        
        gameBoard.appendChild(grid);
    }
    
    handleCellClick(e) {
        if (this.gameState !== 'playing') return;
        
        const row = parseInt(e.target.dataset.row);
        const col = parseInt(e.target.dataset.col);
        const cell = this.board[row][col];
        
        if (cell.isFlagged || cell.isRevealed) return;
        
        if (this.firstClick) {
            this.firstClick = false;
            this.placeZombies(row, col);
            this.startTimer();
        }
        
        this.revealCell(row, col);
    }
    
    handleRightClick(e) {
        e.preventDefault();
        if (this.gameState !== 'playing') return;
        
        const row = parseInt(e.target.dataset.row);
        const col = parseInt(e.target.dataset.col);
        const cell = this.board[row][col];
        
        if (cell.isRevealed) return;
        
        cell.isFlagged = !cell.isFlagged;
        this.flaggedCount += cell.isFlagged ? 1 : -1;
        this.updateCell(row, col);
        this.updateMineCount();
    }
    
    revealCell(row, col) {
        if (!this.isValidPosition(row, col)) return;
        
        const cell = this.board[row][col];
        if (cell.isRevealed || cell.isFlagged) return;
        
        cell.isRevealed = true;
        this.revealedCount++;
        
        if (cell.isZombie) {
            this.gameOver(false);
            return;
        }
        
        this.updateCell(row, col);
        
        if (cell.neighborZombies === 0) {
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    this.revealCell(row + dr, col + dc);
                }
            }
        }
        
        this.checkWin();
    }
    
    updateCell(row, col) {
        const cellElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        const cell = this.board[row][col];
        
        cellElement.className = 'cell';
        cellElement.textContent = '';
        
        if (cell.isFlagged) {
            cellElement.classList.add('flagged');
            cellElement.textContent = '🌰';
        } else if (cell.isRevealed) {
            cellElement.classList.add('revealed');
            if (cell.isZombie) {
                cellElement.classList.add('zombie');
                cellElement.classList.add('zombie-exploded');
                cellElement.textContent = '🧟';
            } else if (cell.neighborZombies > 0) {
                cellElement.textContent = cell.neighborZombies;
                cellElement.dataset.value = cell.neighborZombies;
            } else {
                cellElement.textContent = '🌱';
            }
        }
    }
    
    revealAllZombies() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.board[row][col].isZombie) {
                    this.board[row][col].isRevealed = true;
                    this.updateCell(row, col);
                }
            }
        }
    }
    
    checkWin() {
        const totalCells = this.rows * this.cols;
        const nonZombieCells = totalCells - this.totalZombies;
        
        if (this.revealedCount === nonZombieCells && this.gameState === 'playing') {
            this.gameOver(true);
        }
    }
    
    gameOver(won) {
        this.gameState = won ? 'won' : 'lost';
        this.clearTimer();
        
        if (!won) {
            this.revealAllZombies();
            document.getElementById('reset-btn').textContent = '💀';
            this.showScrollingLoseBanner();
        } else {
            document.getElementById('reset-btn').textContent = '😎';
            this.showScrollingWinBanner();
        }
    }
    
    showScrollingLoseBanner() {
        // Create scrolling banner
        const banner = document.createElement('div');
        banner.className = 'lose-banner';
        banner.textContent = '🧟 YOU LOSE! 🧟 THE ZOMBIES ATE YOUR BRAINS! 🧟';
        banner.style.cssText = `
            position: fixed;
            top: 50%;
            left: -100%;
            transform: translateY(-50%);
            background: linear-gradient(90deg, #e63946, #d62828, #9d0208);
            color: white;
            font-size: 2rem;
            font-weight: bold;
            padding: 20px 40px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            z-index: 1001;
            white-space: nowrap;
            animation: scrollBanner 4s ease-in-out;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
            border: 3px solid #ff0000;
        `;
        
        // Add CSS animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes scrollBanner {
                0% { left: -100%; }
                15% { left: 50%; transform: translateX(-50%) translateY(-50%); }
                85% { left: 50%; transform: translateX(-50%) translateY(-50%); }
                100% { left: 150%; }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(banner);
        
        // Remove banner and show popup after 4 seconds
        setTimeout(() => {
            banner.remove();
            style.remove();
            this.showGameOverScreen(false);
        }, 4000);
    }
    
    showScrollingWinBanner() {
        // Create scrolling win banner from right direction
        const banner = document.createElement('div');
        banner.className = 'win-banner';
        banner.textContent = '🌱 VICTORY! 🌱 YOU SAVED THE LAWN! 🌱 ALL ZOMBIES DEFEATED! 🌱';
        banner.style.cssText = `
            position: fixed;
            top: 50%;
            right: -100%;
            transform: translateY(-50%);
            background: linear-gradient(90deg, #10b981, #059669, #047857);
            color: white;
            font-size: 2rem;
            font-weight: bold;
            padding: 20px 40px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            z-index: 1001;
            white-space: nowrap;
            animation: scrollWinBanner 4s ease-in-out;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
            border: 3px solid #065f46;
        `;
        
        // Add CSS animation for right-to-left scrolling
        const style = document.createElement('style');
        style.textContent = `
            @keyframes scrollWinBanner {
                0% { right: -100%; }
                15% { right: 50%; transform: translateX(50%) translateY(-50%); }
                85% { right: 50%; transform: translateX(50%) translateY(-50%); }
                100% { right: 150%; }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(banner);
        
        // Remove banner and show popup after 4 seconds
        setTimeout(() => {
            banner.remove();
            style.remove();
            this.showGameOverScreen(true);
        }, 4000);
    }
    
    showGameOverScreen(won) {
        const overlay = document.createElement('div');
        overlay.className = 'overlay';
        
        const gameOver = document.createElement('div');
        gameOver.className = `game-over ${won ? 'win' : 'lose'}`;
        
        const title = document.createElement('h2');
        title.textContent = won ? 'You Win!' : 'Game Over!';
        
        const message = document.createElement('p');
        message.textContent = won 
            ? `Congratulations! Time: ${document.getElementById('timer').textContent}s`
            : 'You hit a mine! Better luck next time.';
        
        const button = document.createElement('button');
        button.textContent = 'Play Again';
        button.addEventListener('click', () => this.newGame());
        
        gameOver.appendChild(title);
        gameOver.appendChild(message);
        gameOver.appendChild(button);
        
        document.body.appendChild(overlay);
        document.body.appendChild(gameOver);
    }
    
    removeGameOverScreen() {
        const overlay = document.querySelector('.overlay');
        const gameOver = document.querySelector('.game-over');
        if (overlay) overlay.remove();
        if (gameOver) gameOver.remove();
    }
    
    updateZombieCount() {
        const remaining = this.totalZombies - this.flaggedCount;
        document.getElementById('zombie-count').textContent = remaining.toString().padStart(3, '0');
    }
    
    startTimer() {
        this.startTime = Date.now();
        this.timerInterval = setInterval(() => this.updateTimer(), 1000);
    }
    
    updateTimer() {
        if (this.startTime && this.gameState === 'playing') {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            document.getElementById('timer').textContent = elapsed.toString().padStart(3, '0');
        }
    }
    
    clearTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Minesweeper();
});