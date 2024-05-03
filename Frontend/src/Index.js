const menubtn = document.querySelectorAll(".menubar-btn");
const dropdown = document.querySelectorAll(".dropdown");


function closeDropdownMenu() {
  dropdown.forEach((drop) => {
    drop.classList.remove("active");
    drop.addEventListener("click", (e) => e.stopPropagation());
  });
}


menubtn.forEach((btn) => {
  btn.addEventListener("click", function (e) {
    const dropdownIndex = e.currentTarget.dataset.dropdown;
    const dropdownElement = document.getElementById(dropdownIndex);
    
    dropdownElement.classList.toggle("active");
    dropdown.forEach((drop) => {
      if (drop.id !== dropdownIndex) {
        drop.classList.remove("active");
      }
    });
    e.stopPropagation();
  });
});

//links.forEach((link) =>
 // link.addEventListener("click", () => {
 //   closeDropdownMenu();
 //   setAriaExpandedFalse();
 //   toggleHamburger();
 // })
//);

document.documentElement.addEventListener("click", () => {
  closeDropdownMenu();
});
//close dropdown when escape is pressed
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeDropdownMenu();
    console.log("pressed");
  }
});