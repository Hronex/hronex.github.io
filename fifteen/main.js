const Phaser = window.Phaser;

const Fifteen = {
	Game: function(game) {
		this.chips = null;
		Fifteen.null_cell = {x: 3, y: 3};
	},
	Win: function(game) {}
};

Fifteen.Win.prototype = {
	create: function () {
		let modal, winText, newGameText;

		modal = this.add.graphics(0, 0);
		modal.alpha = 0.5;
		modal.beginFill('#000');
		modal.drawRect(0, 0, this.world.width, this.world.height);

		winText = this.add.text(this.world.centerX, this.world.centerY, 'ПОБЕДА', { font: "bold 50px Arial", align: "center", fill: "#0F0", boundsAlignH: "center", boundsAlignV: "middle"});
		winText.anchor.setTo(0.5);
		winText.addColor('#FF0', 7);
		winText.addColor('#0F0', 8);
		winText.stroke = '#E40';
		winText.strokeThickness = 6;

		newGameText = this.add.text(this.world.centerX, this.world.centerY + 130, 'НОВАЯ ИГРА', { font: "bold 20px Arial", align: "center", fill: "#FFF", boundsAlignH: "center", boundsAlignV: "middle" });
		newGameText.anchor.setTo(0.5);
		newGameText.stroke = '#55F';
		newGameText.strokeThickness = 3;
		newGameText.inputEnabled = true;
		newGameText.input.useHandCursor = true;
		newGameText.events.onInputDown.addOnce(this.start, this);
		newGameText.events.onInputOver.add(this.over);
		newGameText.events.onInputOut.add(this.out);
	},
	over: function(item) { item.strokeThickness = 6; },
	out: function(item) { item.strokeThickness = 3; },
	start: function() { this.state.start('Game', false, false); }
}
Fifteen.Game.prototype = {
	create: function(){
		this.world.removeAll();
		this.create_chips();
		this.last_chip_index;

		for (var i = 0; i < 200; i++) {
			this.time.events.add(10 * i, () => {
				this.mix()
			});
		}
	},

	create_chips: function() {
		let graphics = this.game.add.graphics(0, 0);
		graphics.beginFill(0xBBBB00, 1);
		graphics.drawRect(0, 0, 96, 96);
		graphics.endFill();
		graphics.visible = false;
		let chip_texture = graphics.generateTexture();

		if (this.chips) this.chips.destroy();
		this.chips = this.game.add.group()
		let chip, text;

		for (let j = 0; j < 4; j++) {
			for (let i = 0; i < 4; i++) {
				if (i === 3 && j === 3) continue;
				chip = this.chips.create(4 + i * 96 + (i * 4), 4 + j * 96 + (j * 4), chip_texture);
				chip.addChild(graphics);
				chip.anchor.set(0);
				chip.cell = {x: i, y: j};
				chip.index = this.position_index(i, j);
				text = this.game.add.text(chip.width / 2, chip.height / 2 + 3, chip.index, { font: "bold 48px Arial" });
				text.anchor.set(0.5);
				chip.addChild(text);
				chip.inputEnabled = true;
				chip.input.useHandCursor = true;
				chip.events.onInputUp.add(this.move, this);
			}
		}
	},

	mix: function() {
		let x, y,
			nullX = Fifteen.null_cell.x,
			nullY = Fifteen.null_cell.y,
			hMove = Math.floor(Math.random() * 2) === 0,
			upLeft = Math.floor(Math.random() * 2) === 0;
		if (!hMove && !upLeft) { y = nullY; x = nullX - 1;}
		if (hMove && !upLeft)  { x = nullX; y = nullY + 1;}
		if (!hMove && upLeft)  { y = nullY; x = nullX + 1;}
		if (hMove && upLeft)   { x = nullX; y = nullY - 1;}
		if (0 <= x && x <= 3 && 0 <= y && y <= 3) {
			let chip = null;
			this.chips.forEachAlive(e => {
				if (!chip && e.cell.x === x && e.cell.y === y) chip = e;
			});
			if (this.last_chip_index !== chip.index) {
				this.move(chip, 1);
				this.last_chip_index = chip.index;
			}
		}
	},

	move: function(chip, fast){
		if (((chip.cell.x - 1 === Fifteen.null_cell.x || chip.cell.x + 1 === Fifteen.null_cell.x) && chip.cell.y === Fifteen.null_cell.y) || ((chip.cell.y - 1 === Fifteen.null_cell.y || chip.cell.y + 1 === Fifteen.null_cell.y) && chip.cell.x === Fifteen.null_cell.x)) {
			let tmp = chip.cell;
			chip.cell = Fifteen.null_cell;
			Fifteen.null_cell = tmp;
		}
		let x = 4 + chip.cell.x * 96 + (chip.cell.x * 4),
			y = 4 + chip.cell.y * 96 + (chip.cell.y * 4);
		if (fast === 1) chip.position = new Phaser.Point(x, y);
		else {
			let tween = this.game.add.tween(chip.position).to({ x: x, y: y }, 200, Phaser.Easing.Bounce.Out).start();
			tween.onComplete.addOnce(() => {
				let win = true;
				this.chips.forEachAlive(e => {
					if (win) win = e.index === this.position_index(e.cell.x, e.cell.y);
				});

				if (win) this.game.state.start('Win', false, false);
			});
		}
	},

	position_index: function(x, y) {
		return x + 1 + (y * 4);
	}
}

const config = {
	type: Phaser.AUTO,
	width: 404,
	height: 404,
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { y: 200 }
		}
	}
};
// const fifteen_game = new Phaser.Game(config);
const fifteen_game = new Phaser.Game(404, 404, Phaser.AUTO, 'main', null, false, true);
fifteen_game.state.add('Game', Fifteen.Game, true);
fifteen_game.state.add('Win', Fifteen.Win, false);
fifteen_game.state.start('Game', false, false);