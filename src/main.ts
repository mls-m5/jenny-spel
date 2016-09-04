/// <reference path="jquery.d.ts" />
/// <reference path="player.ts" />
/// <reference path="enemies.ts" />

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

	constructor(public x: number, public y: number) {

	}
	width = 200;
	height = 100;
	draw() {
		ctx.save();

		ctx.translate(this.x, -this.y + game.height);
		// ctx.fillRect(0, 0, this.width, this.height);
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
	}

	playsound(sound: string) {
		let soundArray = <HTMLAudioElement[]>this[sound];
		let s = soundArray[Math.floor(soundArray.length * Math.random())];
		s.play();
	}
}


class Game {
	width = canvas.width;
	height = canvas.height;
	player = new Player();
	dino = new Tyranosaurus();
	ground: Ground[] = [];
	lava = new Lava();
	units: Unit[] = [];
	nextMeteor = 0;
	nextDino = 0;
	scrollSpeed = 5;

	constructor() {
		while (this.checkGround()) {
			//Just call the function untill it returns false
		}
		
		this.push(new Smoke(200, 100));
	}

	checkGround() {
		if (this.ground.length == 0 || this.ground[this.ground.length - 1].x < this.width) {
			let x = 0;
			if (this.ground.length > 0) {
				x = this.ground[this.ground.length - 1].x + 300;
			}
			this.ground.push(new Ground(x, Math.random() * 200 + 80));
			return true;
		}
		else {
			return false;
		}
	}

	push(unit: Unit) {
		this.units.push(unit);
	}

	pushFront(unit: Unit) {
		this.units.unshift(unit);
	}

	draw() {
		ctx.clearRect(0, 0, this.width, this.height);
		this.player.draw();
		for (let g of this.ground) {
			g.draw();
		}

		this.dino.draw();
		this.lava.draw();
		for (let u of this.units) {
			u.draw();
		}
	}

	gameLogics() {
		if (--this.nextMeteor < 0) {
			this.nextMeteor = (50 + Math.random() * 50) / 5;
			this.push(new Meteor(Math.random() * this.width, this.height + 100, Math.random() * 20 - 10));
		}

		if (--this.nextDino < 0) {
			this.nextDino = (70 + Math.random() * 60) / 5;
			this.push(new Liaoningopterus(Math.random() * 300 + this.width, Math.random() * 30 + this.height, Math.random()));
		}
	}

	step() {
		this.checkGround();
		this.gameLogics();
		for (let g of this.ground) {
			g.step();
		}
		this.player.step();
		this.dino.step();
		this.lava.step();

		for (let u of this.units) {
			u.step();
		}

		//Remove dead objects
		this.units = this.units.filter(function(u) {return u.alive});
	}

	keyPress(key: number) {
		this.player.keyPress(key);
	}

	keyup(key: number) {
		this.player.keyup(key);
	}

	findVertical(x, y) {
		let v = null;
		for (let g of this.ground) {
			let nv = g.findVertical(x, y);
			if (nv != null) {
				if (nv >= v) {
					v = nv;
				}
			}
		}
		return v;
	}
};

var game: Game;
var sounds: Sounds;

$(document).ready(function() {
	game = new Game();
	sounds = new Sounds();

	setInterval(function() {
		game.step();
		game.draw();
	}, 50);


	$(document).keydown(function(e){
		if (e.keyCode == keyCodes.left || e.keyCode == keyCodes.right || e.keyCode == keyCodes.space) {
			game.keyPress(e.keyCode);
			e.preventDefault();
		}
	});

	$(document).keyup(function(e) {
		game.keyup(e.keyCode);
	})
})

