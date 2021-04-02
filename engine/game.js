/*
Add your code for Game here
 */

export default class Game {    

    constructor(size) {
        this.size = (size < 2)? 2 : size;
        this.goal = 2048;
        this.paused = false;
        this.register = {move: [], lose: [], win: []};
        this.animationData = {from: [], to: [], direction: ""};
        this.setupNewGame();
    }

    // PUBLIC METHODS

    setupNewGame() {
        this.gameState = {
            board: new Array(Math.pow(this.size, 2)).fill(0),
            score: 0,
            won: false,
            over: false,
        };
        this.lastMove = {
            points: 0,
            board: [],
            direction: ""
        };
        this.goal = 2048;
        this._addTile();
        this._addTile();
    }

    loadGame(gameState) {
        let copy = {
            board: [... gameState.board],
            score: gameState.score,
            won: gameState.won,
            over: gameState.over,
        };
        this.gameState = copy;
        this.size = Math.sqrt(gameState.board.length);
    }

    getGameState() {
        let copy = {
            board: [... this.gameState.board],
            score: this.gameState.score,
            won: this.gameState.won,
            over: this.gameState.over,
        };
        return copy;
    }

    move(direction) {
        if(!this.gameState.over && !this.paused) {
            let current = this.gameState.board;
            let move = this._executeMove(direction);
            if( !this._equals(move.board, current) ) {
                // If move produced a change
                this.gameState.board = move.board;
                this.gameState.score += move.points;
                this.lastMove = move;
                this._addTile();
                this._emit("move");
            }
            current = this.gameState.board;
            if(current.includes(this.goal)) {
                // If after move there is a 2048 tile:
                this.gameState.won = true;
                this._emit("win");
                // this.goal = this.goal * 2;
            } else if(this._getSpaces(this.gameState.board).length === 0) {
                // If after move there are no spaces left:
                let tryUp = this._executeMove("up").board;
                let tryDown = this._executeMove("down").board;
                let tryLeft = this._executeMove("left").board;
                let tryRight = this._executeMove("right").board;
                if( // If no possible moves left:
                    this._equals(tryUp, current) &&
                    this._equals(tryDown, current) &&
                    this._equals(tryLeft, current) &&
                    this._equals(tryRight, current)
                ) {
                    this.gameState.over = true;
                    this._emit("lose");
                }
            }
        }
    }

    onMove(callback) {
        this.register.move.push(callback);
    }

    onWin(callback) {
        this.register.win.push(callback);
    }

    onLose(callback) {
        this.register.lose.push(callback);
    }

    toString() {
        let maxTileWidth = String(Math.max(... this.gameState.board)).length;
        let stringWidth = (maxTileWidth + 3);
        let boardString = "";
        boardString = `${boardString}move:  ${this.lastMove.direction}\r\n`;
        boardString = `${boardString}score: ${this.gameState.score} +${this.lastMove.points}\r\n`;
        for(let row = 0; row < this.size; row++) {
            if(row === 0) { boardString = `${boardString}${this._drawBorder("╔═╤═╗", stringWidth, this.size)}\r\n` };
            let rowString = "";
            for(let col = 0; col < this.size; col++) {
                if(col === 0) { rowString = `${rowString}║ `; };
                let rowMajor = this.size * row + col;
                let tileString = (this.gameState.board[rowMajor] !== 0)? String(this.gameState.board[rowMajor]) : " ";
                let padding = maxTileWidth - tileString.length;
                for(let i = 0; i < padding; i++) { tileString = " " + tileString };
                rowString = `${rowString}${tileString} │ `;
                if(col === this.size-1) { rowString = `${rowString.slice(0, -2)}║`; };
            }
            boardString = `${boardString}${rowString}\r\n`;
            if(row !== this.size-1) {
                boardString = `${boardString}${this._drawBorder("╟─┼─╢", stringWidth, this.size)}\r\n`;
            } else {
                boardString = `${boardString}${this._drawBorder("╚═╧═╝", stringWidth, this.size)}`;
            }
        }
        return boardString;
    }

    getAnimationData() {
        return this.animationData;
    }

    getGoal() {
        return this.goal;
    }

    doubleGoal() {
        this.goal = this.goal * 2;
    }

    pause() {
        this.paused = true;
    }

    unpause() {
        this.paused = false;
    }

    // PRIVATE METHODS BEYOND THIS POINT :(

    _executeMove(direction) {
        let splitBoard = this._splitBoardInto(direction);
        let splitMoved = [];
        let pointsGained = 0;
        let animationData = {
            from: [],
            to: [],
            direction: direction
        };
        splitBoard.forEach((line, index) => {
            let result = this._mergeLine(line, direction, index);
            pointsGained += result.points;
            splitMoved.push(result.line);
            result.from.forEach(element => {
                if(element.length > 0) {
                    animationData.from.push(element);
                }
            });
            result.to.forEach(element => {
                if(element.length > 0) {
                    animationData.to.push(element);
                }
            });
        });
        this.animationData.from = animationData.from;
        this.animationData.to = animationData.to;
        this.animationData.direction = animationData.direction;
        let newBoard = this._reassembleBoard(splitMoved, direction);
        return {
            points: pointsGained,
            board: newBoard,
            direction: direction
        }
    }

