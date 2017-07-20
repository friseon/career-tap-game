var Game = function(options) {
    var canvas;
    var context;
    var button_restart;
    // препятствия
    var allObjects = {};

    function GameObject(type, name, energy, color, effect) {
        this.type = type;
        this.name = name;
        this.energy = energy;
        this.color = color;
        this.effect = effect;
    }
    var coffe = new GameObject("objectText", "Кофе", 15, "black");
    var beer = new GameObject("objectText", "Пивас", 15, "black", { speed: 10, time: 5 });
    var deadline = new GameObject("objectText", "Дедлайн", -10, "red");
    var hotfix = new GameObject("objectText", "Хотфикс!", -10, "red");
    var admin = new GameObject("objectText", "Админ смотрит историю твоего браузера", -10, "red");
    var information = new GameObject("text", "Игровая информация", 0, "red");
    var types = [
        coffe,
        beer,
        deadline,
        deadline,
        deadline,
        hotfix,
        hotfix,
        hotfix,
        hotfix,
        hotfix,
        admin
    ];

    // игрок
    var playerG = new GameObject("player", "Я", 100, "black");
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
        scale: (window.innerWidth) / 800 * (window.innerHeight) / 400
    }, options);
    // создание игры
    this.create = function() {
        canvas = document.createElement("canvas");
        button_restart = document.createElement("button");
        button_restart.innerText = "Restart";
        button_restart.classList.add("game__button-restart");
        context = canvas.getContext("2d");
        addEventListeners('touchend pointerup', button_restart, function(event) {
            event.preventDefault();
            gameArea.restart();
        });
        addEventListeners('touchstart pointerdown', canvas, function(evente) {
            event.preventDefault();
            accelerate(-0.2);
        });
        addEventListeners('touchend pointerup', canvas, function(evente) {
            event.preventDefault();
            accelerate(0.05);
        });
        canvas.classList.add('game__canvas');
        document.body.appendChild(canvas);
        document.body.appendChild(button_restart)
        // canvas.width = this._options.canvasProperties.width;
        // canvas.height = this._options.canvasProperties.height;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        // window.addEventListener('resize', resizeCanvas, false);
        // context.scale(scale.w, scale.h);
    };
    this.restart = function() {
        gameArea.restart();
    };
    // начало игры
    this.startGame = function() {
        player = new Сomponent(30, 30, playerG, _options.startPosition.x, _options.startPosition.y);
        player.gravity = 0.05;
        player.speed = 2;
        playerScore = new Сomponent("30px", "30px", information, 20, 20);
        playerEnergy = new Сomponent("30px", "30px", information, 20, 40);
        playerEnergy.text = "Energy: " + player.energy;
        gameArea.start();
    };
    // миро игры
    var gameArea = {
        start : function() {
            this.frameNo = 0;
            this.interval = setInterval(updateGameArea, 20);
        },
        clear : function() {
            context.clearRect(0, 0, canvas.width, canvas.height);
        },
        restart: function() {
            player.energy = 100;
            player.gravity = 0.05;
            player.x = _options.startPosition.x;
            player.y = _options.startPosition.y;
            player.gravitySpeed = 0;
            this.frameNo = 0;
            allObjects = {};
            this.clear();
        }
    };
    // конструктор объекта игры
    function Сomponent(width, height, gameObject, x, y) {
        this.energy = gameObject.energy;
        this.width = width;
        this.height = height;
        this.gravitySpeed = 0;
       
        var fontSize = 30 * _options.scale > 60 ? 60 : 30;
        this.height = parseInt(fontSize, 10) + 10;
        this.width = context.measureText(gameObject.name).width + 10;

        if (gameObject.type === "player") {
            this.width = this.height = parseInt(fontSize, 10) + 10;
        }
        this.speedX = 0;
        this.speedY = 0;
        this.x = x;
        this.y = y;
        // обновление объекта
        this.update = function() {
            if (gameObject.type == "text") {
                context.fillStyle = gameObject.color;
                context.font = fontSize / 4 + "px Arial";
                context.fillText(this.text, this.x, this.y);
            } else {
                context.font = fontSize + "px Arial";
                context.fillStyle = gameObject.color;
                context.fillRect(this.x, this.y, this.width, this.height);
                context.textBaseline = 'top';
                context.fillStyle = "white";
                context.fillText(gameObject.name, this.x + 5, this.y);
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
            if (otherobj.type === "active" && this.type === "active") {
                if ( (mybottom < othertop) || (mytop > otherbottom) && (mytop > othertop)) {
                    crash = false;
                }
                return crash;
            }
            
            else if ((mybottom < othertop) || (mytop > otherbottom) || (myright < otherleft) || (myleft > otherright)) {
                crash = false;
            }
            return crash;
        }
    }
    // процесс игры
    var indexObject = 0;
    var idDeleteObject;
    function randomPositionX() {
        return Math.floor(Math.random() * (400 - 50 + 1) + 50);
    }
    function GameObjectGenerator() {
        var rand = Math.floor(Math.random() * types.length);
        return types[rand];
    }
    /**
     * Обновление событий в мире игры
     */
    function updateGameArea() {
        var x, height, gap, minHeight, maxHeight, minGap, maxGap;
        // очистка объектов
        if (idDeleteObject) {
            delete allObjects[idDeleteObject];
            idDeleteObject = null;
        }
        // проверка событий и объектов вышедших за рамки игры
        for (var id in allObjects) {
            var object = allObjects[id];
            if (object.x + object.width < 0) {
                idDeleteObject = id;
                break;
            } else if (player.crashWith(object)) {
                if (object.effect) {
                    var keySave;
                    for (var key in object.effect) {
                        player[key] += object.object[key];
                        keySave = key;
                        if (key == "time") {
                            function fun() {
                                player[keySave] -= object[keySave];
                            } 
                            setTimeout(func, object[key] * 1000);
                        }
                        console.log(player)
                        debugger
                    }
                }
                player.energy += object.energy;
                idDeleteObject = id;
                break;
            }
            if (player.energy <= 0) {
                return;
            }
        }

        gameArea.clear();
        gameArea.frameNo += 1;
        // уменьшение энергии
        if (everyinterval(100)) {
            player.energy -= 1;
        }
        // расстановка объектов
        if (gameArea.frameNo == 1 || everyinterval(200)) {
            minHeight = canvas.height / 20;
            maxHeight = canvas.height / 10;
            minWidth = canvas.width / 20;
            maxWidth = canvas.width / 10;
            minGap = player.height * 1.5;
            maxGap = player.height * 2;
            var positionY = 0;
            var index = 0;
            while (positionY < canvas.height && index < 5) {
                x = canvas.width + randomPositionX();
                height = Math.floor(Math.random() * (maxHeight - minHeight + 1) + minHeight);
                width = Math.floor(Math.random() * (maxWidth - minWidth + 1) + minWidth);
                allObjects[indexObject] = Object.assign(new Сomponent(width, height, GameObjectGenerator(), x, positionY), { id: indexObject});
                gap = Math.floor(Math.random() * (maxGap - minGap + 1) + minGap);
                positionY += (height + gap);
                allObjects[indexObject].update();
                indexObject++;
                index++;
            }
        }
        for (var id in allObjects) {
            allObjects[id].x -= player.speed;
            allObjects[id].update();
        }
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