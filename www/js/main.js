function showRules() {
    var rulesSection = document.getElementById("rulesSection");
    rulesSection.classList.toggle("content-visible");
}

function removeRules() {
    var rulesSection = document.getElementById("rulesSection");
    rulesSection.classList.remove("content-visible");
}

function showScores() {
    var rulesSection = document.getElementById("bestScoresSection");
    rulesSection.classList.toggle("content-visible");
}

function removeScores() {
    var rulesSection = document.getElementById("bestScoresSection");
    rulesSection.classList.remove("content-visible");
}

document.getElementById("rules").onclick = showRules

document.getElementById("rulesSection").onclick = removeRules

document.getElementById("bestScores").onclick = showScores

document.getElementById("bestScoresSection").onclick = removeScores

// function partieSolo() {
//     // var prompt = document.getElementById("customPrompt");
//     // prompt.hidden = false;
//     var jeu = document.getElementById("game");
//     jeu.hidden = false;
//     var menu = document.getElementById("menu");
//     menu.hidden = true;
// }

// document.getElementById("solo").onclick = partieSolo

function partieOnline() {
    var jeu = document.getElementById("game");
    jeu.hidden = false;
    var menu = document.getElementById("menu");
    menu.hidden = true;
}

document.getElementById("online").onclick = partieOnline

// function partieIA() {
//     var jeu = document.getElementById("game");
//     jeu.hidden = false;
//     var menu = document.getElementById("menu");
//     menu.hidden = true;
// }

// document.getElementById("ia").onclick = partieIA


function getMenu(event) {
    event.preventDefault();
    console.log("Ok");
    var co = document.getElementById("connexion");
    co.hidden = true;

    var menu = document.getElementById("menu");
    menu.hidden = false
}

document.getElementById("seConnecter").onclick = getMenu;

function homePage() {
    var svgElement = document.getElementById('grille');
    svgElement.innerHTML = '';

    var jeu = document.getElementById("game");
    jeu.hidden = true;

    const div = document.getElementById("endGame")
    div.hidden = true
    const message1 = document.getElementById("gagne")
    message1.hidden = true
    const message2 = document.getElementById("perdu")
    message2.hidden = true
    var menu = document.getElementById("menu");
    menu.hidden = false;
}
document.getElementById("homePage").onclick = homePage;


function getGridSize() {

}