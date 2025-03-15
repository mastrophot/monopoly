class Monopoly {
    constructor() {
        this.gameId = null;
        this.playerId = null;
        this.playerName = null;
        this.isHost = false;
        this.players = {};
        this.currentTurn = null;
        this.gameState = null;

        // DOM Elements
        this.startScreen = document.getElementById('startScreen');
        this.waitingScreen = document.getElementById('waitingScreen');
        this.gameScreen = document.getElementById('gameScreen');
        this.playerNameInput = document.getElementById('playerName');
        this.gameCodeInput = document.getElementById('gameCode');
        this.gameCodeDisplay = document.getElementById('gameCodeDisplay');
        this.playersList = document.getElementById('playersList');
        this.startGameButton = document.getElementById('startGame');

        // Bind event listeners
        document.getElementById('createGame').addEventListener('click', () => this.createGame());
        document.getElementById('joinGame').addEventListener('click', () => this.showJoinGame());
        this.gameCodeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.joinGame();
        });
        this.startGameButton.addEventListener('click', () => this.startGame());
    }

    // Генерація унікального коду гри
    generateGameCode() {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    // Створення нової гри
    async createGame() {
        const playerName = this.playerNameInput.value.trim();
        if (!playerName) {
            alert('Будь ласка, введіть ваше ім\'я');
            return;
        }

        this.playerName = playerName;
        this.gameId = this.generateGameCode();
        this.playerId = Date.now().toString();
        this.isHost = true;

        try {
            await database.ref(`games/${this.gameId}`).set({
                status: 'waiting',
                host: this.playerId,
                players: {
                    [this.playerId]: {
                        name: this.playerName,
                        isHost: true,
                        money: 1500,
                        position: 0
                    }
                }
            });

            this.showWaitingScreen();
            this.listenToGameChanges();
        } catch (error) {
            console.error('Error creating game:', error);
            alert('Помилка при створенні гри');
        }
    }

    // Показати поле для введення коду гри
    showJoinGame() {
        document.querySelector('.room-options').style.display = 'none';
        this.gameCodeInput.style.display = 'block';
    }

    // Приєднання до існуючої гри
    async joinGame() {
        const playerName = this.playerNameInput.value.trim();
        const gameCode = this.gameCodeInput.value.trim().toUpperCase();

        if (!playerName || !gameCode) {
            alert('Будь ласка, введіть ваше ім\'я та код гри');
            return;
        }

        try {
            const gameRef = database.ref(`games/${gameCode}`);
            const snapshot = await gameRef.once('value');
            const gameData = snapshot.val();

            if (!gameData) {
                alert('Гру не знайдено');
                return;
            }

            if (gameData.status !== 'waiting') {
                alert('Гра вже почалась');
                return;
            }

            const playersCount = Object.keys(gameData.players || {}).length;
            if (playersCount >= 8) {
                alert('Гра заповнена');
                return;
            }

            this.gameId = gameCode;
            this.playerName = playerName;
            this.playerId = Date.now().toString();

            await gameRef.child('players').child(this.playerId).set({
                name: this.playerName,
                isHost: false,
                money: 1500,
                position: 0
            });

            this.showWaitingScreen();
            this.listenToGameChanges();
        } catch (error) {
            console.error('Error joining game:', error);
            alert('Помилка при приєднанні до гри');
        }
    }

    // Показати екран очікування
    showWaitingScreen() {
        this.startScreen.style.display = 'none';
        this.waitingScreen.style.display = 'block';
        this.gameCodeDisplay.textContent = this.gameId;
        if (this.isHost) {
            this.startGameButton.style.display = 'block';
        }
    }

    // Оновлення списку гравців
    updatePlayersList(players) {
        this.playersList.innerHTML = '';
        Object.entries(players).forEach(([id, player]) => {
            const playerElement = document.createElement('div');
            playerElement.textContent = `${player.name}${player.isHost ? ' (Хост)' : ''}`;
            this.playersList.appendChild(playerElement);
        });
    }

    // Слухаємо зміни в грі
    listenToGameChanges() {
        const gameRef = database.ref(`games/${this.gameId}`);
        
        gameRef.on('value', (snapshot) => {
            const gameData = snapshot.val();
            if (!gameData) return;

            this.players = gameData.players || {};
            this.updatePlayersList(this.players);

            if (gameData.status === 'playing' && this.waitingScreen.style.display !== 'none') {
                this.startGameScreen();
            }
        });
    }

    // Початок гри
    async startGame() {
        if (!this.isHost) return;

        const playersCount = Object.keys(this.players).length;
        if (playersCount < 2) {
            alert('Потрібно мінімум 2 гравці для початку гри');
            return;
        }

        try {
            await database.ref(`games/${this.gameId}`).update({
                status: 'playing',
                currentTurn: Object.keys(this.players)[0]
            });
        } catch (error) {
            console.error('Error starting game:', error);
            alert('Помилка при запуску гри');
        }
    }

    // Показати ігровий екран
    startGameScreen() {
        this.waitingScreen.style.display = 'none';
        this.gameScreen.style.display = 'block';
        // TODO: Ініціалізація ігрового поля
    }
}

// Ініціалізація гри при завантаженні сторінки
window.onload = () => {
    new Monopoly();
};
