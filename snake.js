;
// constants
var EMPTY=0, SNAKE=1, FOOD=2;
var UP=0, DOWN=1, LEFT=2, RIGHT=3;
var CELLSIZE=20;
var canvas = null;
var scoreCanvas = null;
var ctx = null;
var scoreCtx = null;
var start = null;
var ROWS=30, COLS=30;
var score = null;
var COLOR = {
    red: "#f00",
    black: "#000",
    blue: "#00f",
    gray: "#aaa",
    green: "#347C17",
    snake: "#ff0"
};
var GAMESTATE = {
    PAUSED: 0,
    RUNNING: 1,
    STATE: null
};
var KEY = {
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40
};

var snake = {
    _queue: null,
    direction: null,
    prev_direction: null,
    tail: null,

    init: function(d, x, y) {
        this._queue = [];
        this.direction = d;
        this.prev_direction = null;
        this._queue.push({x:x, y:y});
        this.tail = this._queue[0];
    },
    add: function(x, y) {
        this._queue.unshift({x:x, y:y});
        this.tail = this._queue[0];
    },
    remove: function() {
        return this._queue.pop();
    }
};

var grid = {
    _grid: null,
    rows: null,
    cols: null,

    init: function(val, cols, rows) {
        this._grid = [];
        this.cols = cols;
        this.rows = rows;
        for (var i=0; i<cols; ++i) {
            this._grid.push([]);
            for (var j=0; j<rows; ++j) {
                this._grid[i].push(val);
            }
        }
    },
    set: function(val, x, y) {
        this._grid[x][y] = val;
    },
    get: function(x, y) {
        return this._grid[x][y];
    }
};

function setFood() {
    // places food at a random location on the grid
    var emptyCells = [];
    for (var i=0; i<grid.cols; ++i) {
        for (var j=0; j<grid.rows; ++j) {
            if (grid.get(i, j) === EMPTY)
                emptyCells.push({x:i, y:j});
        }
    }
    var pos = emptyCells[Math.floor(Math.random()*emptyCells.length)];
    grid.set(FOOD, pos.x, pos.y);
}

function drawCell(color, x, y) {
    ctx.fillStyle=color;
    ctx.fillRect(CELLSIZE*x, CELLSIZE*y, CELLSIZE, CELLSIZE);
}

function clearCell(x, y) {
    ctx.clearRect(CELLSIZE*x, CELLSIZE*y, CELLSIZE, CELLSIZE);
}

function drawFood(x, y) {
    var imgApple = new Image();
    imgApple.src = "images/latest.png";
    imgApple.onload = function() {
        ctx.drawImage(imgApple, CELLSIZE*x, CELLSIZE*y, CELLSIZE, CELLSIZE);
    }
}

function renderCanvas() {
    for (var i=0; i<grid.rows; ++i) {
        for (var j=0; j<grid.cols; ++j) {
            switch(grid.get(i, j)) {
                case SNAKE:
                    drawCell(COLOR.snake, i, j);
                    break;
                case FOOD:
                    //drawCell(COLOR.gray, i, j);
                    drawFood(i, j);
                    break;
                case EMPTY:
                    clearCell(i, j);
            }
        }
    }
}

function update() {
        switch (snake.direction) {
            case UP:
                newX = snake.tail.x;
                newY = snake.tail.y-1;
                break;
            case DOWN:
                newX = snake.tail.x;
                newY = snake.tail.y+1;
                break;
            case LEFT:
                newX = snake.tail.x-1;
                newY = snake.tail.y;
                break;
            case RIGHT:
                newX = snake.tail.x+1;
                newY = snake.tail.y;
                break;
        }
        if ((newX >= COLS || newX < 0 || newY >= ROWS || newY < 0)
                || grid.get(newX, newY) === SNAKE) {
            GAMESTATE.STATE = GAMESTATE.DEAD;
            return;
        }
        if (grid.get(newX, newY) !== FOOD) {
            var cell = snake.remove();
            grid.set(EMPTY, cell.x, cell.y);
        } else {
            setFood();
            ++score;
            updateScore();
        }
        snake.add(newX, newY);
        grid.set(SNAKE, newX, newY);
}

var frames = null;
var slow = null;
var verySlow = 2*slow;
var mod = null;
function gameLoop(timeStamp) {
    if (GAMESTATE.STATE === GAMESTATE.RUNNING) {
        if (frames < verySlow) mod = verySlow;
        else mod = slow;
        if (frames % mod === 0) {
            update();
            snake.prev_direction = snake.direction;
            renderCanvas();
        }
        renderCanvas();
        frames++;
    } else if (GAMESTATE.STATE === GAMESTATE.DEAD) {
        if (!deadTime) deadTime = timeStamp;
        showDeadScreen(ctx);
        if (timeStamp - deadTime > 2000) {
            init();
        }
    }
    window.requestAnimationFrame(gameLoop, canvas);
};

document.onkeydown = function(e) {
    switch (e.keyCode) {
        case KEY.LEFT:
            if (snake.prev_direction != RIGHT)
                snake.direction = LEFT; break;
        case KEY.RIGHT:
            if (snake.prev_direction != LEFT)
                snake.direction = RIGHT; break;
        case KEY.DOWN:
            if (snake.prev_direction != UP)
                snake.direction = DOWN; break;
        case KEY.UP:
            if (snake.prev_direction != DOWN)
                snake.direction = UP; break;
        default:
            return;
    }
};

function showDeadScreen(context) {
    context.font = "56px Knewave";
    context.fillStyle = "#02c";
    context.fillText("You Died! Try again.", 50, 300);
}

function updateScore() {
    scoreCtx.clearRect(0, 0, scoreCanvas.width, scoreCanvas.height);
    scoreCtx.font = "46px 'Love Ya Like A Sister'";
    scoreCtx.fillText("Score: " + score, 80, 40);
}
function main(elemId) {
    if (!elemId) {
        canvas = document.createElement("canvas");
        document.body.appendChild(canvas);
    } else {
        canvas = document.getElementById(elemId);
        scoreCanvas = document.getElementById("score_canvas");
    }
    canvas.width = COLS*CELLSIZE;
    canvas.height = ROWS*CELLSIZE;
    ctx = canvas.getContext("2d");
    scoreCtx = scoreCanvas.getContext("2d");
    init();
    window.requestAnimationFrame(gameLoop, canvas);
};

function init() {
    frames = 0;
    slow = 4;
    score = 0;
    grid.init(EMPTY, ROWS, COLS);
    snake.init(UP, 15, 15);
    setFood();
    scoreCtx.clearRect(0, 0, scoreCanvas.width, scoreCanvas.height);
    updateScore();
    //scoreCtx.fillText("Score:"+score, 60, 40);
    console.log("initialization complete...");
    deadTime = null;
    GAMESTATE.STATE = GAMESTATE.RUNNING;
}

main("game_canvas");
