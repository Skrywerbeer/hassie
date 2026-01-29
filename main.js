const MATHML_NS = "http://www.w3.org/1998/Math/MathML";
const KEY_COUNT = 9;
const LOWER_LIMIT = -9;
const UPPER_LIMIT = 9;
// ----------------------------------------
// State variables.
let GAME_ROOTS = [];
let ROOTS_FOUND = 0;
let GAMES_WON = 0;
let SECONDS = 0;
let MINUTES = 0;
let CLOCK_ID = 0;
let GAME_STARTED = false;
// ----------------------------------------

function startClock() {
	CLOCK_ID = setInterval(incrementTime, 1000);
}

function stopClock() {
	if (CLOCK_ID)
		clearInterval(CLOCK_ID);
	CLOCK_ID = 0;
}

function logicInit() {
	keysInit();
	document.getElementById("startBtn").addEventListener("click", () => {
		if (!GAME_STARTED) {
			startGame();
			GAME_STARTED = true;
		}
	});
	document.getElementById("pauseBtn").addEventListener("click", () => {
		if (GAME_STARTED) {
			pauseGame();
			GAME_STARTED = false;
		}

	});
	newGame();
}

function newGame() {
	GAME_ROOTS = generateRoots(LOWER_LIMIT, UPPER_LIMIT);
	refreshDisplay(GAME_ROOTS);
	refreshKeys(GAME_ROOTS);
	ROOTS_FOUND = 0;
}

function showPauseWindow() {
	const pauseWindow = document.getElementById("pauseWindow")
	pauseWindow.style.visibility = "visible";
	pauseWindow.animate(
		[
			{opacity: 0},
			{opacity: 1}
		],
		{duration: 500, fill: "forwards"}
	);
}

function hidePauseWindow() {
	const pauseWindow = document.getElementById("pauseWindow")
	pauseWindow.animate(
		[
			{opacity: 1},
			{opacity: 0}
		],
		{duration: 500, fill: "forwards"}
	);
		setTimeout(() => {pauseWindow.style.visibility = "hidden"}, 500);
}

function startGame() {
	startClock();
	hidePauseWindow();
}

function pauseGame() {
	stopClock();
	showPauseWindow();
}

function resetGame() {
	ROOTS_FOUND = 0;
	GAMES_WON = 0;
	SECONDS = 0;
	MINUTES = 0;
}

function gameWon() {
	GAMES_WON++;
	const solvedOutput = document.getElementById("solvedOutput");
	solvedOutput.textContent = GAMES_WON;
}

function updateClockOutput() {
	const output = document.getElementById("timeOutput");
	output.textContent = (MINUTES < 10 ? "0" + MINUTES : MINUTES) +
		":" +
		(SECONDS < 10 ? "0" + SECONDS : SECONDS);
}

function incrementTime() {
	if (SECONDS < 59) {
		SECONDS++;
	}
	else {
		SECONDS = 0;
		MINUTES++;
	}
	updateClockOutput();
}

function keysInit() {
	const keys = document.querySelectorAll("button.key");
	for (const key of keys) {
	key.addEventListener("click", function() {
		if (!key.classList.contains("selected")) {
			key.classList.add("selected");
			if (key.classList.contains("correct")) {
				ROOTS_FOUND++;
				if (ROOTS_FOUND == GAME_ROOTS.length) {
					// TODO: new game.
					const frames = [
						{backgroundColor: "transparent"},
						{backgroundColor: "black"},
						{backgroundColor: "transparent"}
					];
					document.getElementById("whiteout").animate(frames, 1000);
					setTimeout(() => {
						gameWon();
						newGame();
					}, 500);
				}
			}
		}
	});
	}
}

function genRandInt(min, max) {
	if (min > max)
		throw new Error("Error: min > max in call to genRandInt");
	const delta = max - min;
	const ret = min + Math.round(Math.random()*delta);
	if (isNaN(ret))
		console.log("generated NaN with min: " + min + " max: " + max);
	return ret;
}

function generateRoots(min, max) {
	if (min <= max) {
		const firstRoot = genRandInt(min, max);
		const secondRoot = genRandInt(min, max);
		if (firstRoot == secondRoot)
			return [firstRoot];
		else
			return [firstRoot, secondRoot];

	}
	else {
		throw new Error("Error: passed min > max to generateRoots()")
	}
}

