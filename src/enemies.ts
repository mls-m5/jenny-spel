
/// <reference path="main.ts" />
/// <reference path="player.ts" />




class Tyranosaurus {
	x = -400;
	y = 0;
	angular = 0;
	img1  = <HTMLImageElement>document.getElementById("dino");
	img2  = <HTMLImageElement>document.getElementById("dino-bite");
	img = this.img1;
	hide = true;

	width = 400;
	height = 400;

	biteToggle = false;
	biteTime = 0;


	draw() {
		if (this.biteToggle) {
			this.img = this.img2;
		}
		else {
			this.img = this.img1;
		}

		let angle = Math.sin(this.angular)/ 4;
		if (game.player.x < 300) {
			let angle2 = Math.atan2(this.x - game.player.x, this.y + this.height / 2- game.player.y) + Math.PI * .6;
			let amount = (game.player.x - 250) / 50;
			if (amount < 0) {
				amount = 0;
			}

			angle = angle * amount + angle2 * (1 - amount);
		}

		ctx.save();

		ctx.translate(this.x + 100, Math.cos(this.angular) * 20 -this.y + game.height - this.height * .4 + Math.random() * 10);
		ctx.rotate(angle);

		ctx.drawImage(this.img, -this.width / 2, -this.height / 2, this.width, this.height);

		ctx.restore();
	}

	step() {
		this.angular += .5;
		if (this.hide) {
			if (this.x > -400) {
				this.x -= game.scrollSpeed;
			}
		}
		else {
			if (this.x < 0) {
				this.x += 10;
			}

			if (game.player.x - this.x < 300) {
				if (++this.biteTime > 4) {
					this.biteTime = 0;
					sounds.playsound("snap");
				}
				this.biteToggle = this.biteTime > 2;
				if (game.player.damage()) {
				}
			}
			else {
				this.biteToggle = false;
			}
		}
	}
}

class Liaoningopterus extends Unit {
	img  = <HTMLImageElement>document.getElementById("flygdino");
	size = 200;
	angleChange = 1;


	constructor(public x: number, public y: number, public angle) {
		super();
	}

	step() {
		this.x -= Math.sin(this.angle) * 10;
		this.y -= Math.cos(this.angle) * 10;
		this.angleChange /= 1.01;
		this.angle += .01 * this.angleChange;
		if (this.y < -this.size || this.x < -this.size) {
			this.alive = false;
		}

		if (game.player.isHit(this.x, this.y)) {
			if (game.player.damage()) {
				this.alive = false;
				sounds.playsound("punch");
			}
		}
	}

	draw() {
		ctx.save();
		ctx.translate(this.x, game.height - this.y);
		ctx.rotate(this.angle);
		ctx.drawImage(this.img, -this.size * .8, -this.size * .9, this.size, this.size);

		// ctx.fillRect(-10, -10, 20, 20); //Finding the location of the beek
		ctx.restore();
	}
}

class Meteor extends Unit {
	img  = <HTMLImageElement>document.getElementById("meteor");
	img2  = <HTMLImageElement>document.getElementById("meteor_tail");
	size = 50;
	nextSmoke = 0;
	tailAngle = 0;
	stoneAngle = 0;
	stoneAngleVelocity = 0;
	vy: number;

	constructor(public x: number, public y: number, public vx: number) {
		super();
		this.vy = -10;
		this.tailAngle = Math.atan2(this.vx, this.vy) + Math.PI;
		this.stoneAngleVelocity = Math.random() - .5;
	}

	destroy() {
		this.alive = false;
		let s = new Smoke(this.x + Math.random() * 10 - 5, this.y + Math.random() * 10 - 5)
		s.size *= 3;
		game.push(s);
	}

	step() {
		if (--this.nextSmoke <= 0) {
			this.nextSmoke = 3 + Math.random() * 2;
			game.pushFront(new Smoke(this.x + Math.random() * 10 - 5, this.y + Math.random() * 10 - 5));
		}

		if (this.y < 0) {
			this.destroy();
		}

		if (game.player.isHit(this.x, this.y)) {
			if (game.player.damage()) {
				this.destroy();
				sounds.playsound("punch");
			}
		}

		this.x += this.vx;
		this.y += this.vy;
		this.stoneAngle += this.stoneAngleVelocity;
	}

	draw() {
		ctx.save();
		ctx.translate(this.x, game.height - this.y);
		ctx.save();
		ctx.rotate(this.tailAngle);
		ctx.drawImage(this.img2, -this.size, -this.size * 1.5, this.size * 2, this.size * 2);
		ctx.restore();
		ctx.rotate(this.stoneAngle);
		ctx.drawImage(this.img, -this.size / 2, -this.size/2, this.size, this.size);
		ctx.restore();
	}
}

class Lava {
	img  = <HTMLImageElement>document.getElementById("lava");
	x = 0;
	y = -50;
	width = 200;
	height = 50;
	nextSmoke = 0;
	hide = true;
	step() {
		if (!this.hide) {
			if (this.y < 50) {
				this.y += .5;
			}
			if (--this.nextSmoke < 0) {
				this.nextSmoke = 20;
				game.push(new Smoke(Math.random() * game.width, 40));
			}
		}
		else {
			if (this.y > -50) {
				this.y -= .5;
			}
		}
		this.x -= game.scrollSpeed;
		if (this.x < -this.width) {
			this.x += this.width;
		}

		if (game.player.y < this.y - 20) {
			if (game.player.damage()) {
				sounds.playsound("hish");
			}
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
