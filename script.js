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

function loadMoviesData() {
    fetch('movies.json')
        .then(response => response.json())
        .then(data => {
            window.movieData = data;
            console.log("Loaded Movie Data:", window.movieData);
        })
        .catch(error => console.error('Error loading the JSON file:', error));
}

function startNewRound() {
    if (!window.movieData || window.movieData.length === 0) {
        console.error('No movie data to start the game');
        return;
    }
    if (roundIndex >= maxRounds) {
        alert("Game Over!");
        return;
    }
    timeLeft = 90; // Reset the timer
    document.getElementById('timer').innerText = timeLeft; // Update timer display
    document.getElementById('round').innerText = `Round ${roundIndex + 1}/${maxRounds}`; // Update round display
    clearInterval(timerInterval);
    clearTimeout(roundTimer);
    hintIndex = 0;
    revealedLetters = [];
    currentMovie = window.movieData[Math.floor(Math.random() * window.movieData.length)];
    console.log("Selected Movie:", currentMovie);
    updateMovieTitle();
    startHintAndLetterReveal();
    startTimer();
    roundTimer = setTimeout(revealAnswer, 90000); // 90 seconds for the round
    roundIndex++;
}

function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById('timer').innerText = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
        }
    }, 1000);
}

function updateMovieTitle() {
    if (!currentMovie || !currentMovie.title) {
        console.error('No current movie title available');
        return;
    }
    let title = currentMovie.title.split('').map(letter => revealedLetters.includes(letter) ? letter : (letter === ' ' ? ' ' : '-')).join('');
    let letterCount = `(${currentMovie.title.length} letters)`;
    document.getElementById('movie-title').innerHTML = `${title} <small>${letterCount}</small>`;
    console.log("Movie Title Display:", title);
}


function startHintAndLetterReveal() {
    if (!currentMovie) {
        console.error('No current movie to reveal hints and letters');
        return;
    }
    document.getElementById('hints').innerText = '';
    hintInterval = setInterval(revealHint, 5000);
    if (currentMovie.title.length > 6) {
        letterInterval = setInterval(revealLetter, 5000);
    }
}

function revealHint() {
    if (!currentMovie) {
        console.error('No current movie to reveal hints');
        return;
    }
    const hints = [currentMovie.year, currentMovie.director, currentMovie.cast];
    if (hintIndex < hints.length) {
        document.getElementById('hints').innerText += hints[hintIndex] + '\n';
        console.log("Revealing Hint:", hints[hintIndex]);
        hintIndex++;
    } else {
        clearInterval(hintInterval);
    }
}
function showDialog(message) {
    document.getElementById('dialog-text').innerText = message;
    document.getElementById('dialog').style.display = 'block';
}

function closeDialog() {
    document.getElementById('dialog').style.display = 'none';
}

// Replace alert calls with showDialog
function revealAnswer() {
    if (!currentMovie) {
        console.error('No current movie to reveal answer for');
        return;
    }
    showDialog("Time's up! The movie was " + currentMovie.title);
    clearInterval(hintInterval);
    clearInterval(letterInterval);
    startNewRound();
}


function revealLetter() {
    if (!currentMovie) {
        console.error('No current movie to reveal letters');
        return;
    }
    let hiddenLetters = currentMovie.title.split('').filter(letter => !revealedLetters.includes(letter) && letter !== ' ');
    if (hiddenLetters.length > 0) {
        let randomLetter = hiddenLetters[Math.floor(Math.random() * hiddenLetters.length)];
        revealedLetters.push(randomLetter);
        currentMovie.title.split('').forEach((letter, index) => {
            if (letter === randomLetter) {
                revealedLetters.push(letter);
            }
        });
        updateMovieTitle();
        console.log("Revealed Letter:", randomLetter);
    } else {
        clearInterval(letterInterval);
    }
}

function createRoom() {
    currentRoomId = Math.random().toString(36).substr(2, 9); // Generate a unique room ID
    document.getElementById('room-id-section').style.display = 'block';
    document.getElementById('room-id').innerText = "Room ID: " + currentRoomId;
}

function joinRoom() {
    currentRoomId = prompt("Enter the Room ID:");
    if (currentRoomId) {
        alert("Joined Room: " + currentRoomId);
        startGame();
    }
}

function copyRoomId() {
    const roomIdText = document.getElementById('room-id').innerText;
    navigator.clipboard.writeText(roomIdText).then(() => {
        alert("Room ID copied to clipboard: " + roomIdText);
    }).catch(err => {
        console.error('Failed to copy Room ID: ', err);
    });
}

function startGame() {
    document.getElementById('home-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';
    startNewRound();
}

function submitGuess() {
    if (!currentMovie || !currentMovie.title) {
        console.error('No current movie to submit guess for');
        return;
    }
    let guessInput = document.getElementById('guess');
    let guess = guessInput.value;
    let guessesDiv = document.getElementById('guesses');
    guessesDiv.innerHTML += `<p>${guess}</p>`;
    guessInput.value = '';
    if (guess.toLowerCase() === currentMovie.title.toLowerCase()) {
        alert("Correct! The movie was " + currentMovie.title);
        clearTimeout(roundTimer);
        clearInterval(hintInterval);
        clearInterval(letterInterval);
        startNewRound();
    } else if (isPhoneticallySimilar(guess, currentMovie.title)) {
        alert("Close! Try again.");
    }
}

function isPhoneticallySimilar(guess, title) {
    // A simple phonetic comparison function (can be enhanced)
    return guess.toLowerCase().startsWith(title[0].toLowerCase());
}

function revealAnswer() {
    if (!currentMovie) {
        console.error('No current movie to reveal answer for');
        return;
    }
    alert("Time's up! The movie was " + currentMovie.title);
    clearInterval(hintInterval);
    clearInterval(letterInterval);
    startNewRound();
}

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        submitGuess();
    }
}

// Ensure we load the home screen first
window.onload = function() {
    document.getElementById('home-screen').style.display = 'block';
    document.getElementById('game-screen').style.display = 'none';
}

// Load movies data when the script runs
loadMoviesData();
