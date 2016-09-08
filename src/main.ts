/// <reference path="jquery.d.ts" />
/// <reference path="player.ts" />
/// <reference path="enemies.ts" />
/// <reference path="game.ts" />


var canvas = <HTMLCanvasElement>document.getElementById("canvas");

var ctx = <CanvasRenderingContext2D>canvas.getContext("2d");

var keyCodes = Object.freeze({
	left: 37,
	right: 39,
	space: 32
});

class Ground {
	img  = <HTMLImageElement>document.getElementById("ground1");
	imgWidth = this.img.width;
	imgHeight = this.img.height;
	alive = true;

	constructor(public x: number, public y: number) {

	}
	width = 200;
	height = 100;
	draw() {
		ctx.save();

		ctx.translate(this.x, -this.y + game.height);
		ctx.drawImage(this.img, 0, 0, this.width, this.height);

		ctx.restore();
	}

	findVertical(x, y) {
		if (x < this.x + this.width && x > this.x && y > this.y - this.height) {
			return this.y - y;
		}
		return null;
	}

	step() {
		this.x -= game.scrollSpeed;
		if (this.x < -this.width) {
			this.alive = false;
		}
	}

}

class Unit {
	alive = true; //If the unit is to be removed next step
	step() {

	}

	draw() {

	}
}

class Smoke extends Unit {
	imgs: HTMLImageElement[] = [];
	img: HTMLImageElement;
	imgIndex = 0;
	time = 0;
	size = 50;

	constructor(public x: number, public y: number) {
		super();
		for (let i = 1; i <= 7; ++i) {
			this.imgs[i] = <HTMLImageElement>document.getElementById("smoke" + i);
		}
		this.img = this.imgs[1];
	}

	draw() {
		ctx.save();
		ctx.translate(this.x, game.height - this.y);
		ctx.drawImage(this.img, -this.size / 2, -this.size/2, this.size, this.size);
		ctx.restore();
	}

	step() {
		++this.time;
		this.imgIndex = Math.floor(this.time / 2) + 1;
		if (this.imgIndex > 7) {
			this.imgIndex = 7;
			this.alive = false;
		}
		this.img = this.imgs[this.imgIndex];
	}
}


class Blood extends Unit {
	imgs: HTMLImageElement[] = [];
	img: HTMLImageElement;
	imgIndex = 0;
	size = 200;
	opacity = 1;

	constructor(public x: number, public y: number) {
		super();
		this.img = <HTMLImageElement>document.getElementById("blood" + Math.floor(Math.random() * 2.99 + 1));
	}

	draw() {
		if (this.opacity <= 0) {
			return;
		}
		ctx.save();
		ctx.translate(this.x, game.height - this.y);
		ctx.globalAlpha = this.opacity;
		ctx.drawImage(this.img, -this.size / 2, -this.size/2, this.size, this.size);
		ctx.globalAlpha = 1;
		ctx.restore();
	}

	step() {
		if (this.opacity <= 0) {
			this.alive = false;
		}
		else {
			this.opacity -= .08;
		}
	}
}

class Sounds {
	ouch: HTMLAudioElement[];
	snap: HTMLAudioElement[];
	gr: HTMLAudioElement[];
	splash: HTMLAudioElement[];
	hish: HTMLAudioElement[];
	punch: HTMLAudioElement[];
	steps: HTMLAudioElement[];
	lava: HTMLAudioElement[];

	loadAll(name: string) {
		let i = 1;
		let s: HTMLAudioElement = null;
		let array: HTMLAudioElement[] = [];

		while ((s = <HTMLAudioElement> document.getElementById(name + i)) != null) {
			array[i - 1] = s;
			++i;
		}
		return array;
	}

	constructor() {
		this.ouch = this.loadAll("ouch");
		this.snap = this.loadAll("snap");
		this.gr = this.loadAll("gr");
		this.splash = this.loadAll("splash");
		this.hish = this.loadAll("pys");
		this.punch = this.loadAll("punch");
		this.steps = this.loadAll("steps");
		this.lava = this.loadAll("lava");
	}

	playsound(sound: string) {
		let soundArray = <HTMLAudioElement[]>this[sound];
		let s = soundArray[Math.floor(soundArray.length * Math.random())];
		if (s.paused) {
			s.play();
		}
		else {
			s.currentTime = 0;
		}
	}
}

class Level {
	tyranosaurus = false;
	lava = true;
	scrollSpeed = 4;
	meteors = false;
	liaoningopterus = false;
	enemyMultiplier = 2;
	length = 500;
	house = false;
	lastLevel = false;
	text = "";
}

class Level1 extends Level{
	//Just inherit the standard level
	text = "Hej! Och välkommen på kalas! Förresten se upp för lavan i trädgården den kan vara lite varm så här dags";
}

class Level2 extends Level1 {
	scrollSpeed = 7;
	tyranosaurus = true;
	length = 1000;
	text = "Oj! Jag glömde att berätta, jag släppte ut Dino idag, han kan gilla att leka, säkert inget farligt, ehe";
}

class Level3 extends Level2 {
	liaoningopterus = true;
	lava = false;
	text = "Just tusan, mina flygödlor har smitit...";
}

class Level4 extends Level3 {
	meteors = true;
	text = "Typiskt, just när man har samlat ihop ett gäng fina dinosaurier så blir det meteoritregn...";
}

class Level5 extends Level4 {
	lava = true;
	text = "Hej! Hur går det? Vi börjar snart med maten";
}
class Level6 extends Level5 {
	enemyMultiplier = 5;
	text = "Jag kan se dig härifrån, det är bara en bit till";
}
class Level7 extends Level6 {
	tyranosaurus = false;
	lava = false;
	scrollSpeed = 4;
	meteors = false;
	liaoningopterus = false;
	enemyMultiplier = 2;
	length = 500;
	house = true;
	lastLevel = true;
	text = "Välkommen, du han precis i tid :)";
}

var levels = [
	new Level1(),
	new Level2(),
	new Level3(),
	new Level4(),
	new Level5(),
	new Level6(),
	new Level7()
]

class House extends Unit{
	y = 0;
	img  = <HTMLImageElement>document.getElementById("hus");
	width = this.img.width / 2;
	height = this.img.height / 2;

	constructor(public x: number) {
		super();
	}

	draw() {
		ctx.save();

		ctx.translate(this.x, -this.y + game.height);
		ctx.drawImage(this.img, 0, -this.height, this.width, this.height);

		ctx.restore();
	}

	step() {
		this.x -= game.scrollSpeed;
		if (this.x < 100) {
			game.scrollSpeed /= 1.1;
		}
	}

}

class Display {
	step() {

	}

	draw() {

	}
}


var game: Game;
var sounds: Sounds;
var menu: Menu;

$(document).ready(function() {
	menu = new Menu();
	sounds = new Sounds();

	setInterval(function() {
		if (game) {
			game.step();
			game.draw();
		}
		menu.draw();
	}, 50);


	$(document).keydown(function(e){
		if (game) {
			if (e.keyCode == keyCodes.left || e.keyCode == keyCodes.right || e.keyCode == keyCodes.space) {
				game.keyPress(e.keyCode);
				e.preventDefault();
			}
		}
		else {
			menu.keyPress(e.keyCode);
		}
	});

	$(document).keyup(function(e) {
		if (game) {
			game.keyup(e.keyCode);
		}
	})
})

