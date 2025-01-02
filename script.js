// Constants and Globals
let currentRoomId;
let currentMovie;
let revealedLetters = [];
let hintIndex = 0;
let roundIndex = 0;
let maxRounds = 5;
let hintInterval;
let letterInterval;
let roundTimer;
let timerInterval;
let timeLeft = 90;
let ws;

function initializeWebSocket() {
    ws = new WebSocket('ws://localhost:8080');

    ws.onopen = () => {
        console.log('WebSocket connection established');
    };

    ws.onmessage = (message) => {
        const data = JSON.parse(message.data);
    
        console.log('Received message from server:', data); // Log received messages
    
        switch (data.action) {
            case 'roomCreated':
                console.log('Room Created:', data.roomId);
                document.getElementById('room-id-section').style.display = 'block';
                document.getElementById('room-id').innerText = "Room ID: " + data.roomId;
                break;
            case 'joinedRoom':
                console.log('Joined Room:', data.roomId);
                const homeScreen = document.getElementById('home-screen');
                const gameScreen = document.getElementById('game-screen');
    
                homeScreen.style.display = 'none';
                gameScreen.style.display = 'block';
    
                document.getElementById('room-id-section').style.display = 'block';
                document.getElementById('room-id').innerText = "Room ID: " + data.roomId;
    
                startNewRound();
                break;
            case 'gameStarted':
                console.log('Game Started:', data.gameState);
                startGameWithState(data.gameState);
                break;
            case 'updateGameState':
                console.log('Game State Updated:', data.gameState);
                updateGameState(data.gameState);
                break;
            case 'error':
                console.error('Server Error:', data.message);
                alert(`Error: ${data.message}`); // Show error message to the user
                break;
            default:
                console.log('Unknown action:', data.action);
        }
    };
    

    ws.onerror = (error) => { 
        console.error('WebSocket error:', error); 
    };
}

initializeWebSocket();


const transliterationMap = {
    'th': 'dh',
    'dh': 'th',
    'zh': 'l',
    'l': 'zh',
    'aa': 'a',
    'a': 'aa',
    'k': 'g',
    'g': 'k',
    'c': 's',
    's': 'c',
    'v': 'w',
    'w': 'v',
    'ph': 'f',
    'f': 'ph',
    'b': 'p',
    'p': 'b',
    'j': 'zh',
    'zh': 'j',
    'u': 'oo',
    'oo': 'u',
    'r': 'l',
    'l': 'r'
};

// Load and filter movie data
function loadMoviesData(callback) {
    fetch('movies.json')
        .then(response => response.json())
        .then(data => {
            window.movieData = data.filter(movie => {
                const words = movie.title.split(' ');
                return words.length < 3 && (movie.title.length <= 15);
            });
            console.log('Filtered Movies:', window.movieData);
        })
        .catch(error => console.error('Error loading the JSON file:', error));
}
window.onload = function() { 
    loadMoviesData(() => { 
        console.log('Movies data loaded, ready to start game.'); 
        // Now it's safe to call startGame 
        document.getElementById('start-game-button').addEventListener('click', startGame); }); };

// Start a new round
function startNewRound() {
    console.log('startNewRound function called');
    if (!window.movieData || window.movieData.length === 0) {
        console.error('No movie data to start the game');
        return;
    }

    if (roundIndex >= maxRounds) {
        showEndMessage("Game Over!");
        return;
    }

    timeLeft = 90; // Reset the timer
    document.getElementById('timer').innerText = timeLeft; // Update timer display
    document.getElementById('round').innerText = `Round ${roundIndex + 1}/${maxRounds}`; // Update round display
    clearInterval(timerInterval);
    clearTimeout(roundTimer);
    hintIndex = 0;
    revealedLetters = [];

    currentMovie = window.movieData[Math.floor(Math.random() * window.movieData.length)]; // Set currentMovie globally
    console.log("Selected Movie:", currentMovie);

    const titleDashes = currentMovie.title.split('').map(letter => (letter === ' ' ? ' ' : '_')).join(' '); 
    const lengthIndicator = `(${currentMovie.title.replace(/ /g, '').length})`; // Calculate length excluding spaces

    document.getElementById('movie-title').innerText = currentMovie.title.split('').map(letter => (letter === ' ' ? ' ' : '_')).join(' '); // Show dashes for the movie title
    document.getElementById('hints').innerText = `Year: ${currentMovie.year}, Director: ${currentMovie.director}`; // Update hints

    updateMovieTitle();
    startHintAndLetterReveal();
    startTimer();
    roundTimer = setTimeout(revealAnswer, 90000); // 90 seconds for the round
    roundIndex++;
}




