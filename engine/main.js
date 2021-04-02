import Game from "./game.js";
import View from "./view.js";

$(function() {
    $(".window").draggable({ containment: "#screen", handle: ".window_header"})

    let game = new Game(4);
    let view = new View(game);

    let winningBoard = [
         256,  256,  256,  256,
         512,  512,  512,  512,
        1024, 1024, 1024, 1024,
        1024, 1024, 1024, 1024
    ];

    let losingBoard = [
        512,  64, 512, 512,
         64, 512,  64,  64,
        512,  64, 512, 512,
         64, 512,  64,   0
    ]

    let testGameState = {
        board: losingBoard,
        score: 1234567890,
        won: false,
        over: false
    };

    // game.loadGame(testGameState);
    // view.reset();
    // view.updateView();

    $(document).on("keydown", (event) => {
        if(true) {
            switch (event.key) {
                case 'ArrowRight':
                    event.preventDefault();
                    game.move('right');
                    break;
                case 'ArrowLeft':
                    event.preventDefault();
                    game.move('left');
                    break;
                case 'ArrowDown':
                    event.preventDefault();
                    game.move('down');
                    break;
                case 'ArrowUp':
                    event.preventDefault();
                    game.move('up');
                    break;
                default:
                    break;
            }
        }
    });

    $(document).on("click", ".load_win", event => {
        testGameState.board = winningBoard;
        game.setupNewGame();
        game.loadGame(testGameState);
        view.reset();
        view.updateView();
    })

    $(document).on("click", ".load_lose", event => {
        testGameState.board = losingBoard;
        game.setupNewGame();
        game.loadGame(testGameState);
        view.reset();
        view.updateView();
    })

    $(document).on("click", ".step_back", event => {
        view.goBack();
    })

    $(document).on("click", ".step_forward", event => {
        view.goForward();
    })

    $(document).on("click", "#win_continue" ,event => {
        game.doubleGoal();
        $(".solitaire-victory-clone").remove();
    })

    $(document).on("click", ".continue" ,event => {
        game.unpause();
        view.hideAlert();
        $(".solitaire-victory-clone").remove();
    })

    $(document).on("click", ".reset", event => {
        game.setupNewGame();
        game.unpause();
        view.reset();
        view.hideAlert();
        $(".solitaire-victory-clone").remove();
    })

    $(document).on("click", ".ask_reset", event => {
        game.pause();
        let msg1 = `<p>Are you sure you want to reset and start over?</p>`;
        let msg2 = `<p>Resetting game to initial state will clear all progress and history.</p>`
        view.showAlert("reset", "Start New Game?", [msg1, msg2]);
    })

    $(document).on("click", "#game_window .window_close", event => {
        $("#game_window").hide();
        setTimeout(() => {
            location.reload();
        }, 1000);
    })

    $(document).on("click", ".window_close", event => {
        // double goal when win_alert is closed
        if($(event.target).closest(".window").attr("id") === "win_alert") {
            game.doubleGoal();
        }
        $(".solitaire-victory-clone").remove();
        game.unpause();
        view.hideAlert();
    })

    $(document).on("mousedown", ".window_button", event => {
        $(".window_button").removeClass("highlighted");
        $(event.target).closest(".window_button").addClass("highlighted");
    })

    $(document).on("mousedown", ".window", event => {
        $(".window").removeClass("active");
        $(event.target).closest(".window").addClass("active");
    })

    $(document).on("mousedown", "body", event => {
        if( $(event.target).parents(".window_menu_item").length === 0 ) {
            $(".window_menu_item").removeClass("pressed");
        }
    })

    $(document).on("click", ".window_menu_item", event => {
        if( $(event.target).closest(".window_menu_item").hasClass("pressed") ) {
            $(".window_menu_item").removeClass("pressed");
        } else {
            $(".window_menu_item").removeClass("pressed");
            $(event.target).closest(".window_menu_item").addClass("pressed");
        }
    })

    $(document).on("mouseenter", ".window_menu_item", event => {
        if( $(event.target).siblings(".pressed").length !== 0 ) {
            $(".window_menu_item").removeClass("pressed");
            $(event.target).closest(".window_menu_item").addClass("pressed");
        }
    })
})