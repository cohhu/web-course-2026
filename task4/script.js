const state = {
    secretNumber: '',
    history: [],
    isGameOver: false
};


const guessInput = document.getElementById('guess-input');
const guessBtn = document.getElementById('guess-btn');
const newGameBtn = document.getElementById('new-game-btn');
const guessForm = document.getElementById('guess-form');
const attemptsCountEl = document.getElementById('attempts-count');
const historyListEl = document.getElementById('history-list');
const messageBoxEl = document.getElementById('message-box');


function generateSecretNumber() {
    const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    let result = '';

    for (let i = 0; i < 4; i++) {
        const randomIndex = Math.floor(Math.random() * digits.length);
        result += digits.splice(randomIndex, 1)[0];
    }

    return result;
}


function validateInput(guess) {

    if (!/^\d+$/.test(guess)) {
        return { isValid: false, message: 'Ошибка: вводите только цифры (без букв и символов)!' };
    }


    if (guess.length !== 4) {
        return { isValid: false, message: 'Ошибка: число должно содержать ровно 4 цифры!' };
    }


    const uniqueDigits = new Set(guess);
    if (uniqueDigits.size !== 4) {
        return { isValid: false, message: 'Ошибка: все цифры должны быть разными!' };
    }

    return { isValid: true, message: '' };
}


function calculateBullsAndCows(secret, guess) {
    let bulls = 0;
    let cows = 0;

    for (let i = 0; i < 4; i++) {
        if (guess[i] === secret[i]) {
            bulls++;
        } else if (secret.includes(guess[i])) {
            cows++;
        }
    }

    return { bulls, cows };
}



function getDeclension(number, [one, few, many]) {
    const abs = Math.abs(number) % 100;
    const n1 = abs % 10;
    if (abs > 10 && abs < 20) return many;
    if (n1 > 1 && n1 < 5) return few;
    if (n1 === 1) return one;
    return many;
}


function showMessage(text, type = 'error') {
    messageBoxEl.textContent = text;
    messageBoxEl.className = `message-box ${type}`;
}


function clearMessage() {
    messageBoxEl.textContent = '';
    messageBoxEl.className = 'message-box hidden';
}


function render() {

    attemptsCountEl.textContent = state.history.length;
    historyListEl.innerHTML = '';

    state.history.forEach((entry, index) => {
        const li = document.createElement('li');

        const bullsLabel = getDeclension(entry.bulls, ['бык', 'быка', 'быков']);
        const cowsLabel = getDeclension(entry.cows, ['корова', 'коровы', 'коров']);

        li.innerHTML = `
            <span><strong>#${index + 1}.</strong> ${entry.guess}</span>
            <span>
                <span class="badge badge-bulls">${entry.bulls} ${bullsLabel}</span>,
                <span class="badge badge-cows">${entry.cows} ${cowsLabel}</span>
            </span>
        `;
        historyListEl.appendChild(li);
    });


    const container = document.querySelector('.history-container');
    container.scrollTop = container.scrollHeight;


    guessInput.disabled = state.isGameOver;
    guessBtn.disabled = state.isGameOver;

    if (state.isGameOver) {
        const attemptsWord = getDeclension(state.history.length, ['попытку', 'попытки', 'попыток']);
        showMessage(`Победа! Угадано за ${state.history.length} ${attemptsWord}!`, 'success');
    }
}


function handleGuess() {
    if (state.isGameOver) return;

    clearMessage();
    const guess = guessInput.value.trim();

    const validation = validateInput(guess);
    if (!validation.isValid) {
        showMessage(validation.message, 'error');
        guessInput.focus();
        return;
    }


    const { bulls, cows } = calculateBullsAndCows(state.secretNumber, guess);
    state.history.push({ guess, bulls, cows });


    if (bulls === 4) {
        state.isGameOver = true;
    }


    guessInput.value = '';
    render();

    if (!state.isGameOver) {
        guessInput.focus();
    }
}


function startNewGame() {
    state.secretNumber = generateSecretNumber();
    state.history = [];
    state.isGameOver = false;

    console.log(`[DEBUG] Загадано число: ${state.secretNumber}`);

    clearMessage();
    guessInput.value = '';
    render();
    guessInput.focus();
}


guessForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleGuess();
});

newGameBtn.addEventListener('click', startNewGame);

startNewGame();