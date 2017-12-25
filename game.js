'use strict';

var canvas = document.querySelector('#canvas');
var ctx = canvas.getContext('2d');
var width = canvas.width;
var height = canvas.height;
var snakeSpeed = 100;
var speedStep = 5;
var blockSize = 10;
var blocksInWidth = width / blockSize;
var blocksInHeight = height / blockSize;

var score = 0;

var circle = function (x, y, radius, fillCircle) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2, false);
    if (fillCircle) {
        ctx.fill();
    } else {
        ctx.stroke();
    }
}

var drawBorder = function () {
    ctx.fillStyle = 'Gray';
    ctx.fillRect(0, 0, width, blockSize);
    ctx.fillRect(0, blockSize, blockSize, height);
    ctx.fillRect(blockSize, height - blockSize, width, blockSize);
    ctx.fillRect(width - blockSize, blockSize, blockSize, height);
};

var drawScore = function () {
    ctx.font = '20px Courier';
    ctx.fillStyle = 'black';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('Счет: ' + score, blockSize, blockSize);
}

// Create button
var renderButton = function () {
    var button = document.createElement('button');
    button.textContent = 'Начать заново';
    button.style.width = '100px';
    button.style.height = '40px';
    button.style.position = 'absolute';
    button.style.zIndex = '100';
    button.style.left = '0';
    button.style.top = (height / 2 + 40) + 'px';
    button.style.right = '0';
    button.style.margin = '0 auto';
    button.style.backgroundColor = 'lightgreen';
    button.style.borderRadius = '5px';
    
    return button;
}


var resetGameHandler = function () {
    snakeSpeed = 100;
    score = 0;
    snake = new Snake();
    apple = new Apple();
    gameStart = setInterval(gameProcess, snakeSpeed);
    this.remove();
}

var gameOver = function () {
    clearInterval(gameStart);
    ctx.font = '60px Courier';
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Конец игры', width / 2, height / 2);
    ctx.fillStyle = 'lightblue';
    var resetButton = renderButton();
    document.body.insertAdjacentElement('beforeend', resetButton);
    resetButton.addEventListener('click', resetGameHandler);
}

// Конструктор ячеек
var Block = function (col, row) {
    this.col = col;
    this.row = row;
}

Block.prototype.drawSquare = function (color) {
    var x = this.col * blockSize;
    var y = this.row * blockSize;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, blockSize, blockSize);
}

Block.prototype.drawCircle = function (color) {
    var centerX = this.col * blockSize + (blockSize / 2);
    var centerY = this.row * blockSize + (blockSize / 2);
    ctx.fillStyle = color;
    circle(centerX, centerY, blockSize / 2, true);
}

Block.prototype.equal = function (otherBlock) {
    return this.col === otherBlock.col && this.row === otherBlock.row;
}

// Конструктор змейки
var Snake = function () {
    this.segments = [
        new Block(7, 5),
        new Block(6, 5),
        new Block(5, 5)
    ];

    this.direction = 'right';
    this.nextDirection = 'right';
}

Snake.prototype.draw = function () {
    this.segments.forEach(function (segment) {
        segment.drawSquare('blue');
    })
}

Snake.prototype.move = function () {
    var head = this.segments[0];
    var newHead;

    this.direction = this.nextDirection;

    switch (this.direction) {
        case 'right':
            newHead = new Block(head.col + 1, head.row);
            break;
        case 'left':
            newHead = new Block(head.col - 1, head.row);
            break;
        case 'up':
            newHead = new Block(head.col, head.row - 1);
            break;
        case 'down':
            newHead = new Block(head.col, head.row + 1);
            break;
    }

    if (this.checkCollision(newHead)) {
        gameOver();
        return;
    }

    this.segments.unshift(newHead);

    if (newHead.equal(apple.position)) {
        score++;
        apple.move();
        if (snakeSpeed >= 50 && score % speedStep === 0) {
            snakeSpeed -= speedStep;
            clearInterval(gameStart);
            gameStart = setInterval(gameProcess, snakeSpeed);
        }
    } else {
        this.segments.pop();
    }
}

Snake.prototype.checkCollision = function (head) {
    var leftCollision = (head.col === 0);
    var topCollision = (head.row === 0);
    var rightCollision = (head.col === (blocksInWidth - 2) + 1);
    var bottomCollision = (head.row === (blocksInHeight - 2) + 1);

    var wallCollision = leftCollision || topCollision || rightCollision || bottomCollision;

    var selfCollision = false;

    this.segments.forEach(function (segment) {
        if (head.equal(segment)) {
            selfCollision = true;
        }
    })

    return wallCollision || selfCollision;
}

Snake.prototype.setDirection = function (newDirection) {
    if (this.direction === 'right' && newDirection === 'left') {
        return;
    } else if (this.direction === 'left' && newDirection === 'right') {
        return;
    } else if (this.direction === 'up' && newDirection === 'down') {
        return;
    } else if (this.direction === 'down' && newDirection === 'up') {
        return;
    }

    this.nextDirection = newDirection;
}

// Конструктор яблока
var Apple = function () {
    this.position = new Block(15, 10);
}

Apple.prototype.draw = function () {
    this.position.drawCircle('green');
}

Apple.prototype.move = function () {
    var randomCol = Math.floor(Math.random() * (blocksInWidth - 2)) + 1;
    var randomRow = Math.floor(Math.random() * (blocksInHeight - 2)) + 1;
    this.position = new Block(randomCol, randomRow);
}

var snake = new Snake();
var apple = new Apple();

var gameProcess = function () {
    ctx.clearRect(0, 0, width, height);
    drawScore();
    snake.draw();
    snake.move();
    apple.draw();
    drawBorder();
}

var gameStart = setInterval(gameProcess, snakeSpeed);

var directions = {
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down'
}

document.body.addEventListener('keydown', function (evt) {
    var newDirection = directions[evt.keyCode];
    if (newDirection !== undefined) {
        snake.setDirection(newDirection);
    }
})