/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {
        var game = new Game();
        game.create();
        game.startGame()
        this.receivedEvent('deviceready');
        // document.querySelector('#camera_button').addEventListener('click', this.onCameraButton.bind(this));
        var myGamePiece,
            myObstacles = [],
            myScore,
            startPosition = {
                x: 80,
                y: 10
            };

            var canvasProperties = {
                width: 800,
                height: 280
            },
            wt = canvasProperties.width;

        var button_restart = document.querySelector('.game__button-restart');
        var canvas = document.createElement("canvas");

        // document.body.appendChild(canvas);
        canvas.width = canvasProperties.width;
        canvas.height = canvasProperties.height;
        context = canvas.getContext("2d");

        canvas.addEventListener('pointerdown', function(e){
            accelerate(-0.2);
        });
        canvas.addEventListener('touchstart', function(e){
            accelerate(-0.2);
        })

        canvas.addEventListener('pointerup', function(e){
            accelerate(0.05);
        });
        canvas.addEventListener('touchend', function(e){
            accelerate(0.05);
        });

        function startGame() {
            myGamePiece = new component(30, 30, "black", startPosition.x, startPosition.y);
            myGamePiece.gravity = 0.05;
            myScore = new component("30px", "30px", "black", 20, 20, "text");
            myGameArea.start();
        }

        function restartGame() {
            console.log("restart!")
            myGamePiece.gravity = 0.05;
            myGamePiece.x = startPosition.x;
            myGamePiece.y = startPosition.y ;
            myGamePiece.gravitySpeed = 0;
            myGameArea.restart();
        }
        //gameArea object
        var myGameArea = {
            //start game property
            start : function() {
                //score :)
                this.frameNo = 0;
                //interval
                this.interval = setInterval(updateGameArea, 20);
                
                },
            clear : function() {
                context.clearRect(0, 0, canvas.width, canvas.height);
            },
            restart: function() { 
                canvasProperties.width = canvas.width || 800;
                this.frameNo = 0;
                myObstacles = [];
                this.clear();
            }
        }

        function component(width, height, color, x, y, type) {
            this.type = type;
            this.score = 0;
            this.width = width;
            this.height = height;
            this.speedX = 0;
            this.speedY = 0;
            this.x = x;
            this.y = y;
            this.gravity = 0;
            this.gravitySpeed = 0;
            this.update = function() {
                ctx = context;
                if (this.type == "text") {
                    ctx.font = this.width + " " + this.height;
                    ctx.fillStyle = color;
                    ctx.fillText(this.text, this.x, this.y);
                } else {
                    ctx.fillStyle = color;
                    ctx.fillRect(this.x, this.y, this.width, this.height);
                }
            }
            this.newPos = function() {
                this.gravitySpeed += this.gravity;
                this.x += this.speedX;
                this.y += this.speedY + this.gravitySpeed;
                this.hit();
            }
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
            }
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

        function updateGameArea() {
            var x, height, gap, minHeight, maxHeight, minGap, maxGap;
            for (i = 0; i < myObstacles.length; i += 1) {
                if (myGamePiece.crashWith(myObstacles[i])) {
                    return;
                }
            }
            myGameArea.clear();
            myGameArea.frameNo += 1;
            var bottomObstacle = 0;
            if (myGameArea.frameNo == 1 || everyinterval(150)) {
                x = canvas.width;
                minHeight = 10;
                maxHeight = 200;
                height = Math.floor(Math.random()*(maxHeight-minHeight+1)+minHeight);
                width = Math.floor(Math.random()*(30-20+1)+20);
                minGap = 70;
                maxGap = 100;
                gap = Math.floor(Math.random()*(maxGap - minGap + 1) + minGap);
                myObstacles.push(new component(width, height, "black", x, 0));
                bottomObstacle = canvas.height - height - gap;
                if (bottomObstacle > 0) 
                myObstacles.push(new component(width, bottomObstacle, "red", x, height + gap));
            else
                console.log(bottomObstacle + "!");
            }
            for (i = 0; i < myObstacles.length; i += 1) {
                myObstacles[i].x += -1;
                myObstacles[i].update();
            }
            myScore.text="SCORE: " + myGameArea.frameNo;
            myScore.update();
            myGamePiece.newPos();
            myGamePiece.update();
        }

        function everyinterval(n) {
            if ((myGameArea.frameNo / n) % 1 == 0) {return true;}
            return false;
        }

        function accelerate(n) {
            myGamePiece.gravity = n;
        }

        startGame();;

        button_restart.addEventListener('touchstart', restartGame);
        button_restart.addEventListener('pointerdown', restartGame);
    },

    onCameraButton: function() {
        console.log('camera', navigator.camera);

        navigator.camera.getPicture(
            function cameraSuccess(imageUrl) {
                console.log("Camera Success", imageUrl);
                document.querySelector(".image").src = imageUrl;
            },
            function cameraError(err) {
                console.log("Camera Error: ", err);
            },
            {
                sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
                allowEdit: true
            }
        );
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        // var parentElement = document.getElementById(id);
        // var listeningElement = parentElement.querySelector('.listening');
        // var receivedElement = parentElement.querySelector('.received');

        // listeningElement.setAttribute('style', 'display:none;');
        // receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};

app.initialize();