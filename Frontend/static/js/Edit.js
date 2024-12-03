import { undo } from "./Tools.js";
// const undo = new undoLog();

document.addEventListener("keydown", (e) => {
	if (e.ctrlKey && e.key === "z") {
		undo.undo();
	}

	if (e.key === "F4") {
		e.preventDefault();
		undo.redo();
	}
});
document.addEventListener("htmx:afterSwap", () => {
	const undo_button = document.getElementById("Undo");
	const repeat_button = document.getElementById("Repeat");
	undo_button.addEventListener("click", () => undo.undo());
	repeat_button.addEventListener("click", () => undo.redo());
});
