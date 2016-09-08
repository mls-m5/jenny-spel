/// <reference path="main.ts" />
/// <reference path="enemies.ts" />
/// <reference path="player.ts" />
/// <reference path="menu.ts" />


class Mobile {
	imgs = [
		<HTMLImageElement>document.getElementById("mobil1"),
		<HTMLImageElement>document.getElementById("mobil2"),
		<HTMLImageElement>document.getElementById("mobil3"),
		<HTMLImageElement>document.getElementById("mobil4")
	];
	indexMap = [0, 1, 2, 1, 3, 1];
	width = this.imgs[0].width / 5;
	height = this.imgs[0].height / 5;
	index = 0;
	nextIndex = 0;
	mobileText = "";
	show = 200;
	opacity = 1;

	showText(txt: string) {
		this.mobileText = txt;
		this.show = 200;
	}

	draw() {
		if (--this.nextIndex <= 0) {
			this.nextIndex = 2;
			if (++this.index >= this.indexMap.length) {
				this.index = 0;
			}
		}
		if (this.opacity > 0) {
			ctx.globalAlpha = .8 * this.opacity;
			ctx.fillStyle = "#FFFFFF";
			ctx.fillRect(0,0, game.width, 50);
			ctx.globalAlpha = this.opacity;
			ctx.strokeStyle = "Black";
			ctx.drawImage(this.imgs[this.indexMap[this.index]], 0, 0, this.width, this.height);
			ctx.font = "12px sans-serif";
			ctx.strokeText(this.mobileText, this.width + 10, 30);
			ctx.globalAlpha = 1;
		}
	}

	step() {
		if (this.show > 0) {
			--this.show;
			this.opacity = 1;
		}
		else {
			this.show = 0;

			if (this.opacity > 0) {
				this.opacity -= .1;
			}
			else {
				this.opacity = 0;
			}
		}
	}
}

class Grass {
	img  = <HTMLImageElement>document.getElementById("grass");
	x = 0;
	y = 25;
	width = this.img.width;
	height = this.img.height;

	step() {
		this.x -= game.scrollSpeed;
		if (this.x < -this.width) {
			this.x += this.width;
		}

	}

	draw() {
		let repeatNum = Math.ceil(game.width / this.width) + 1;
		ctx.save();
		ctx.translate(this.x, game.height - this.y);
		for (let i = 0; i < repeatNum; ++i) {
			ctx.drawImage(this.img, +this.width * i, 0, this.width, this.height);
		}
		ctx.restore();
	}

}

class LifeMeter {
	img  = <HTMLImageElement>document.getElementById("egg");
	x = 10;
	y = 40;
	width = 30;
	height = this.width

	draw() {
		let repeatNum = game.player.lives;
		ctx.save();
		ctx.translate(this.x, game.height - this.y);
		for (let i = 0; i < repeatNum; ++i) {
			ctx.drawImage(this.img, +this.width * i, 0, this.width, this.height);
		}
		ctx.restore();
	}
}


class Game extends Display {
	width = canvas.width;
	height = canvas.height;
	player = new Player();
	dino: Tyranosaurus = new Tyranosaurus();
	ground: Ground[] = [];
	lava = new Lava();
	units: Unit[] = [];
	nextMeteor = 0;
	nextDino = 0;
	scrollSpeed = 7;
	mobile = new Mobile();
	grass = new Grass();
	lifeMeter = new LifeMeter();
	dead_title = <HTMLImageElement> document.getElementById("dead_title");

	level = -1;
	currentLevel: Level;
	leftOnLevel: number;
	house: House;
	overlay = 1.;

	constructor() {
		super();
		this.finishLevel();

		while (this.checkGround()) {
			//Just call the function untill it returns false
		}
	}

	checkGround() {
		if (this.currentLevel.lava) {
			if (this.ground.length == 0 || this.ground[this.ground.length - 1].x < this.width) {
				let x = this.width;
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

	step() {
		this.checkGround();
		this.gameLogics();
		for (let g of this.ground) {
			g.step();
		}
		if (this.house) {
			this.house.step();
			if (this.house.alive = false) {
				this.house = null;
			}
		}
		this.ground = this.ground.filter(function (g) {return g.alive});
		this.player.step();
		if (this.dino) {
			this.dino.step();
		}
		if (this.lava) {
			this.lava.step();
		}

		if (this.grass) {
			this.grass.step();
		}

		for (let u of this.units) {
			u.step();
		}

		this.mobile.step();

		//Remove dead objects
		this.units = this.units.filter(function(u) {return u.alive});
	}

	draw() {
		ctx.clearRect(0, 0, this.width, this.height);

		this.grass.draw();
		if (this.house) {
			this.house.draw();
		}
		for (let g of this.ground) {
			g.draw();
		}
		this.player.draw();

		if (this.dino) {
			this.dino.draw();
		}
		this.lava.draw();
		for (let u of this.units) {
			u.draw();
		}

		this.lifeMeter.draw();

		this.mobile.draw();

		if (this.overlay) {
			ctx.globalAlpha = this.overlay;
			ctx.fillStyle = "black";

			ctx.fillRect(0, 0, this.width, this.height);

			ctx.globalAlpha = 1;

			if (!this.currentLevel.lastLevel && this.player.lives <= 0) {
				ctx.drawImage(this.dead_title, 0, 0, this.width, this.height);
			}
		}
	}

	finishLevel() {
		if (this.currentLevel && this.currentLevel.lastLevel) {
			return;
		}
		++this.level;
		this.currentLevel = levels[this.level];
		if (!this.dino.hide && !this.currentLevel.tyranosaurus) {
			sounds.playsound("gr");
		}
		this.dino.hide = ! this.currentLevel.tyranosaurus;
		this.nextMeteor = 100; //Delay when the next meteor is comming
		this.nextDino = 100;
		this.leftOnLevel = this.currentLevel.length;
		this.scrollSpeed = this.currentLevel.scrollSpeed;
		this.lava.hide = !this.currentLevel.lava;
		if (this.currentLevel.house) {
			this.house = new House(this.width * 2);
		}
		this.mobile.showText(this.currentLevel.text);
	}

	gameLogics() {
		if (this.currentLevel.meteors) {
			if (--this.nextMeteor < 0) {
				this.nextMeteor = (50 + Math.random() * 50) / this.currentLevel.enemyMultiplier;
				this.push(new Meteor(Math.random() * this.width, this.height + 100, Math.random() * 20 - 10));
			}
		}

		if (this.currentLevel.liaoningopterus) {
			if (--this.nextDino < 0) {
				this.nextDino = (70 + Math.random() * 60) / this.currentLevel.enemyMultiplier;
				this.push(new Liaoningopterus(Math.random() * 300 + this.width, Math.random() * 30 + this.height, Math.random()));
			}
		}

		if (this.player.lives > 0) {
			--this.leftOnLevel;
			if (this.leftOnLevel < 0) {
				this.finishLevel();
			}
		}
		else {
			this.leftOnLevel = 10;
		}

		if (!this.currentLevel.lastLevel) {
			if (this.player.lives <= 0) {
				this.overlay += .02;
				this.overlay = Math.min(1, this.overlay);
				if (this.overlay >= 1) {
					game = null; //Restart from the menu
				}
			}
			else {
				if (this.overlay > 0) {
					this.overlay -= .01;
					this.overlay = Math.max(0, this.overlay);
				}
			}
		}
		else if (this.leftOnLevel <= 0) {
			if (this.overlay < 1) {
				this.overlay += .01;
				this.overlay = Math.min(1, this.overlay);
				if (this.overlay >= 1) {
					game = null; //Restart from the menu
				}
			}
		}
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
