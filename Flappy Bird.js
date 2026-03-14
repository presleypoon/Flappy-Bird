let JumpBtn = false;
let Gravity = 1;
let ResetBtn = true;
let Mouse = false;
let LastResetBtn = false;

let LevelPxIndex = 0;
let Level = [];

let PlayerY = 450;
let SpeedY = 0;

let PipeX = 0;
let PipeHeightTop = 0;

let Gap = 250

let Px = 0;
let r = false;
let g = false;
let b = false;
let a = false;

let CanScore = true;

let Score = 0;
let Curse = false;
let Hitbox = false;
let Invincible = false;
let AutoPilot = false;
let EndY = 0;
let TempSpeedY = 0;
let FirstPipeX = 0;
let StatusMessage = "";

const BirdSize = 30;
const JumpForce = 10;

const LevelSpaceBtwn2Columns = 500;
const UnitWidth = 50 + LevelSpaceBtwn2Columns;

const PlayerX = 115;


const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });
const CanvasWidth = canvas.width;
const CanvasHeight = canvas.height;

EventListeners();
GameLoop();

function EventListeners() {
	addEventListener('keydown', (event) => {
		if (event.code === "Space" && !AutoPilot) {
			JumpBtn = true;
		}
		if (event.code === "KeyR") {
			ResetBtn = true;
		}
		if (event.code === "KeyS") {
			ResetBtn = false;
		}
		if (event.code === "KeyH") {
			Hitbox = !Hitbox;
			StatusMessage = "Toggled hitbox.";
		}
		if (event.code === "KeyA") {
			AutoPilot = !AutoPilot;
		}
	});
	addEventListener('keyup', (event) => {
		if (event.code === "Space" && !AutoPilot) {
			JumpBtn = false;
		}
	});
	if (!AutoPilot) {
		addEventListener('mousedown', function (event) {
			Mouse = true;
		});

		addEventListener('mouseup', function (event) {
			Mouse = false;
		});
	}
}

function GameLoop() {
	if (ResetBtn && !LastResetBtn) {
		Reset();
	}
	if (!ResetBtn && LastResetBtn) {
		Death();
	}
	LastResetBtn = ResetBtn;
	if (ResetBtn) {
		GameTick();
	}
	Render();
	requestAnimationFrame(GameLoop);
}

function Reset() {
	PlayerY = 450; SpeedY = 0; ResetBtn = true; LastResetBtn = false; Level = []; LevelPxIndex = 50; Score = 0; CanScore = true; LevelSpeed = 1;
	for (let i = 0; i < (30 + 1500 / LevelSpaceBtwn2Columns); i++) {
		Level.push(randomNumber(0, 600 - Gap));
	}
	StatusMessage = "Reseted"
}

function Death() {
	if (Score > GetBestScore()) {
		localStorage.setItem("BestScore", Score);
	}
	if (AutoPilot) {
		setTimeout(() => {
			ResetBtn = true;
		}, 1000);
	}
	StatusMessage = "Game Over! Press R to restart."
}

function GameTick() {
	if (AutoPilot) {
		AutoPilotCalculation();
	}
	MoveY();
	Movement();
}

function AutoPilotCalculation() {
	FirstPipeX = (0 * UnitWidth - LevelPxIndex) - PlayerX;
	if (550 - Level[(FirstPipeX + 50 < PlayerX) ? 1 : 0] - Gap * 0.75 > PlayerY) {
		SpeedY = 15;
	}
}

function MoveY() {
	SpeedY += JumpForce * (JumpBtn || Mouse) - Gravity;
	if (SpeedY < -15) {
		SpeedY = -15;
	}
	if (SpeedY > 15) {
		SpeedY = 15;
	}
}

function Movement() {
	LevelPxIndex += LevelSpeed;
	if (LevelPxIndex >= LevelSpaceBtwn2Columns + 50) {
		LevelPxIndex %= LevelSpaceBtwn2Columns + 50;
		Level.shift();
		Level.push(randomNumber(0, 600 - Gap));
		CanScore = true;
	}
	PlayerY += SpeedY;
}

function Render() {
	if (!Curse) {
		ctx.clearRect(0, 0, CanvasWidth, CanvasHeight);
	}
	LevelRender();
	AngleCalculation();
	CheckForDeath();
	PlayerRender();
	UpdateScore();
}

function LevelRender() {
	ctx.fillStyle = '#008000';
	for (let i = 0; i < Level.length; i++) {
		PipeX = i * UnitWidth - LevelPxIndex;
		PipeHeightTop = Level[i] + 50;
		ctx.fillRect(PipeX, 0, 50, PipeHeightTop);
		ctx.fillRect(PipeX, PipeHeightTop + Gap, 50, CanvasHeight);
	}
}

function AngleCalculation() {
	Angle = Math.atan2(Math.abs(SpeedY), LevelSpeed * 10) * Math.sign(SpeedY) / -2;
	HitboxMarginSize = BirdSize / (Math.cos(Math.abs(Angle)) + Math.sin(Math.abs(Angle)));
}

function CheckForDeath() {
	if (Invincible) return
	if (PlayerY < 0 || PlayerY > 620) {
		ResetBtn = false;
	}
	if (CheckForPipe(100 + HitboxMarginSize, 620 - PlayerY + HitboxMarginSize) || CheckForPipe(130 - HitboxMarginSize, 620 - PlayerY + HitboxMarginSize) || CheckForPipe(100 + HitboxMarginSize, 650 - PlayerY - HitboxMarginSize) || CheckForPipe(130 - HitboxMarginSize, 650 - PlayerY - HitboxMarginSize)) {
		ResetBtn = false;
	}
}

function CheckForPipe(x, y) {
	if (x < 0 || x >= CanvasWidth || y < 0 || y >= CanvasHeight) return false;
	Px = ctx.getImageData(x, y, 1, 1);
	r = Px.data[0] < 245;
	g = Px.data[1] < 245;
	b = Px.data[2] < 245;
	a = Px.data[3] > 10;
	if (!a) return false;
	return ((r && g && b));
}

function PlayerRender() {
	ctx.save();
	ctx.translate(PlayerX, 635 - PlayerY);
	ctx.rotate(Angle);
	ctx.fillStyle = '#000000';
	ctx.fillRect(-BirdSize / 2, -BirdSize / 2, BirdSize, BirdSize);
	ctx.restore();
	if (Hitbox) {
		ctx.fillStyle = '#ff0000';
		ctx.fillRect(100 + HitboxMarginSize, 620 - PlayerY + HitboxMarginSize, 30 - HitboxMarginSize * 2, 30 - HitboxMarginSize * 2);
	}
}

function UpdateScore() {
	if (CanScore && LevelPxIndex > 450) {
		Score += 10;
		CanScore = false;
		LevelSpeed++;
	}
}

function randomNumber(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function GetBestScore() {
	const raw = localStorage.getItem("BestScore");
	const num = parseInt(raw, 10);
	return Number.isFinite(num) ? num : 0;
}
