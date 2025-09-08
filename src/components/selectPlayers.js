const formRed = document.getElementById('form-red');
const formBlue = document.getElementById('form-blue');
const formGreen = document.getElementById('form-green');
const formYellow = document.getElementById('form-yellow');

function loadForm(elementForm) {
    fetch('/src/pages/formUser.html')
        .then(response => response.text())
        .then(html => {
            elementForm.innerHTML = html;
        });
};
function basicLoadForm(){
    loadForm(formRed);
    loadForm(formBlue);
};
//Esperamos a que todo el contenido del DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM completamente cargado y analizado');
    basicLoadForm();
    let countGreen = 0;
    let countYellow = 0;
    formGreen.addEventListener('click', () => {
        if (countGreen < 1) {
            loadForm(formGreen);
            countGreen++;
        }

    });
    formYellow.addEventListener('click', () => {
        if (countYellow < 1) {
            loadForm(formYellow);
            countYellow++;
        }

    });
});


