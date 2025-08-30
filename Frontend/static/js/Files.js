
document.body.addEventListener('htmx:afterSwap', (e) => {

  const save_file = document.getElementById("Save_file");
  save_file.addEventListener('click', () => {
    const canvas = document.getElementById("canvas");
    let url = canvas.toDataURL("image/png", 1.0);

    download(url, "my_canvas.png");

  });


  function download(data, filename = "Untitled.png") {
    let a = document.createElement('a');
    a.href = data;
    a.download = filename;
    a.click();
  }
});
