var Game = function(options) {
    // Canvas
    var canvas, context;
    // Кнопка
    var button_restart, button_resume, button_menu;
    // Верстка
    var game_header, game_footer, gameScoreContainer;
    // Показатели в игре
    var playerExperience, playerEnergy, playerPosition;
    // Меню
    var menu_container, menu_window, menu_footer, menu_info;
    // Все объекты, которые присутствуют в данный момент на игровом поле
    var allObjects = {};
    // Список объектов, из которого создаются новые объекты canvas
    var listAvailableItems = [];
    // Основные настройки отображения
    var _options = Object.assign({
        canvasProperties: {
            width: 800,
            height: 400
        },
        startPosition: {
            x: 50,
            y: 10
        },
        scale: (window.innerWidth) / 800 * (window.innerHeight) / 400
    }, options);
    /**
     * Создание игрового процесса
     */
    this.create = function() {
        canvas = document.createElement("canvas");
        canvas.classList.add('game__canvas');
        
        document.body.appendChild(canvas);
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight - 110;
        window.addEventListener('resize', function() {
            _options.scale = (window.innerWidth) / _options.canvasProperties.width * (window.innerHeight) / _options.canvasProperties.height;
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight - 110;
        });

        context = canvas.getContext("2d");

        menu_container = document.createElement("div");
        menu_container.classList.add('menu__container');
        document.body.appendChild(menu_container);

        menu_window = document.createElement("div");
        menu_window.classList.add('menu__modal');
        menu_container.appendChild(menu_window);

        menu_info = document.createElement("div");
        menu_info.classList.add('menu__info');
        menu_info.innerHTML = "<p>Твоя цель - выжить на работе.</p><p><b>Красные блоки</b> - это твои задачи, они расходуют энергию, но дают столь необходимый опыт для твоего карьерного роста.<br><br><b>Черные</b> - всякие плюшки, пополняют энергию.<br>Некоторые блоки имеют свои особенности - привыкай, жизнь сложная штука.</p><p>Управление - просто тапай по экрану и полетишь, не тапнешь - упадешь. И помни, дно и потолок доставляют тебе боль.</p><p>Собственно всё. Удачи! :)</p>";
        menu_window.appendChild(menu_info);

        menu_footer = document.createElement("div");
        menu_footer.classList.add('menu__footer');
        menu_window.appendChild(menu_footer);

        game_header = document.createElement("header");
        game_header.classList.add('game__header');
        document.body.appendChild(game_header);

        game_footer = document.createElement("footer");
        game_footer.classList.add('game__footer');
        document.body.appendChild(game_footer);

        button_menu = document.createElement("button");
        button_menu.innerText = "Меню";
        button_menu.classList.add("game__button-menu");
        game_footer.appendChild(button_menu);

        button_resume = document.createElement("button");
        button_resume.innerText = "Продолжить";
        button_resume.classList.add("game__button-menu");
        menu_footer.appendChild(button_resume);

        button_restart = document.createElement("button");
        button_restart.innerText = "Сменить работу";
        button_restart.classList.add("game__button-restart");
        menu_footer.appendChild(button_restart);

        playerEnergyContainer = document.createElement("p");
        playerEnergyContainer.classList.add("player-energy__container");
        playerEnergyContainer.innerHTML = "энергия<br><span class='player-energy__value'></span>";
        game_header.appendChild(playerEnergyContainer);
        playerEnergy = document.querySelector('.player-energy__value');
        
        gameScoreContainer = document.createElement("p");
        gameScoreContainer.classList.add("player-score__container");
        gameScoreContainer.innerHTML = "опыт<br><span class='player-score__value'></span>";
        game_header.appendChild(gameScoreContainer);
        playerExperience = document.querySelector('.player-score__value');

        playerPositionContainer = document.createElement("p");
        playerPositionContainer.classList.add("player-position__container");
        playerPositionContainer.innerHTML = "Должность<br><span class='player-position__value'></span>";
        game_header.appendChild(playerPositionContainer);
        playerPosition = document.querySelector('.player-position__value');
        // создание listeners
        if (window.PointerEvent) {
            addEventListeners(' pointerup', button_restart, function(event) {
                event.preventDefault();
                gameController.restart();
            });
            addEventListeners(' pointerup', button_menu, function(event) {
                event.preventDefault();
                gameController.toggleMenu();
            });
            addEventListeners(' pointerup', button_resume, function(event) {
                event.preventDefault();
                gameController.toggleMenu();
            });
            addEventListeners(' pointerdown', canvas, function(evente) {
                event.preventDefault();
                accelerate(-0.2);
            });
            addEventListeners(' pointerup', canvas, function(evente) {
                event.preventDefault();
                accelerate(0.05);
            });
        } else if (window.TouchEvent) {
            addEventListeners('touchend', button_restart, function(event) {
                event.preventDefault();
                gameController.restart();
            });
            addEventListeners('touchend', button_menu, function(event) {
                event.preventDefault();
                gameController.toggleMenu();
            });
            addEventListeners('touchend', button_resume, function(event) {
                event.preventDefault();
                gameController.toggleMenu();
            });
            addEventListeners('touchstart', canvas, function(evente) {
                event.preventDefault();
                accelerate(-0.2);
            });
            addEventListeners('touchend', canvas, function(evente) {
                event.preventDefault();
                accelerate(0.05);
            });
        }
    };
    /**
     * Рестарт игры
     */
    this.restart = function() {
        gameController.restart();
    };
    /**
     * Старт игры
     */
    this.startGame = function() {
        gameController.start();
    };
    
    /**
     * Контроллер игры
     */
    var gameController = {
        // Момент игры
        frameNo: 0,
        // ИН игрового объекта
        indexObject: 0,
        isPause: false,
        selfDestructor: function(n, points) {
            if (everyinterval(n)) {
                player.energy -= points;
            }
        },
        checkDiapason: function(property, min, max) {
            property = (property >= min ? (property <= max ? property : max) : min);
        },
        start: function() {
            this.restart();
        },
        toggleMenu: function() {
            this.isPause = !this.isPause;
            if (!this.isPause) {
                menu_container.style.display = "none";
            }
            else {
                menu_container.style.display = "block";
            }
        },
        clear : function() {
            context.clearRect(0, 0, canvas.width, canvas.height);
        },
        restart: function() {
            this.isPause = false;
            menu_container.style.display = "none";
            player = new Сomponent(playerG, _options.startPosition.x, _options.startPosition.y, 30, 30);
            listAvailableItems = [
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
            // частота появления объектов
            frequencyCreation: 150,
        }
    };
    
    
    // ИН объекта на удаление
    var idDeleteObject;
    // генератор случайного типа объекта
    function GameObjectGenerator() {
        var rand = Math.floor(Math.random() * listAvailableItems.length);
        return listAvailableItems[rand];
    }
    // callback выбора при проигрыше 
    function onGameOver(buttonIndex) {
        if (buttonIndex === 1) {
            gameController.restart();
        } else {
            navigator.notification.alert(
                "Любишь ты Алешку больше, чем меня.\nО Лешке ты вздыхаешь зря,\nО Лешке все твои мечты,\nТолько о Сереге позабыла ты!\n\nИ без Лешки жизнь твоя пуста\nТы совсем еще наивна и чиста.\nНаблюдаешь ты за ним из далека.\nТолько между вами слез река!\n\nПотому что есть Алешка у тебя,\nО Лешке ты вздыхаешь зря,\nО Лешке все твои мечты,\nТолько о Сереге позабыла ты!",
                gameController.restart(),
                'Алешка - Руки Вверх',
                "Ok... Пора работать"
            );
        }
    }
    /**
     * Конструктор объекта в Canvas
     * @param {*} width 
     * @param {*} height 
     * @param {*} gameObject 
     * @param {*} x 
     * @param {*} y 
     */
    function Сomponent(gameObject, x, y, width, height) {
        for (var key in gameObject) {
            this[key] = gameObject[key];
        }

        this.x = x;
        this.y = y;
        var fontSize = 30 * _options.scale > 60 ? 60 : 30;
        this.height = height || parseInt(fontSize, 10) + 10;
        this.width = width || context.measureText(gameObject.name).width + 10;

        if (gameObject.type === "player") {
            this.width = this.height = parseInt(fontSize, 10) + 10;
        }
        // Отрисовка объекта
        this.draw = function() {
            if (gameObject.type == "text") {
                context.fillStyle = gameObject.color;
                context.font = fontSize / 3 + "px Arial";
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
        this.draw();
        // Новое положение
        this.updatePosition = function() {
            this.gravitySpeed += this.gravity;
            this.x += this.speedX;
            this.y += this.speedY + this.gravitySpeed;
            
            var borderBottom = canvas.height - this.height;
            if (this.y >= borderBottom) {
                this.y = borderBottom;
                this.gravitySpeed = 0;
                this.energy -= 1;
            }
            else if (this.y <= 0) {
                this.y = 0;
                this.gravitySpeed = 0;
                this.energy -= 1;
            }
        };
        // Столкновение с другими объектами
        this.strikeWith = function(otherobj) {
            var myleft = this.x;
            var myright = this.x + (this.width);
            var mytop = this.y;
            var mybottom = this.y + (this.height);
            var otherleft = otherobj.x;
            var otherright = otherobj.x + (otherobj.width);
            var othertop = otherobj.y;
            var otherbottom = otherobj.y + (otherobj.height);
            var isStrike = true;
            if ((mybottom < othertop) ||
                (mytop > otherbottom) ||
                (myright < otherleft) ||
                (myleft > otherright)) {
                isStrike = false;
            }
            return isStrike;
        };
    }
    /**
     * Обновление событий в мире игры
     */
    function updateGame() {
        // если игровая пауза
        if (gameController.isPause) {
            return;
        }
        gameController.clear();
        gameController.frameNo += 1;
        // Закончилась энергия
        if (player.energy <= 0) {
            player.energy = 0;
            navigator.notification.confirm(
                player.getPosition() + '! Ты перегорел, но успел получить опыт: ' + player.experience,
                onGameOver,
                'Геймовер',
                ['Сменить работу', 'Грустить']
            );
            clearInterval(gameController.interval);
        }
        // Удаление объекта
        if (idDeleteObject) {
            delete allObjects[idDeleteObject];
            idDeleteObject = null;
        }
        // Проверка событий и объектов; получение ИН на удаление объекта
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
        // Ограничение на скорость игрока
        gameController.checkDiapason(player.speed, 8, 60);
        // Обновление объектов
        for (var i in allObjects) {
            allObjects[i].x -= Math.floor(player.speed / 5);
            allObjects[i].draw();
        }
        // Создание новых объектов
        if (gameController.frameNo == 1 || everyinterval(gameController.options.frequencyCreation / player.speed * 15)) {
            var positionY = randomMinMax(-20, 100);
            var maxCountOfObject = 0;
            while (positionY < canvas.height - 40 && maxCountOfObject < 10) {
                x = canvas.width + randomMinMax(0, 400);
                allObjects[gameController.indexObject] = Object.assign(
                    new Сomponent(GameObjectGenerator(), x, positionY),
                    { id: gameController.indexObject} );
                positionY += (allObjects[gameController.indexObject].height + randomMinMax(20, 100));
                gameController.indexObject++;
                maxCountOfObject++;
            }
        }
        playerExperience.innerText = player.experience;
        playerPosition.innerText = player.getPosition();
        playerEnergy.innerText = player.energy;
        player.updatePosition();
        player.draw();
        // постоянное уменьшение энергии, чтобы не расслаблялись
        gameController.selfDestructor(100, 1);
    }
    /**
     * Проверка момента времени игры
     * @param {*} n - каждый n-ый момент внутреннего счетчика игры
     */
    function everyinterval(n) {
        if ((gameController.frameNo / Math.floor(n)) % 1 === 0) { return true; }
        return false;
    }
    // Изменение гравитации
    function accelerate(n) {
        player.gravity = n;
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
    /**
     * Случайный выбор
     * @param {*} min 
     * @param {*} max 
     */
    function randomMinMax(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    var POSITIONS = [
        "Стажер",
        "Симпатичненький стажер",
        "Джуниор",
        "Джуниор с перспективами",
        "Мидл",
        "Сеньор",
        "Легенда",
        "Герой мифов",
        "Борис \"Бритва\"",
        "Кенни Маккормик"
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
            /**
             * Получить должность игрока (exp - для проверки изменится ли должность с новой экспой)
             */
            this.getPosition = function(exp) {
                switch (true) {
                    case this.experience + (exp || 0) < 50 && this.experience + (exp || 0) >= 30:
                        // Стажер с официальным оффером
                        return POSITIONS[1];
                    case this.experience + (exp || 0) < 150 && this.experience + (exp || 0) >= 50:
                        // Джуниор
                        return POSITIONS[2];
                    case this.experience + (exp || 0) < 250 && this.experience + (exp || 0) >= 150:
                        // Джуниор с перспективами
                        return POSITIONS[3];
                    case this.experience + (exp || 0) < 500 && this.experience + (exp || 0) >= 250:
                        // Мидл
                        return POSITIONS[4];
                    case this.experience + (exp || 0) < 800 && this.experience + (exp || 0) >= 500:
                        // Сеньор
                        return POSITIONS[5];
                    case this.experience + (exp || 0) < 1100 && this.experience + (exp || 0) >= 800:
                        // Легенда
                        return POSITIONS[6];
                    case this.experience + (exp || 0) < 1500 && this.experience + (exp || 0) >= 1100:
                        // Миф
                        return POSITIONS[7];
                    case this.experience + (exp || 0) < 2000 && this.experience + (exp || 0) >= 1500:
                        // Борис
                        return POSITIONS[8];
                    case this.experience + (exp || 0) >= 2000:
                        // Кенни
                        return POSITIONS[8];
                    default:
                        // стажер
                        return POSITIONS[0];
                }
            };
        } else {
            this.effect = effect;
        }
    }

    // создание игрока
    var playerG = new GameObject("player", "Я", "#28916E");      
    // игровые объекты
    var information = new GameObject("text", "Игровая информация", "red");
    var coffee = new GameObject("objectText", "Кофе", "black", new Effect( { speed: 3, energy: 10 }, 5));
    var energetic = new GameObject("objectText", "Энергетик", "black", new Effect( { speed: -4, energy: 20 }, 5));
    var cookies = new GameObject("objectText", "Печеньки", "black", new Effect( { energy: 4 }));
    var beer = new GameObject("objectText", "Пиво", "black", new Effect( { gravitySpeed: 5, energy: 5 }));
    var coniac = new GameObject("objectText", "Рюмка коньяка", "black", new Effect( { gravitySpeed: 15, energy: 2 }));
    var relax = new GameObject("objectText", "Take It Easy", "black", new Effect( { speed: -5, energy: 10 }));
    var harmony = new GameObject("objectText", "Успокоиться", "black", new Effect( { speed: -3, energy: 3 }));

    var task = new GameObject("objectText", "Таск", "red", new Effect( { energy: -5, experience: 8 }));
    var prod = new GameObject("objectText", "Уронить прод", "red", new Effect( { energy: -25, experience: -5 }));
    var trainee = new GameObject("objectText", "Взять стажера", "red", new Effect( { energy: -20, speed: 2, experience: 30 }));
    var taskMinor = new GameObject("objectText", "Минорный таск", "red", new Effect( { energy: -2, experience: 2 }));
    var hotfix = new GameObject("objectText", "Хотфикс", "red", new Effect( { energy: -15, experience: 15 }));
    var hotfixLarge = new GameObject("objectText", "ОЧЕНЬ СРОЧНЫЙ ХОТФИКС", "red", new Effect( { energy: -15, experience: 25 }));
    var crazy = new GameObject("objectText", "Психануть", "red", new Effect( { speed: 50, energy: -40 }, 2));
    var deadline = new GameObject("objectText", "Дедлайн", "red", new Effect( { speed: 20, energy: -20, experience: 40 }, 3));
        
    /**
     * Эффект, который накладывается от столкновения с объектом
     * @param {*} properties 
     * @param {*} time 
     */
    function Effect(properties, time) {
        this.buff = function(target) {
            for (var key in properties) {
                var nextLevel = POSITIONS.indexOf(target.getPosition(properties[key]));
                var oldLevel = POSITIONS.indexOf(target.getPosition());
                if (key === "experience" && nextLevel > oldLevel) {
                    target.speed += 3 * oldLevel;
                    switch (nextLevel) {
                        case 1:
                            // Стажер с официальным оффером
                            listAvailableItems.push(task);
                            break;
                        case 2:
                            // Джуниор
                            listAvailableItems.push(task);
                            listAvailableItems.push(task);
                            listAvailableItems.push(coffee);
                            listAvailableItems.push(prod);
                            break;
                        case 3:
                            // Джуниор с перспективами
                            listAvailableItems.push(task);
                            listAvailableItems.push(hotfix);
                            listAvailableItems.push(coffee);
                            listAvailableItems.push(energetic);
                            break;
                        case 4:
                            // Мидл
                            listAvailableItems = listAvailableItems.filter(function(item){
                                return item != taskMinor;
                            });
                            listAvailableItems.push(trainee);
                            listAvailableItems.push(task);
                            listAvailableItems.push(hotfix);
                            listAvailableItems.push(coniac);
                            listAvailableItems.push(deadline);
                            listAvailableItems.push(harmony);
                            break;
                        case 5:
                            // Сеньор
                            listAvailableItems = listAvailableItems.filter(function(item){
                                return item != task;
                            });
                            listAvailableItems.push(hotfixLarge);
                            listAvailableItems.push(task);
                            listAvailableItems.push(deadline);
                            listAvailableItems.push(relax);
                            break;
                        case 6:
                            // Легенда
                            listAvailableItems.push(deadline);
                            listAvailableItems.push(hotfix);
                            listAvailableItems.push(hotfixLarge);
                            listAvailableItems.push(hotfixLarge);
                            listAvailableItems.push(crazy);
                            listAvailableItems.push(relax);
                            listAvailableItems.push(coniac);
                            listAvailableItems.push(energetic);
                            break;
                        case 7:
                            // Миф
                            listAvailableItems.push(deadline);
                            listAvailableItems.push(coffee);
                            listAvailableItems.push(relax);
                            break;
                        case 8:
                            // Борис
                            listAvailableItems.push(deadline);
                            listAvailableItems.push(hotfixLarge);
                            break;
                        case 9:
                            // Кенни
                            listAvailableItems.push(deadline);
                            listAvailableItems.push(hotfix);
                            listAvailableItems.push(hotfixLarge);
                            break;
                        default: break;
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
};