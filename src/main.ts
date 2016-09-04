/// <reference path="jquery.d.ts" />


var canvas = <HTMLCanvasElement>document.getElementById("canvas");

var ctx = <CanvasRenderingContext2D>canvas.getContext("2d");

var keyCodes = Object.freeze({
	left: 37,
	right: 39,
	space: 32
});


class Player {
	x = 300;
	y = 0;
	vy = 0;
	pillis  = <HTMLImageElement>document.getElementById("pillis");
	width = 100;
	height = 100;
	lastDir = 0;
	onGround = false;

	draw() {
		ctx.save();

		ctx.translate(this.x, -this.y + game.height - this.height / 2);
		if (this.onGround) {
			ctx.rotate(Math.random() / 4);
		}

		ctx.drawImage(this.pillis, -this.width / 2, -this.height / 2, this.width, this.height);

		ctx.restore();
	}

	step() {
		this.onGround = false;
		this.x -= 1;
		if (this.x > 0) {
			this.x += 10 * this.lastDir;
		}
		if (this.x < 200) {
			this.x = 200;
		}

		this.y += this.vy;
		this.vy -= 4;

		if (this.y <= 0) {
			this.y = 0;
			this.onGround = true;
			if (this.vy < 0) {
				this.vy = 0;
			}
		}

		let v = game.findVertical(this.x, this.y);
		if (v !== null) {
			this.y += v;
			if (this.vy < 0) {
				this.vy = 0;
			}
			this.onGround = true;
		}
	}

	jump() {
		this.vy = 40;
	}

	keyPress(key: number) {
		console.log(key);
		if (key == keyCodes.left || key == keyCodes.right) {
			let dir: number;
			if (key == keyCodes.left) {
				dir = -1;
			}
			else {
				dir = 1;
			}
			this.lastDir = dir;
		}

		if (key == keyCodes.space) {
			if (this.onGround) {
				this.jump();
			}
		}
	}

	keyup(key: number) {
		if (key == keyCodes.left) {
			if (this.lastDir == -1) {
				this.lastDir = 0;
			}
		}
		else if (key == keyCodes.right) {
			if (this.lastDir == 1) {
				this.lastDir = 0;
			}
		}
	}

}

class Tyranosaurus {
	x = -400;
	y = 100;
	angular = 0;
	wait = 100;
	img  = <HTMLImageElement>document.getElementById("dino");

	width = 400;
	height = 400;
	draw() {

		ctx.save();

		ctx.translate(this.x + 100, this.y + 200 + Math.random() * 10);
		ctx.rotate(Math.sin(this.angular)/ 4);

		ctx.drawImage(this.img, -this.width / 2, -this.height / 2, this.width, this.height);

		ctx.restore();
	}

	step() {
		this.angular += .5;
		if (this.wait > 0) {
			this.wait -= 1;
		}
		else {
			if (this.x < 0) {
				this.x += 10;
			}
		}

	}
}

class Ground {
	img  = <HTMLImageElement>document.getElementById("ground1");
	imgWidth = this.img.width;
	imgHeight = this.img.height;

	constructor(public x: number, public y: number) {

	}
	width = 200;
	height = 50;
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
		this.x -= 5;
	}

}


class Game {
	width = canvas.width;
	height = canvas.height;
	player = new Player();
	dino = new Tyranosaurus();
	ground: Ground[] = [];

	constructor() {
		for (let i = 0; i < 30; ++i) {
			this.ground.push(new Ground(i * 300, Math.random() * 200));
		}
	}

	draw() {
		ctx.clearRect(0, 0, this.width, this.height);
		this.player.draw();
		for (let g of this.ground) {
			g.draw();
		}
		this.dino.draw();
	}

	step() {
		for (let g of this.ground) {
			g.step();
		}
		this.player.step();
		this.dino.step();
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

$(document).ready(function() {
	game = new Game();

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

