var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 512;
canvas.height = 480;
document.body.appendChild(canvas);
var bgReady = false;
var bgImage = new Image();
bgImage.onload = function () {
	bgReady = true;
};
bgImage.src = "background.png";
var heroReady = false;
var heroImage = new Image();
heroImage.onload = function () {
	heroReady = true;
};
heroImage.src = "hero.png";
var monsterReady = false;
var monsterImage = new Image();
monsterImage.onload = function () {
	monsterReady = true;
};
monsterImage.src = "monster.png";
var hero = {
	speed: 256
};
var monster = {};
var monstersCaught = 0;
var keysDown = {};
addEventListener("keydown", function (e) {
	keysDown[e.keyCode] = true;
}, false);
addEventListener("keyup", function (e) {
	delete keysDown[e.keyCode];
}, false);
var reset = function () {
	hero.x = canvas.width / 2;
	hero.y = canvas.height / 2;
	monster.x = 32 + (Math.random() * (canvas.width - 64));
	monster.y = 32 + (Math.random() * (canvas.height - 64));
};
var update = function (modifier, ws) {
	if (38 in keysDown) {
		if (user === "hero"){
			hero.y -= hero.speed * modifier;
		}
		if (user === "monster"){
			monster.y -= hero.speed * modifier;
		}
	}
	if (40 in keysDown) {
		if (user === "hero"){
			hero.y += hero.speed * modifier;
		}
		if (user === "monster"){
			monster.y += hero.speed * modifier;
		}
	}
	if (37 in keysDown) {
		if (user === "hero"){
			hero.x -= hero.speed * modifier;
		}
		if (user === "monster"){
			monster.x -= hero.speed * modifier;
		}
	}
	if (39 in keysDown) {
		if (user === "monster"){
			monster.x += hero.speed * modifier;
		}
		if (user === "hero"){
			hero.x += hero.speed * modifier;
		}
	}
	if (37 in keysDown || 38 in keysDown || 39 in keysDown || 40 in keysDown){
		if (user === "hero" || user === "monster"){
			ws.send(JSON.stringify({ Session: session, MonstersCaught: monstersCaught, HeroY: hero.y, HeroX: hero.x, MonsterY: monster.y, MonsterX: monster.x }));
		}
	}
	ws.onmessage = function (e) {
		var resp = JSON.parse(e.data);
		if (resp['Session'] === session){
			monster.y = resp['MonsterY'];
			monster.x = resp['MonsterX'];
			hero.x = resp['HeroX'];
			hero.y = resp['HeroY'];
			monstersCaught = resp['MonstersCaught'];
		}
	};
	if (
		hero.x <= (monster.x + 32)
		&& monster.x <= (hero.x + 32)
		&& hero.y <= (monster.y + 32)
		&& monster.y <= (hero.y + 32)
	) {
		++monstersCaught;
		reset();
	}
};
var render = function () {
	if (bgReady) {
		ctx.drawImage(bgImage, 0, 0);
	}
	if (heroReady) {
		ctx.drawImage(heroImage, hero.x, hero.y);
	}
	if (monsterReady) {
		ctx.drawImage(monsterImage, monster.x, monster.y);
	}
	// Score
	ctx.fillStyle = "rgb(250, 250, 250)";
	ctx.font = "24px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText("Capturas do monstro: " + monstersCaught, 32, 32);
};
var main = function (ws) {
	var now = Date.now();
	var delta = now - then;
	update(delta / 1000, ws);
	render();
	then = now;
};
var session = prompt("Digite o nome da sessao", "");
var user = prompt("Digite seu char monster ou hero", "");
reset();
var then = Date.now();
var ws = new WebSocket('ws://' + window.location.host + '/ws');
ws.onopen = function () {
	setInterval(function(){main(ws)}, 1);
}