    _splitBoardInto(direction) {
        let lines = [];
        if(direction === "row" || direction === "left" || direction === "right") {
            for(let i = 0; i < this.size; i++) {
                let row = this.gameState.board.slice((i * this.size), (i * this.size + this.size))
                lines.push(row);
            }
        } else if(direction === "col" || direction === "up" || direction === "down") {
            for(let x = 0; x < this.size; x++) {
                let col = [];
                for(let y = 0; y < this.size; y++) { col.push(this.gameState.board[y * this.size + x]) };
                lines.push(col);
            }
        }
        return lines;
    }

    _mergeLine(line, direction, lineNumber) {
        let shifted = [];
        let from = [];
        let to = [];
        let tileCount = this.size - this._getSpaces(line).length;
        line.forEach((tile, index) => {
            if(tile !== 0) {
                shifted.push(tile);
                let orig = [];
                let dest = [];
                if(direction === "up") {
                    orig = [lineNumber, index];
                    dest = [lineNumber, (shifted.length-1)];
                } else if(direction === "down") {
                    orig = [lineNumber, index];
                    dest = [lineNumber, (this.size)-tileCount];
                    tileCount -= 1;
                } else if(direction === "left") {
                    orig = [index, lineNumber];
                    dest = [(shifted.length-1), lineNumber];
                } else if(direction === "right") {
                    orig = [index, lineNumber];
                    dest = [(this.size)-tileCount, lineNumber];
                    tileCount -= 1;
                }
                from.push(orig);
                to.push(dest);
            }
        })
        if(direction === "down" || direction === "right") { shifted.reverse() };
        let gainedPoints = 0;
        let collapsed = [];
        if(shifted.length > 1) {
            for(let i = 1; i < shifted.length; i++) {
                if(shifted[i-1] === shifted[i]) {
                    collapsed.push(shifted[i]*2);
                    if(direction === "up") {
                        for(let x = i; x < to.length; x++) {
                            to[x][1] -= 1;
                        }
                    } else if(direction === "left") {
                        for(let x = i; x < to.length; x++) {
                            to[x][0] -= 1;
                        }
                    } else if(direction === "down") {
                        for(let x = i; x < to.length; x++) {
                            to[(to.length-1)-x][1] += 1;
                        }
                    } else if(direction === "right") {
                        for(let x = i; x < to.length; x++) {
                            to[(to.length-1)-x][0] += 1;
                        }
                    }
                    gainedPoints += shifted[i]*2;
                    if(i === shifted.length-2) { collapsed.push(shifted[i+1]) };
                    i++;
                } else {
                    collapsed.push(shifted[i-1]);
                    if(i === shifted.length-1) { collapsed.push(shifted[i]) };
                }
            }
        } else {
            collapsed = shifted;
        }
        let padding = line.length - collapsed.length;
        for(let i = 0; i < padding; i++) { collapsed.push(0) };
        if(direction === "down" || direction === "right") { collapsed.reverse() };
        return {
            line: collapsed, 
            points: gainedPoints,
            from: from,
            to: to
        };
    }

    _reassembleBoard(lines, direction) {
        let size = lines[0].length;
        let assembled = [];
        if(direction === "row" || direction === "left" || direction === "right") {
            lines.forEach((row) => {
                row.forEach((tile) => {
                    assembled.push(tile);
                })
            })
        } else if(direction === "col" || direction === "up" || direction === "down") {
            for(let x = 0; x < size; x++) {
                for(let y = 0; y < size; y++) {
                    assembled[size * y + x] = lines[x][y];
                }
            }
        }
        return assembled;
    }

    _equals(a, b) {
        return ( a.length === b.length && a.every((v, i) => v === b[i]) )
    }
    
    _getSpaces(array) {
        let spaces = [];
        array.forEach((tile, position) => { if(tile === 0) { spaces.push(position) } });
        return spaces;
    }

    _addTile() {
        let spaces = this._getSpaces(this.gameState.board);
        if(spaces.length > 0) {
            this.gameState.board.forEach((tile, position) => { if(tile === 0) { spaces.push(position) } });
            let randomSpace = spaces[Math.floor(Math.random() * spaces.length)];
            let randomValue = (Math.floor(Math.random() * 10) === 0)? 4 : 2;
            this.gameState.board[randomSpace] = randomValue;
        }
    }

    _drawBorder(template, length, division) {
        let perTile = "";
        for(let i = 0; i < length-1; i++) { perTile = `${perTile}${template[1]}` };
        perTile = `${perTile}${template[2]}`;
        let span = "";
        for(let i = 0; i < division; i++) { span = `${span}${perTile}` };
        let border = template[0] + span.slice(0, -1) + template[template.length-1];
        return border;
    }

    _emit(event) {
        let callbacks = [];
        switch(event) {
            case "move":
                callbacks = this.register.move;
                break;
            case "win":
                callbacks = this.register.win;
                break;
            case "lose":
                callbacks = this.register.lose;
                break;
        }
        callbacks.forEach((callback) => {
            callback(this.gameState);
        })
    }
}