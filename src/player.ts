/// <reference path="main.ts" />


class Player {
	x = 300;
	y = 0;
	vy = 0;
	pillis  = <HTMLImageElement>document.getElementById("pillis");
	width = 100;
	height = 100;
	hitWidth = this.width * .7;
	hitHeight = this.height *.7;
	lastDir = 0;
	onGround = false;
	invincible = 0;
	visible = true;

	draw() {
		if (this.invincible > 0) {
			this.visible = !this.visible;
		}
		else {
			this.visible = true;
		}

		if (!this.visible) {
			return;
		}
		ctx.save();

		ctx.translate(this.x, -this.y + game.height - this.height / 2);
		if (this.onGround) {
			ctx.rotate(Math.random() / 4);
		}

		ctx.drawImage(this.pillis, -this.width / 2, -this.height / 2, this.width, this.height);

		ctx.restore();
	}

	isHit(x: number, y: number) {
		if (x > this.x - this.hitWidth / 2 && x < this.x + this.hitWidth / 2) {
			if (y > this.y && y < this.y + this.hitHeight) {
				return true;
			}
		}
		return false;
	}

	damage() {
		if (this.invincible > 0) {
			return false;
		}
		game.push(new Blood(this.x, this.y));

		this.invincible = 50;

		sounds.playsound("ouch");
		sounds.playsound("splash");
		return true;
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
		if (this.x > game.width) {
			this.x = game.width;
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
		if (this.invincible > 0) {
			--this.invincible;
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