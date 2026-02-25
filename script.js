const Gameboard = (function() {
    let board = ['', '', '', '', '', '', '', '', ''];

    const getBoard = () => board;

    const setCell = (index, marker) => {
        if (index >= 0 && index < board.length && board[index] === '') {
            board[index] = marker;
            return true;
        }
        return false;
    };

    const resetBoard = () => {
        board = ['', '', '', '', '', '', '', '', ''];
    };

    const isBoardFull = () => board.every(cell => cell !== '');

    return { getBoard, setCell, resetBoard, isBoardFull };
})();

const Player = (name, marker) => {
    return { name, marker };
};

const GameController = (function() {
    let players = [];
    let currentPlayerIndex = 0;
    let gameActive = false;
    let winner = null;

    const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    const startGame = (player1Name, player2Name) => {
        players = [
            Player(player1Name || 'Player 1', 'X'),
            Player(player2Name || 'Player 2', 'O')
        ];
        currentPlayerIndex = 0;
        gameActive = true;
        winner = null;
        Gameboard.resetBoard();
        DisplayController.renderBoard();
        DisplayController.updateGameInfo();
    };

    const getCurrentPlayer = () => players[currentPlayerIndex];

    const switchPlayer = () => {
        currentPlayerIndex = currentPlayerIndex === 0 ? 1 : 0;
    };

    const checkWinner = () => {
        const board = Gameboard.getBoard();
        
        for (let combo of winningCombinations) {
            const [a, b, c] = combo;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                winner = players.find(p => p.marker === board[a]);
                return winner;
            }
        }
        
        return null;
    };

    const playTurn = (index) => {
        if (!gameActive) return false;
        
        const currentPlayer = getCurrentPlayer();
        const success = Gameboard.setCell(index, currentPlayer.marker);
        
        if (success) {
            DisplayController.renderBoard();
            
            const winner = checkWinner();
            if (winner) {
                gameActive = false;
                DisplayController.showGameResult(`${winner.name} wins!`);
            } else if (Gameboard.isBoardFull()) {
                gameActive = false;
                DisplayController.showGameResult("It's a tie!");
            } else {
                switchPlayer();
                DisplayController.updateGameInfo();
            }
        }
        
        return success;
    };

    const restartGame = () => {
        gameActive = true;
        winner = null;
        currentPlayerIndex = 0;
        Gameboard.resetBoard();
        DisplayController.renderBoard();
        DisplayController.updateGameInfo();
        DisplayController.showGameResult('');
    };

    const isGameActive = () => gameActive;
    const getWinner = () => winner;

    return { startGame, playTurn, restartGame, getCurrentPlayer, isGameActive, getWinner };
})();

const DisplayController = (function() {
    const gameboardElement = document.querySelector('.gameboard');
    const currentPlayerElement = document.getElementById('current-player');
    const gameStatusElement = document.getElementById('game-status');
    const player1Input = document.getElementById('player1');
    const player2Input = document.getElementById('player2');
    const startButton = document.getElementById('start-game');
    const restartButton = document.getElementById('restart');

    const createBoard = () => {
        gameboardElement.innerHTML = '';
        const board = Gameboard.getBoard();
        
        board.forEach((cell, index) => {
            const cellElement = document.createElement('div');
            cellElement.classList.add('cell');
            if (cell === 'X') cellElement.classList.add('x');
            if (cell === 'O') cellElement.classList.add('o');
            if (cell !== '') cellElement.classList.add('taken');
            cellElement.textContent = cell;
            cellElement.dataset.index = index;
            
            cellElement.addEventListener('click', handleCellClick);
            gameboardElement.appendChild(cellElement);
        });
    };

    const handleCellClick = (e) => {
        const index = e.target.dataset.index;
        GameController.playTurn(parseInt(index));
    };

    const renderBoard = () => {
        const cells = document.querySelectorAll('.cell');
        const board = Gameboard.getBoard();
        
        cells.forEach((cell, index) => {
            cell.textContent = board[index];
            cell.classList.remove('x', 'o', 'taken');
            if (board[index] === 'X') cell.classList.add('x', 'taken');
            if (board[index] === 'O') cell.classList.add('o', 'taken');
        });
    };

    const updateGameInfo = () => {
        if (GameController.isGameActive()) {
            const currentPlayer = GameController.getCurrentPlayer();
            currentPlayerElement.textContent = `Current Player: ${currentPlayer.name} (${currentPlayer.marker})`;
        }
    };

    const showGameResult = (message) => {
        gameStatusElement.textContent = message;
        if (message) {
            currentPlayerElement.textContent = '';
        }
    };

    const init = () => {
        createBoard();
        
        startButton.addEventListener('click', () => {
            GameController.startGame(player1Input.value, player2Input.value);
        });
        
        restartButton.addEventListener('click', () => {
            GameController.restartGame();
        });
    };

    return { renderBoard, updateGameInfo, showGameResult, init };
})();

document.addEventListener('DOMContentLoaded', () => {
    DisplayController.init();
    GameController.startGame('Player 1', 'Player 2');
});