// Start the timer
function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById('timer').innerText = timeLeft;
        if (timeLeft <= 20) {
            document.getElementById('timer').classList.add('timer-warning');
        }
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            revealAnswer();
        }
    }, 1000);
}

// Update the displayed movie title
function updateMovieTitle() {
    if (!currentMovie) {
        console.error('No current movie title available');
        return;
    }

    const movieTitleElement = document.getElementById('movie-title');
    const title = currentMovie.title.split('').map((letter, index) => revealedLetters.includes(index) ? letter : (letter === ' ' ? ' ' : '_')).join(' ');
    const lengthIndicator = `(${currentMovie.title.replace(/ /g, '').length})`; // Calculate length excluding spaces
    movieTitleElement.innerText = `${title} ${lengthIndicator}`; // Show dashes and length indicator
    console.log("Updated Movie Title Display:", `${title} ${lengthIndicator}`);
}





// Start hint and letter reveal
function startHintAndLetterReveal() {
    if (!currentMovie) {
        console.error('No current movie to reveal hints and letters');
        return;
    }

    document.getElementById('hints').innerText = '';
    hintInterval = setInterval(revealHint, 8000);

    const titleArray = currentMovie.title.split('');
    const nonSpaceLetters = titleArray.filter(letter => letter !== ' ');
    const maxRevealedLetters = Math.ceil(nonSpaceLetters.length * 0.6);
    let lettersRevealedCount = 0;

    function revealSingleLetter() {
        let hiddenLetters = titleArray.map((letter, index) => {
            if (!revealedLetters.includes(index) && letter !== ' ') {
                return { letter: letter, index: index };
            }
            return null;
        }).filter(item => item !== null);

        console.log("Hidden Letters:", hiddenLetters.map(item => item.letter));
        console.log("Revealed Letters Count:", lettersRevealedCount);
        console.log("Max Revealed Letters:", maxRevealedLetters);
        console.log("Revealed Letters Indexes:", revealedLetters);

        if (hiddenLetters.length > 0 && lettersRevealedCount < maxRevealedLetters) {
            let randomLetterObj = hiddenLetters[Math.floor(Math.random() * hiddenLetters.length)];
            revealedLetters.push(randomLetterObj.index);
            lettersRevealedCount++;
            updateMovieTitle();
            console.log("Revealed Letter:", randomLetterObj.letter);
            console.log("Letters Revealed Count After:", lettersRevealedCount);
        } else {
            clearInterval(letterInterval);
            console.log("Stopped Revealing Letters");
        }
    }

    letterInterval = setInterval(revealSingleLetter, 8000);
}

function updateMovieTitle() {
    if (!currentMovie) {
        console.error('No current movie title available');
        return;
    }

    const movieTitleElement = document.getElementById('movie-title');
    const title = currentMovie.title.split('').map((letter, index) => revealedLetters.includes(index) ? letter : (letter === ' ' ? ' ' : '_')).join(' ');
    const lengthIndicator = `(${currentMovie.title.replace(/ /g, '').length})`; // Calculate length excluding spaces
    movieTitleElement.innerText = `${title} ${lengthIndicator}`; // Show dashes and length indicator
    console.log("Updated Movie Title Display:", `${title} ${lengthIndicator}`);
}


// Reveal hints
function revealHint() {
    if (!currentMovie) {
        console.error('No current movie to reveal hints');
        return;
    }
    const hints = [
        `Year: ${currentMovie.year}`,
        `Director: ${currentMovie.director}`,
        ...currentMovie.cast.split(',').map((actor, index) => `Cast ${index + 1}: ${actor.trim()}`)
    ];
    if (hintIndex < hints.length) {
        document.getElementById('hints').innerText += hints[hintIndex] + '\n';
        console.log("Revealing Hint:", hints[hintIndex]);
        hintIndex++;
    } else {
        clearInterval(hintInterval);
    }

    ws.send(JSON.stringify({ action: 'revealHint', roomId: currentRoomId }));
}

// Show dialog
function showDialog(message) {
    document.getElementById('dialog-text').innerText = message;
    document.getElementById('dialog').style.display = 'block';
}

// Close dialog
function closeDialog() {
    document.getElementById('dialog').style.display = 'none';
}

