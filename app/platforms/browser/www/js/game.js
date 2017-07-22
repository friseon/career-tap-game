var Game = function(options) {
    // создание игры
    this.create = function() {
        canvas = document.createElement("canvas");
        button_restart = document.createElement("button");
        button_restart.innerText = "Сменить место работы";
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
        document.body.appendChild(button_restart);
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        window.addEventListener('resize', function() {
            _options.scale = (window.innerWidth) / 800 * (window.innerHeight) / 400;
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });
    };
    // перезапуск игры
    this.restart = function() {
        gameArea.restart();
    };
    // начало игры
    this.startGame = function() {
        player = new Сomponent(30, 30, playerG, _options.startPosition.x, _options.startPosition.y);
        playerScore = new Сomponent("30px", "30px", information, 20, 20);
        playerEnergy = new Сomponent("30px", "30px", information, 20, 40);
        gameArea.start();
    };
    var canvas;
    var context;
    var button_restart;
    // игровые объекты
    var allObjects = {};

    var coffee = new GameObject("objectText", "Кофе", "black", new Effect( { speed: 5, energy: 10 }, 5));
    var cookies = new GameObject("objectText", "Печенька", "black", new Effect( { energy: 2 }));
    var beer = new GameObject("objectText", "Пивас", "black", new Effect( { speed: -5, energy: 10 }, 5));
    var deadline = new GameObject("objectText", "Дедлайн", "red", new Effect( { speed: 40, energy: -20 }, 3));
    var task = new GameObject("objectText", "Таск", "red", new Effect( { energy: -5 }));
    var hotfix = new GameObject("objectText", "Хотфикс!", "red", new Effect( { energy: -15 }));
    var hotfixLarge = new GameObject("objectText", "ОЧЕНЬ СРОЧНЫЙ ХОТФИКС!", "red", new Effect( { energy: -20 }));
    var crazy = new GameObject("objectText", "Психануть", "red", new Effect( { speed: 500, energy: -50 }, 5));
    var information = new GameObject("text", "Игровая информация", "red");
    var types = [
        coffee,
        beer,
        cookies,
        cookies,

        deadline,
        task,
        task,
        task,
        task,
        task,
        hotfix,
        hotfixLarge,
        crazy
    ];

    // создание игрока
    var playerG = new GameObject("player", "Я", "black");
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
    var gamePlay;
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
            player = new Сomponent(30, 30, playerG, _options.startPosition.x, _options.startPosition.y);
            this.frameNo = 0;
            allObjects = {};
            this.clear();
            clearInterval(gameArea.interval);
            this.interval = setInterval(updateGameArea, 20);
        }
    };
    // настройки игры
    var gameOptions = {
        frequencyCreation: 200
    };
    // конструктор объекта в Canvas
    function Сomponent(width, height, gameObject, x, y) {
        for (var key in gameObject) {
            this[key] = gameObject[key];
        }
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
        // обновление и отрисовка объекта
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
        // касание границ игрового поля
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
        // столкновение с другими объектами
        this.strikeWith = function(otherobj) {
            var myleft = this.x;
            var myright = this.x + (this.width);
            var mytop = this.y;
            var mybottom = this.y + (this.height);
            var otherleft = otherobj.x;
            var otherright = otherobj.x + (otherobj.width);
            var othertop = otherobj.y;
            var otherbottom = otherobj.y + (otherobj.height);
            var strike = true;
            if ((mybottom < othertop) ||
                (mytop > otherbottom) ||
                (myright < otherleft) ||
                (myleft > otherright)) {
                strike = false;
            }
            return strike;
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
    function onGameOver(buttonIndex) {
        if (buttonIndex === 1) {
            gameArea.restart();
        }
    }
    /**
     * Обновление событий в мире игры
     */
    function updateGameArea() {
        if (player.energy <= 0) {
            navigator.notification.confirm(
                'Вы перегорели на работе.',
                onGameOver,
                'Геймовер',
                ['Сменить работу','Грустить']
            );
            clearInterval(gameArea.interval);
        }
        var x, height, gap, minHeight, maxHeight, minGap, maxGap;
        // очистка объектов
        if (idDeleteObject) {
            delete allObjects[idDeleteObject];
            idDeleteObject = null;
        }
        // проверка событий и объектов; удлаение вышедших за рамки игры
        for (var id in allObjects) {
            var object = allObjects[id];
            if (object.x + object.width < 0) {
                idDeleteObject = id;
                break;
            } else if (player.strikeWith(object)) {
                if (object.effect) {
                    object.effect.buff(player);
                }
                idDeleteObject = id;
                break;
            }
        }

        gameArea.clear();
        gameArea.frameNo += 1;
        // уменьшение энергии
        if (everyinterval(100)) {
            player.energy -= 1;
        }
        // расстановка объектов
        if (gameArea.frameNo == 1 || everyinterval(gameOptions.frequencyCreation)) {
            minHeight = canvas.height / 20;
            maxHeight = canvas.height / 10;
            minWidth = canvas.width / 20;
            maxWidth = canvas.width / 10;
            minGap = player.height * 0.5;
            maxGap = player.height * 2;
            var positionY = 0;
            var maxCountOfObject = 0;
            while (positionY < canvas.height && maxCountOfObject < 10) {
                x = canvas.width + randomPositionX();
                height = Math.floor(Math.random() * (maxHeight - minHeight + 1) + minHeight);
                width = Math.floor(Math.random() * (maxWidth - minWidth + 1) + minWidth);
                allObjects[indexObject] = Object.assign(new Сomponent(width, height, GameObjectGenerator(), x, positionY), { id: indexObject});
                gap = Math.floor(Math.random() * (maxGap - minGap + 1) + minGap);
                positionY += (height + gap);
                allObjects[indexObject].update();
                indexObject++;
                maxCountOfObject++;
            }
        }
        for (var id in allObjects) {
            allObjects[id].x -= Math.floor(player.speed / 5);
            allObjects[id].update();
        }
        playerScore.text = "Очки: " + gameArea.frameNo;
        playerEnergy.text = "Энергия: " + player.energy;
        playerScore.update();
        playerEnergy.update();
        player.newPos();
        player.update();
    }
    // в нужный момент времени
    function everyinterval(n) {
        if ((gameArea.frameNo / Math.floor(n)) % 1 === 0) { return true; }
        return false;
    }
    // изменение гравитации
    function accelerate(n) {
        player.gravity = n;
    }
};

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

/**
 * Конструктор игрового объекта
 * @param {*} type 
 * @param {*} name 
 * @param {*} color 
 * @param {*} effect 
 */
function GameObject(type, name, color, effect) {
    this.type = type;
    this.name = name;
    this.color = color;
    if (type === "player") {
        this.energy = 100;
        this.gravity = 0.05;
        this.speed = 10;
    } else {
        this.effect = effect;
    }
}

/**
 * Эффект, который накладывается от столкновения с объектом
 * @param {*} properties 
 * @param {*} time 
 */
function Effect(properties, time) {
    this.buff = function(target) {
        for (var key in properties) {
            target[key] += properties[key];
            if (time && key !== "energy") {
                new Debuff(key, properties[key], time, target);
            }
        }
        
    };
}

/**
 * Cнятие накладываемого эффекта c цели
 * @param {*} name 
 * @param {*} value 
 * @param {*} time 
 * @param {*} target 
 */
function Debuff(name, value, time, target) {
    setTimeout(function(){
        target[name] -= value;
    }, time * 1000);
}