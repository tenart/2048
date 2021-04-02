export default class View {

    constructor(gameModel) {
        this.gameModel = gameModel;
        this.reset();
        this.gameModel.onMove(gameState => {
            this.animationData = this.gameModel.getAnimationData();
            this.animateBoard();
            this.indexHistory += 1;
            this.boardHistory[this.indexHistory] = this.gameModel.getGameState();
            if(this.indexHistory-1 < this.boardHistory.length) {
                this.boardHistory = this.boardHistory.slice(0, this.indexHistory+1);
            }
        })
        this.gameModel.onWin(gameState => {    
            this.gameModel.pause();        
            setTimeout(() => {
                $(".solitaire").solitaireVictory();
            }, this.slideAnimationDelay);  
            setTimeout(() => {            
                this.currentGoal = this.gameModel.getGoal();
                let title = this.currentGoal + "!";
                let msg1 = `<p>Way to go! You've made it to ${this.currentGoal}. Keep on going until ${this.currentGoal * 2}!</p>`;
                let msg2 = `<p>Your score is: <span class="bold">${this.gameModel.getGameState().score}</span></p>`;
                this.showAlert("win", title, [msg1, msg2]);
            }, this.slideAnimationDelay + 3500);  
        })
        this.gameModel.onLose(gameState => {
            this.gameModel.pause();
            setTimeout(() => {
                let title = `Out of Moves!`;
                let msg1 = `<p>Uh oh! There are no moves left.</p>`;
                let msg2 = `<p>Your score is: <span class="bold">${this.gameModel.getGameState().score}</span></p>`;
                let msg3 = `<p>Use the <span class="underline">B</span>ack button to undo moves, or try again and start a new game!</p>`;
                this.showAlert("lose", title, [msg1, msg2, msg3]);
            }, this.slideAnimationDelay);
        })
    }

    reset() {
        this.animationData = {};
        this.slideAnimationDelay = 200 + 50;
        this.boardHistory = [];
        this.indexHistory = 0;
        this.boardHistory[this.indexHistory] = this.gameModel.getGameState();
        this.currentGoal = this.gameModel.getGoal();
        this.updateView();
    }

    showAlert(type, title, text) {
        // type = "win" || "lose" || "reset"
        let window = $(`#${type}_alert`);
        let windowTitle = window.find(".window_title");
        let textBox = window.find(".window_text");
        let backdrop = $("#BACKDROP");
        
        windowTitle.text(title);
        textBox.empty();
        for(let i = 0; i < text.length; i++) {
            textBox.append(text[i]);
        }

        this.gameModel.pause();
        $(".alert").hide();
        $(".window_button").removeClass("highlighted");
        $(".window_button.default").addClass("highlighted");
        $(".window").removeClass("active");
        window.addClass("active");
        backdrop.show();
        window.show();
    }

    hideAlert() {
        this.gameModel.unpause();
        $("#game_window").addClass("active");
        $(".alert").hide();
        $("#BACKDROP").hide();
    }

    updateView() {
        $(".solitaire-victory-clone").remove();
        let gameState = this.gameModel.getGameState();
        if(this.indexHistory === 0) {
            $(".step_back").addClass("disabled");
        } else {
            $(".step_back").removeClass("disabled");
        }
        if(this.indexHistory === this.boardHistory.length-1) {
            $(".step_forward").addClass("disabled");
        } else {
            $(".step_forward").removeClass("disabled");
        }
        this.renderScore(gameState.score);
        this.renderBoard(gameState.board);
    }

    renderScore(score) {
        let numberString = String(score);
        let numberLength = numberString.length;
    
        if(numberLength <= 18) {
            $(".score_wrapper").empty();
            for(let i=0; i<numberLength; i++) {
                let template = `<div class="score_digit lcd_${numberString[i]}"></div>`;
                $(".score_wrapper").append(template);
            }
        }
    }

    renderBoard(board) {
        $(".game_board").empty();
        board.forEach((tile, index) => {
            if(tile !== 0) {
                let y = parseInt(index / 4);
                let x = index - (y * 4);
                let template = 
                `<div class="game_tile pos_${x}_${y}">
                    <div class="tile_content val_${tile} solitaire"> 
                        <p class="bold">${tile}</p>
                    </div>
                </div>`;
                $(".game_board").append(template);
            }
        });
    }

    animateBoard() {
        let tilesMoved = this.animationData.from.length;
        let hasWon = this.gameModel.getGameState().won;
        let hasLost = this.gameModel.getGameState().over;
        if(this.animationData.direction === "right" || this.animationData.direction === "down") {
            this.animationData.from.reverse();
            this.animationData.to.reverse();
        }
        for(let i = 0; i < tilesMoved; i++) {
            let tileSelector = `pos_${this.animationData.from[i][0]}_${this.animationData.from[i][1]}`;
            let tileDestination = `pos_${this.animationData.to[i][0]}_${this.animationData.to[i][1]}`;
            $("." + tileSelector).removeClass(tileSelector).addClass(tileDestination).end();
        }
        setTimeout(() => {
            this.updateView();
        }, this.slideAnimationDelay);   
    }

    goBack() {
        this.indexHistory -= 1;
        this.gameModel.loadGame(this.boardHistory[this.indexHistory]);
        this.updateView();
    }

    goForward() {
        this.indexHistory += 1;
        this.gameModel.loadGame(this.boardHistory[this.indexHistory]);
        this.updateView();
    }
}