// Show end message
function showEndMessage(message) {
    document.getElementById('end-message-text').innerText = message;
    document.getElementById('end-message').style.display = 'block';
}

// Close end message and start new round
function closeEndMessage() {
    document.getElementById('end-message').style.display = 'none';
    startNewRound();
}
// Reveal the answer
function revealAnswer() {
    if (!currentMovie) {
        console.error('No current movie to reveal answer for');
        return;
    }
    showEndMessage("Time's up! The movie was " + currentMovie.title);
    clearInterval(hintInterval);
    clearInterval(letterInterval);
}

function revealLetter() { 
    // Existing logic (if any) // WebSocket logic to reveal a letter 
    
    ws.send(JSON.stringify({ action: 'revealLetter', roomId: currentRoomId })); 

}

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        submitGuess();
    }
}
// Create a room
function createRoom() {
    currentRoomId = Math.random().toString(36).substr(2, 9); // Generate a unique room ID
    document.getElementById('room-id-section').style.display = 'block';
    document.getElementById('room-id').innerText = currentRoomId;
    const message = JSON.stringify({ action: 'createRoom', roomId: currentRoomId });
    ws.send(message);
    console.log('Sent createRoom message:', message); // Log sent message
}



// Join a room
function joinRoom() {
    const roomId = prompt('Enter Room ID:');
    if (roomId) {
        const message = JSON.stringify({ action: 'joinRoom', roomId: roomId });
        ws.send(message);
        console.log('Sent joinRoom message:', message); // Log sent message
    }
}




// Copy the room ID
function copyRoomId() {
    const roomId = document.getElementById('room-id').innerText.split(': ')[1];
    navigator.clipboard.writeText(roomId).then(() => {
        alert('Room ID copied to clipboard');
    }).catch(err => {
        console.error('Error copying Room ID: ', err);
    });
}


// Start the game
function startGame() {
    console.log('startGame function called');
    if (!window.movieData || window.movieData.length === 0) {
        console.error('No movie data to start the game');
        alert('Movie data is not loaded. Please try again.');
        return;
    }

    const roomId = document.getElementById('room-id').innerText.split(': ')[1];
    if (roomId) {
        const message = JSON.stringify({ action: 'startGame', roomId: roomId });
        ws.send(message);
        console.log('Sent startGame message:', message); // Log sent message
    }

    const homeScreen = document.getElementById('home-screen');
    const gameScreen = document.getElementById('game-screen');
    
    homeScreen.style.display = 'none';
    gameScreen.style.display = 'block';
    
    startNewRound();
}





// Check if the guess is phonetically similar
function applyTransliterationRules(guess, title) {
    const guessLower = guess.toLowerCase();
    const titleLower = title.toLowerCase();
    for (let key in transliterationMap) {
        const regex = new RegExp(key, 'g');
        if (titleLower.replace(regex, transliterationMap[key]) === guessLower) {
            return true;
        }
    }
    return false;
}

function isPhoneticallySimilar(guess) {
    return applyTransliterationRules(guess, currentMovie.title);
}

// Submit a guess
function submitGuess() {
    if (!currentMovie || !currentMovie.title) {
        console.error('No current movie to submit guess for');
        return;
    }
    let guessInput = document.getElementById('guess');
    let playerName = document.getElementById('player-name').value || 'Anonymous';
    let guess = guessInput.value.trim();
    if (guess === '') return;
    let guessesDiv = document.getElementById('guesses');
    guessesDiv.innerHTML += `<div class="guess-item"><strong>${playerName}:</strong> ${guess}</div>`;
    guessInput.value = '';
    if (guess.toLowerCase() === currentMovie.title.toLowerCase()) {
        showEndMessage(`Correct! The movie was ${currentMovie.title}`);
        clearTimeout(roundTimer);
        clearInterval(hintInterval);
        clearInterval(letterInterval);
    } else if (isPhoneticallySimilar(guess)) {
        showDialog("Close! Try again.");
    }
}
function handleKeyPress(event) {
    if (event.key === 'Enter') {
        submitGuess();
    }
}

function startGameWithState(gameState) {
    currentMovie = gameState.movie;
    revealedLetters = gameState.revealedLetters;
    updateMovieTitle();
    // Initialize other game states if needed
}

function updateGameState(gameState) {
    currentMovie = gameState.movie;
    revealedLetters = gameState.revealedLetters;
    updateMovieTitle();
    // Update other game states if needed
}


// Ensure we load the home screen first


// Load movies data when the script runs

