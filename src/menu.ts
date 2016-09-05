/// <reference path="main.ts" />
/// <reference path="game.ts" />


class Menu extends Display {
	width = canvas.width;
	height = canvas.height;
	titleImg = <HTMLImageElement>document.getElementById("title");
	playImage = <HTMLImageElement>document.getElementById("play");
	titleWidth = this.titleImg.width;
	titleHeight = this.titleImg.height;

	draw() {
		if (!game) {
			ctx.fillStyle = "black";
			ctx.fillRect(0,0, this.width, this.height);
			ctx.drawImage(this.titleImg, (this.width ) / 2 - 150, 150);
			ctx.drawImage(this.playImage, (this.width ) / 2 - 100, 300);
		}
	}

	keyPress(key) {
		if (!game) {
			game = new Game();
		}
	}
}

