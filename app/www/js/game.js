var Game = function(options) {
    var canvas;
    var context;
    // препятствия
    var obstacles = {};
    // игрок
    var player = {
        gravity: 0.05,
        energy: 100
    };
    // очки
    var playerScore = {},
        playerEnergy = {};
    // основные настройки
    var _options = Object.assign({
        canvasProperties: {
            width: 800,
            height: 400
        },
        startPosition: {
            x: 80,
            y: 10
        },
        scale: (window.innerWidth * window.devicePixelRatio || 1) / 800 * (window.innerHeight * window.devicePixelRatio || 1) / 400
    }, options);
    // создание игры
    this.create = function() {
        canvas = document.createElement("canvas");
        context = canvas.getContext("2d");
        addEventListeners('touchstart pointerdown', canvas, function(e) {
            accelerate(-0.2);
        });
        addEventListeners('touchend pointerup', canvas, function(e) {
            accelerate(0.05);
        });
        canvas.classList.add('game__canvas');
        document.body.appendChild(canvas);
        // canvas.width = this._options.canvasProperties.width;
        // canvas.height = this._options.canvasProperties.height;
        canvas.width = window.innerWidth * window.devicePixelRatio || 1;
        canvas.height = window.innerHeight * window.devicePixelRatio || 1;
        // window.addEventListener('resize', resizeCanvas, false);
        // context.scale(scale.w, scale.h);
    };
    // начало игры
    this.startGame = function() {
        player = Object.assign(new Сomponent(30, 30, "black", _options.startPosition.x, _options.startPosition.y, "player"), player);
        // player.gravity = 0.05;
        playerScore = new Сomponent("30px", "30px", "red", 20, 20, "text");
        playerEnergy = new Сomponent("30px", "30px", "red", 20, 40, "text");
        playerEnergy.text = "Energy: " + player.energy;
        gameArea.start();
    };
    // мир игры
    var gameArea = {
        start : function() {
            this.frameNo = 0;
            this.interval = setInterval(updateGameArea, 20);
            
            },
        clear : function() {
            context.clearRect(0, 0, canvas.width, canvas.height);
        },
        restart: function() { 
            // canvasProperties.width = canvas.width || 800;
            this.frameNo = 0;
            obstacles = {};
            this.clear();
        }
    };
    // конструктор объекта игры
    function Сomponent(width, height, color, x, y, type) {
        this.type = type;
        this.score = 0;
        if (this.type !== "player") {
            this.width = width * _options.scale;
            this.height = height * _options.scale;
        } else {
            this.width = this.height = height * _options.scale;
        }
        this.speedX = 0;
        this.speedY = 0;
        this.x = x;
        this.y = y;
        this.gravity = 0;
        this.gravitySpeed = 0;
        // обновление объекта
        this.update = function() {
            if (this.type == "text") {
                context.font = this.width + " " + this.height;
                context.fillStyle = color;
                context.fillText(this.text, this.x, this.y);
            } else {
                context.fillStyle = color;
                context.fillRect(this.x, this.y, this.width, this.height);
            }
        };
        // новое положение
        this.newPos = function() {
            this.gravitySpeed += this.gravity;
            this.x += this.speedX;
            this.y += this.speedY + this.gravitySpeed;
            this.hit();
        };
        // границы поля
        this.hit = function() {
            var rockbottom = canvas.height - this.height;
            if (this.y > rockbottom) {
                this.y = rockbottom;
                this.gravitySpeed = 0;
            }
            else if (this.y < 0) {
                this.y = 0;
                this.gravitySpeed = 0;
            }
        };
        // столкновение
        this.crashWith = function(otherobj) {
            var myleft = this.x;
            var myright = this.x + (this.width);
            var mytop = this.y;
            var mybottom = this.y + (this.height);
            var otherleft = otherobj.x;
            var otherright = otherobj.x + (otherobj.width);
            var othertop = otherobj.y;
            var otherbottom = otherobj.y + (otherobj.height);
            var crash = true;
            if ((mybottom < othertop) || (mytop > otherbottom) || (myright < otherleft) || (myleft > otherright)) {
                crash = false;
            }
            return crash;
        }
    }
    var indexObject = 0;
    var deleteObject;
    // обновление событий в мире игры
    function updateGameArea() {
        var x, height, gap, minHeight, maxHeight, minGap, maxGap;
        
        if (deleteObject) {
            delete obstacles[deleteObject.id];
            deleteObject = null;
        }
        for (var obstacle in obstacles) {
            if (player.crashWith(obstacles[obstacle])) {
                player.energy -= 10;
                deleteObject = obstacles[obstacle];
                break;
            }
            if (player.energy <= 0) {
                return;
            }
        };
        gameArea.clear();
        gameArea.frameNo += 1;
        var bottomObstacle = 0;
        if (gameArea.frameNo == 1 || everyinterval(300)) {
            x = canvas.width;
            minHeight = 10;
            maxHeight = 200;
            minWidth = canvas.width / 20;
            maxWidth = canvas.width / 10;
            height = Math.floor(Math.random() * (maxHeight - minHeight + 1) + minHeight);
            width = Math.floor(Math.random() * (maxWidth - minWidth + 1) + minWidth);
            minGap = player.height * 2;
            maxGap = player.height * 10;
            gap = Math.floor(Math.random() * (maxGap - minGap + 1) + minGap);
            obstacles[indexObject] = Object.assign(new Сomponent(width, height, "black", x, 0), { id: indexObject});
            bottomObstacle = canvas.height - height - gap;
            if (bottomObstacle > 0) {
                obstacles[++indexObject] = Object.assign(new Сomponent(width, bottomObstacle, "red", x, height + gap), { id: indexObject});
            }
        else
            console.log(bottomObstacle + "!")
        }
        for (var item in obstacles) {
            obstacles[item].x += -1;
            obstacles[item].update();
        }; 
        playerScore.text = "Score: " + gameArea.frameNo;
        playerEnergy.text = "Energy: " + player.energy;
        playerScore.update();
        playerEnergy.update();
        player.newPos();
        player.update();
        indexObject++;
    }
    // в нужный момент времени
    function everyinterval(n) {
        if ((gameArea.frameNo / n) % 1 === 0) { return true; }
        return false;
    }
    // изменение гравитации
    function accelerate(n) {
        player.gravity = n;
    }
}

function addEventListeners (types, elem, callback) {
    types.split(' ').forEach(function (type) {
        elem.addEventListener(type, callback);
    }, this);
}

function removeEventListeners (types, elem, callback) {
    types.split(' ').forEach(function (type) {
        elem.removeEventListener(type, callback);
    }, this);
}