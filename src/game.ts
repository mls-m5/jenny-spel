
class Game {
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

	level = -1;
	currentLevel: Level;
	leftOnLevel: number;
	house: House;
	overlay = 1.;

	constructor() {
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

		for (let u of this.units) {
			u.step();
		}

		//Remove dead objects
		this.units = this.units.filter(function(u) {return u.alive});
	}

	draw() {
		ctx.clearRect(0, 0, this.width, this.height);

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

		if (this.overlay) {
			ctx.globalAlpha = this.overlay;
			ctx.fillStyle = "black";

			ctx.fillRect(0, 0, this.width, this.height);

			ctx.globalAlpha = 1;

		}
	}

	finishLevel() {
		if (this.currentLevel && this.currentLevel.lastLevel) {
			return;
		}
		++this.level;
		this.currentLevel = levels[this.level];
		this.dino.hide = ! this.currentLevel.tyranosaurus;
		this.nextMeteor = 100; //Delay when the next meteor is comming
		this.nextDino = 100;
		this.leftOnLevel = this.currentLevel.length;
		this.scrollSpeed = this.currentLevel.scrollSpeed;
		this.lava.hide = !this.currentLevel.lava;
		if (this.currentLevel.house) {
			this.house = new House(this.width * 2);
		}
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

		--this.leftOnLevel;
		if (this.leftOnLevel < 0) {
			this.finishLevel();
		}

		if (!this.currentLevel.lastLevel) {
			if (this.overlay > 0) {
				this.overlay -= .01;
				this.overlay = Math.max(0, this.overlay);
			}
		}
		else if (this.leftOnLevel <= 0) {
			if (this.overlay < 1) {
				this.overlay += .01;
				this.overlay = Math.min(1, this.overlay);
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
