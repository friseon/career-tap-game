var Game = function(options) {
    // основные настройки отображения
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
        button_restart.innerText = "Сменить место работы";
        button_restart.classList.add("game__button-restart");
        context = canvas.getContext("2d");
        addEventListeners('touchend pointerup', button_restart, function(event) {
            event.preventDefault();
            gameController.restart();
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
        gameController.restart();
    };
    // начало игры
    this.startGame = function() {
        player = new Сomponent(30, 30, playerG, _options.startPosition.x, _options.startPosition.y);
        playerScore = new Сomponent("30px", "30px", information, 20, 20);
        playerStatus = new Сomponent("30px", "30px", information, 20, 40);
        playerEnergy = new Сomponent("30px", "30px", information, 20, 60);
        gameController.start();
    };
    var canvas;
    var context;
    var button_restart;
    // игровые объекты
    var allObjects = {};
    
    // управление игрой
    var gameController = {
        start : function() {
            this.restart();
        },
        clear : function() {
            context.clearRect(0, 0, canvas.width, canvas.height);
        },
        restart: function() {
            player = new Сomponent(30, 30, playerG, _options.startPosition.x, _options.startPosition.y);
            itemsInGame = [
                coffee,
                beer,
                cookies,
                taskMinor,
                taskMinor
            ];
            this.frameNo = 0;
            allObjects = {};
            this.clear();
            if (gameController.interval)
            clearInterval(gameController.interval);
            this.interval = setInterval(updateGame, 20);
        },
        options: {
            frequencyCreation: 200
        }
    };
    // конструктор объекта в Canvas
    function Сomponent(width, height, gameObject, x, y) {
        for (var key in gameObject) {
            this[key] = gameObject[key];
        }

        this.x = x;
        this.y = y;
        var fontSize = 30 * _options.scale > 60 ? 60 : 30;
        this.height = parseInt(fontSize, 10) + 10;
        this.width = context.measureText(gameObject.name).width + 10;

        if (gameObject.type === "player") {
            this.width = this.height = parseInt(fontSize, 10) + 10;
        }
        // обновление и отрисовка объекта
        this.draw = function() {
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
        this.updatePosition = function() {
            this.gravitySpeed += this.gravity;
            this.x += this.speedX;
            this.y += this.speedY + this.gravitySpeed;
            
            var borderBottom = canvas.height - this.height;
            if (this.y > borderBottom) {
                this.y = borderBottom;
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
        };
    }
    // процесс игры
    var indexObject = 0;
    var idDeleteObject;
    function randomPositionX() {
        return Math.floor(Math.random() * (400 - 50 + 1) + 50);
    }
    function GameObjectGenerator() {
        var rand = Math.floor(Math.random() * itemsInGame.length);
        return itemsInGame[rand];
    }
    function onGameOver(buttonIndex) {
        if (buttonIndex === 1) {
            gameController.restart();
        }
    }
    /**
     * Обновление событий в мире игры
     */
    function updateGame() {
        if (player.energy <= 0) {
            navigator.notification.confirm(
                'Ты перегорел на работе, но успел получить опыт: ' + player.experience,
                onGameOver,
                'Геймовер',
                ['Сменить работу','Грустить']
            );
            clearInterval(gameController.interval);
        }
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

        gameController.clear();
        gameController.frameNo += 1;
        // расстановка объектов
        var x, height, gap, minHeight, maxHeight, minGap, maxGap;
        if (gameController.frameNo == 1 || everyinterval(gameController.options.frequencyCreation / player.speed * 15)) {
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
                allObjects[indexObject].draw();
                indexObject++;
                maxCountOfObject++;
            }
        }
        for (var id in allObjects) {
            allObjects[id].x -= Math.floor(player.speed / 5);
            allObjects[id].draw();
        }
        playerScore.text = "Опыт: " + player.experience;
        playerStatus.text = "Статус: " + player.status();
        playerEnergy.text = "Энергия: " + player.energy;
        playerScore.draw();
        playerEnergy.draw();
        playerStatus.draw();
        player.updatePosition();
        player.draw();
        // уменьшение энергии
        if (everyinterval(100)) {
            player.energy -= 1;
        }
    }
    // в нужный момент времени
    function everyinterval(n) {
        if ((gameController.frameNo / Math.floor(n)) % 1 === 0) { return true; }
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

var SATUSES = [
    "Стажер",
    "Стажер с официальным оффером",
    "Джуниор",
    "Джуниор с перспективами",
    "Мидл",
    "Сеньор",
    "Займись лучше работой!",
    "Тебя уволят!",
    "Как ты сюда добрался?!",
    "Смысл играть в это?!!!!"
];

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
    this.speedX = 0;
    this.speedY = 0;
    if (type === "player") {
        this.energy = 100;
        this.gravity = 0.05;
        this.speed = 15;
        this.experience = 0;
        this.gravitySpeed = 0;
        this.status = function(exp) {
            switch (true) {
                case this.experience + (exp || 0) < 20 && this.experience + (exp || 0) > 10:
                    return SATUSES[1];
                case this.experience + (exp || 0) < 30 && this.experience + (exp || 0) > 20:
                    return SATUSES[2];
                case this.experience + (exp || 0) < 80 && this.experience + (exp || 0) > 30:
                    return SATUSES[3];
                case this.experience + (exp || 0) < 120 && this.experience + (exp || 0) > 80:
                    return SATUSES[4];
                case this.experience + (exp || 0) < 180 && this.experience + (exp || 0) > 120:
                    return SATUSES[5];
                case this.experience + (exp || 0) < 300 && this.experience + (exp || 0) > 180:
                    return SATUSES[6];
                case this.experience + (exp || 0) < 400 && this.experience + (exp || 0) > 300:
                    return SATUSES[7];
                case this.experience + (exp || 0) < 500 && this.experience + (exp || 0) > 400:
                    return SATUSES[8];
                case this.experience + (exp || 0) > 500:
                    return SATUSES[8];
                default:
                    return SATUSES[0];
            }
        };
    } else {
        this.effect = effect;
    }
}
var itemsInGame = [];

// создание игрока
var playerG = new GameObject("player", "Я", "black");      

var information = new GameObject("text", "Игровая информация", "red");
var coffee = new GameObject("objectText", "Кофе", "black", new Effect( { speed: 5, energy: 10 }, 5));
var cookies = new GameObject("objectText", "Печенька", "black", new Effect( { energy: 2 }));
var beer = new GameObject("objectText", "Пивас", "black", new Effect( { speed: -5, energy: 10 }, 5));
var task = new GameObject("objectText", "Таск", "red", new Effect( { energy: -5, experience: 10 }));
var taskMinor = new GameObject("objectText", "Минорный таск", "red", new Effect( { energy: -2, experience: 2 }));
var hotfix = new GameObject("objectText", "Хотфикс!", "red", new Effect( { energy: -15, experience: 15 }));
var hotfixLarge = new GameObject("objectText", "ОЧЕНЬ СРОЧНЫЙ ХОТФИКС!", "red", new Effect( { energy: -20, experience: 25 }));
var crazy = new GameObject("objectText", "Психануть", "red", new Effect( { speed: 500, energy: -50 }, 5));
var deadline = new GameObject("objectText", "Дедлайн", "red", new Effect( { speed: 40, energy: -20, experience: 40 }, 3));
      
/**
 * Эффект, который накладывается от столкновения с объектом
 * @param {*} properties 
 * @param {*} time 
 */
function Effect(properties, time) {
    this.buff = function(target) {
        for (var key in properties) {
            var nextLevel = SATUSES.indexOf(target.status(properties[key]));
            var oldLevel = SATUSES.indexOf(target.status());
            if (key === "experience" && nextLevel > oldLevel) {
                target.speed += 2 * oldLevel;
                switch (nextLevel) {
                    case 1:
                        itemsInGame.push(task);
                        break;
                    case 2:
                        itemsInGame.push(task);
                        itemsInGame.push(task);
                        itemsInGame.push(coffee);
                        break;
                    case 3:
                        itemsInGame.push(task);
                        itemsInGame.push(hotfix);
                        itemsInGame.push(coffee);
                        break;
                    case 4:
                        itemsInGame.push(hotfix);
                        break;
                    case 5:
                        itemsInGame.push(hotfixLarge);
                        itemsInGame.push(task);
                        break;
                    case 6:
                        itemsInGame.push(deadline);
                        itemsInGame.push(hotfix);
                        itemsInGame.push(hotfixLarge);
                        itemsInGame.push(task);
                        itemsInGame.push(crazy);
                        break;
                    case 6:
                        itemsInGame.push(deadline);
                        itemsInGame.push(hotfix);
                        itemsInGame.push(hotfixLarge);
                        itemsInGame.push(coffee);
                        break;
                    default: return;
                }
            }
            target[key] += properties[key];
            
            if (time && key !== "energy" && key !== "experience") {
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