function setKeyContent(btn, content) {
	btn.querySelector("math mn").textContent = content;
}

function setKeyCorrect(btn) {
	if (!btn.classList.contains("correct"))
		btn.classList.add("correct");
	else
		throw new Error("Button already marked correct.");
}

function refreshDisplay(roots) {
	const problem = document.getElementById("problem");
	problem.removeChild(problem.querySelector("mrow"));
	const mrow = document.createElementNS(MATHML_NS, "mrow");
	// TODO: generate  coefficient for quadratic term.
	const quadSup = document.createElementNS(MATHML_NS, "msup");
	const quadVar = document.createElementNS(MATHML_NS, "mi");
	quadVar.textContent = "x";
	const quadExp = document.createElementNS(MATHML_NS, "mn");
	quadExp.textContent = "2";
	quadSup.appendChild(quadVar);
	quadSup.appendChild(quadExp);
	mrow.appendChild(quadSup);
	const linearValue = roots.length == 2 ?
		  -1*(roots[0] + roots[1]):
		  -1*(roots[0] + roots[0]);
	if (linearValue != 0) {
		const linearOp = document.createElementNS(MATHML_NS, "mo");
		linearOp.textContent = linearValue < 0 ? "-" : "+";
		mrow.appendChild(linearOp)
		if (Math.abs(linearValue) != 1) {
			const linearCoeff = document.createElementNS(MATHML_NS, "mn");
			linearCoeff.textContent = Math.abs(linearValue);
			mrow.appendChild(linearCoeff);
		}
		const linearVar = document.createElementNS(MATHML_NS, "mi");
		linearVar.textContent = "x";
		mrow.appendChild(linearVar);
	}
	const constValue = roots.length == 2 ?
		  roots[0]*roots[1] :
		  roots[0]*roots[0];
	if (constValue != 0) {
		const constantOp = document.createElementNS(MATHML_NS, "mo")
		constantOp.textContent = constValue < 0 ? "-" : "+";
		mrow.appendChild(constantOp);
		const constantCoeff = document.createElementNS(MATHML_NS, "mn");
		constantCoeff.textContent = Math.abs(constValue);
		mrow.appendChild(constantCoeff);
	}
	const equalSign = document.createElementNS(MATHML_NS, "mo");
	equalSign.textContent = "=";
	mrow.appendChild(equalSign);
	const zero = document.createElementNS(MATHML_NS, "mn");
	zero.textContent = "0";
	mrow.appendChild(zero);
	problem.appendChild(mrow);

}

function clearSelectedKeys() {
	const keys = document.querySelectorAll("button.key.selected");
	if (keys === undefined)
		return;
	for (const key of keys) {
		key.classList.remove("selected");
	}
}

function clearCorrectKeys() {
	const keys = document.querySelectorAll("button.key.correct");
	if (keys === undefined)
		return;
	for (const key of keys)
		key.classList.remove("correct");
}

function randomizeKeys(roots) {
	const keys = document.querySelectorAll("button.key");
	let valuesUsed = [];
	for (let i = 0; i < keys.length; i++) {
		let newInt = genRandInt(LOWER_LIMIT, UPPER_LIMIT);
		while ((roots.indexOf(newInt) !== -1) ||
			   (valuesUsed.indexOf(newInt) !== -1)) {
			newInt = genRandInt(LOWER_LIMIT, UPPER_LIMIT);
		}
		valuesUsed.push(newInt);
		setKeyContent(keys[i], newInt);
	}
}

function insertRootsToKeys(roots) {
	const keys = document.querySelectorAll("button.key");
	let indicesUsed = [];
	for (const root of roots) {
		let index = genRandInt(0, keys.length - 1);
		while (indicesUsed.indexOf(index) != -1) {
			index = genRandInt(0, keys.length - 1);
			console.log("regenerating index!'");
		}
		indicesUsed.push(index);
		setKeyContent(keys[index], root);
		setKeyCorrect(keys[index]);
	}
}

function refreshKeys(roots) {
	clearSelectedKeys();
	clearCorrectKeys();
	randomizeKeys(roots);
	insertRootsToKeys(roots);
}
