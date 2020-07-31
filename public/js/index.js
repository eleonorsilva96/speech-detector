const username = document.getElementById('username-toggle');

const selectBox = document.getElementById('perfil');
selectBox.onchange = function () {
  const selectedValue = selectBox.options[selectBox.selectedIndex].value;
  console.log(selectedValue);

  if (selectedValue === "1") {
    username.style.display = 'none';
  } else {
    username.style.display = 'block';
  }
}

