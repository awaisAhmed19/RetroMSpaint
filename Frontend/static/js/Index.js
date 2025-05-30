import { DOM } from "./DOM.js";
window.addEventListener("load", () => {
  defaultFootNote();
  DOM.canvasContainer.style.width = "900px";
  DOM.canvasContainer.style.height = "500px";
});

//to prevent zooming of the browser window
document.onkeydown = function (e) {
  if ((e.ctrlKey && e.key === "+") || (e.ctrlKey && e.key === "-")) {
    e.preventDefault();
  }
};
//list of footnote messages
const footNoteMessageList = {
  polygonlasso: "Selects a free-form of the picture to move, copy, or edit.",
  rectlasso: "Selects a rectanglar part of the picture to move, copy or edit.",
  eraser: "Erases a portion of the picture, using the selected eraser shape.",
  fill: "Fills an area with the selected drawing color",
  eyedrop: "Picks up a color from the picture for drawing",
  zoom: "Changes the magnification",
  pencil: "Draws a free-form one pixel wide",
  brush: "Draws using a brush with the selected shape and size",
  airbrush: "Draws using an airbrush of the selected size",
  text: "Inserts text into the picture",
  line: "Draws a straight line with the selected line width",
  curveline: "Draws a curved line with the selected line width",
  rectshape: "Draws a rectangle with the selected fill style",
  polygonshape: "Draws a polygon with the selected fill style",
  elipse: "Draws an ellipse with the selected fill style",
  rectelipse: "Draws a rounded rectangle with the selected fill style",
  New_file: "Creates a new document.",
  Open_file: "Opens a existing document",
  Save_file: "Saves the active document",
  Saveas_file: "Saves the active document with a new name",
  Load_from_URL: "Opens an image from Web",
  Upload_to_Imgur: "Uploads the active document on imgur",
  Manage_storage: "Manage storage of previously created or open document",
  Set_as_WallpaperT: "Tiles this bitmap on the desktop backgorund",
  Set_as_WallpaperC: "Center this bitmap on the desktop backgorund",
  Recent_files: "List recent files",
  Exit: "Quits Paint.",
  Undo: "Undos last action",
  Repeat: "Repeats last undo action",
  History: "Shows you the history which you cannot access with undo and redo ",
  Cut: "Cuts the selection and puts on clipboard",
  Copy: "Copy the selection and puts on clipboard",
  Paste: "Inserts the content of the clipboard",
  Clear_Selection: "Deletes the selections",
  Select_All: "Selects everything",
  Copy_To: "Copies the selection to a file",
  Paste_from: "Pastes a file into the selection",
  Tool_Box: "shows or hides the tool bar",
  Color_Box: "shows or hides the color bar",
  Status_Bar: "shows or hides the status bar",
  Text_Toolbar: "shows or hides the text toolbar",
  Zoom: "zooming with options.",
  View_Bitmap: "Displays the entire picture",
  FullScreen: "Makes the application full screen",
  Properties: "Shows properties",
  Visible: "Makes the layer visible",
  Lock_Layers: "Locks the layer",
  Open_Group: "Opens a group of layers",
  New_Layer: "Makes a new Layer",
  Delete_Layer: "Deletes a Layer",
  Convert_To: "Converts to a different image format",
  Duplicate: "Duplicates a layer",
  Merge_Down: "Merges the top layer with layer below",
  Flatten: "Flattens the image",
  Flatten_Layer: "Flattens the layers",
  Flip_Rotate: "Flips or Rotates a picture or a selection",
  Stretch_Skew: "Stretch or skews a picture or a selection",
  Invert_Color: "Inverts the color a picture or a selection",
  Attributes: "Changes the attributes of a picture",
  Clear_Image: "Clears the canvas",
  Draw_Opaque: "Makes the current selection either opaque or transparent",
  Edit_Colors: "Creates a new color",
  Get_Colors: "Uses a previously saved pallete of colors",
  Save_Colors: "saves the current pallete of colors to a file",
};

//Footnotes update
DOM.elementFootNotesclasses.forEach((note) => {
  note.addEventListener("mouseenter", handleToolFootNote);
  note.addEventListener("mouseleave", defaultFootNote);
});

function handleToolFootNote(event) {
  let elementID = event.target.id;
  if (footNoteMessageList.hasOwnProperty(elementID)) {
    DOM.footNote.textContent = footNoteMessageList[elementID];
  }
}

function defaultFootNote() {
  return (DOM.footNote.textContent =
    "For Help, click Help Topics on the Help Menu");
}

//TODO: toggling the menu dropdown
document.addEventListener("DOMContentLoaded", function () {
  let dropdownVisible = false;
  let currentDropdownId = null;

  const toggleDropdown = (dropdownId) => {
    if (dropdownVisible && currentDropdownId === dropdownId) {
      DOM.dropdownContainer.classList.remove("active");
      dropdownVisible = false;
    } else {
      DOM.dropdownContainer.classList.add("active");
      dropdownVisible = true;
      currentDropdownId = dropdownId;
    }
  };

  DOM.menubar.forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      const dropdownId = btn.getAttribute("data-dropdown-id");
      toggleDropdown(dropdownId);
    });
  });

  document.addEventListener("click", function (e) {
    const dropdownContainer = document.getElementById("dropdowncontainer");
    const clickedInside = Array.from(DOM.menubar).some((btn) =>
      btn.contains(e.target),
    );

    if (
      dropdownVisible &&
      !dropdownContainer.contains(e.target) &&
      !clickedInside
    ) {
      dropdownContainer.classList.remove("active");
      dropdownVisible = false;
    }
  });
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeDropdownMenu();
  }
});
