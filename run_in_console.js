import keypress from 'keypress';
import Game from "./engine/game.js";

keypress(process.stdin);


/**
 * The code in this file is used to run your game in the console. Use it
 * to help develop your game engine.
 *
 */

let game = new Game(4);
console.log(game.toString());

let testWinningBoard = [
      32,  8, 2,
    1024, 16, 4,
    1024, 8,  2
]

let testLosingBoard = [
    32,  8, 2,
     2, 16, 4,
     2, 8,  2
]

let testGameState = {
    board: testWinningBoard,
    score: 67372,
    won: false,
    over: false
}

// console.log(">>> Loading test game:");
// game.loadGame(testGameState);
// console.log(game.toString());

game.onMove(gameState => {
    console.log(game.toString());
    // console.log(game.gameState);
});

game.onWin(gameState => {
    console.log('You won with a gameState of...', gameState)
    process.stdin.pause();
});

game.onLose(gameState => {
    console.log('You lost! :(', gameState)
    console.log(`Your score was ${gameState.score}`);
    process.stdin.pause();
});

process.stdin.on('keypress', function (ch, key) {
    switch (key.name) {
        case 'right':
            game.move('right');
            break;
        case 'left':
            game.move('left');
            break;
        case 'down':
            game.move('down');
            break;
        case 'up':
            game.move('up');
            break;
    }
    if (key && key.ctrl && key.name == "c" || key.name == "escape") {
        process.stdin.pause();
    }
});

process.stdin.setRawMode(true);
process.stdin.resume();