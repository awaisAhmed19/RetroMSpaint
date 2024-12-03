/**
 * @type HTMLCanvasElement
 */
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

export class undoLog {
	constructor() {
		this.index = 0;
		this.tool = "";
		this.undolog = [];
		this.MAX_STACK_LENGTH = 50;
		this.logging("intial");
	}

	// Add a new image to the undo log
	Slice_Push(imageObject) {
		if (this.index === this.undolog.length) {
			this.undolog.push(imageObject);
		} else {
			this.undolog = this.undolog.slice(0, this.index + 1);
			this.undolog.push(imageObject);
		}
		this.index = this.undolog.length - 1;
	}

	logging(tool = "") {
		canvas.toBlob((blob) => {
			const image = URL.createObjectURL(blob);
			this.Slice_Push(image);
		});

		if (this.undolog.length > this.MAX_STACK_LENGTH) {
			this.undolog.shift();
			if (this.index > 0) this.index--;
		}

		this.tool = tool;
		console.log("Tool used:", this.tool);
		console.log("Undo log:", this.undolog);
	}

	undo() {
		if (this.index >= 0 && this.index > -1) {
			this.index--;
			console.log("undo:", this.index);
			this.showLog(this.index);
		}
	}

	redo() {
		if (this.index < this.undolog.length - 1) {
			this.index++;
			console.log("redo:", this.index);
			this.showLog(this.index);
		}
	}

	showLog(index) {
		const imageUrl = this.undolog[index];
		if (imageUrl) {
			const imageData = new Image();
			imageData.onload = () => {
				ctx.clearRect(0, 0, canvas.width, canvas.height);
				ctx.drawImage(imageData, 0, 0);
			};
			imageData.src = imageUrl;
		} else {
			console.error("Invalid data URL at index:", index);
			console.log("Data URL at index", index, this.undolog[index]);
		}
	}
}
