class Bot {
    constructor(type) {
        this.type = type;
    }

    isFor(type) {
        return this.type == type;
    }

    hasHardMode() {
        return this.type == 'Wordle';
    }

    guessesAllowed() {
        if (this.type == 'Woodle') return 8;
        return 6;
    }

    setChangeEvents() {
        if (this.type == 'Woodle') {
            woodleDropdown();
        } else {
            tilesChangeColor();
        }
    }

    getDifference(word1, word2) {
        if (this.type == 'Woodle') {
            return differencesWithoutPositions(word1, word2);
        } else if (this.type == 'W-Peaks') {
            return getAlphabeticDifferences(word1, word2);
        } else {
            return differencesWithPositions(word1, word2);
        }
    }

    getRowColor(row_number) {
        if (this.type == 'Woodle') {
            return rowDifferencesWithoutPositions(row_number);
        } else {
            return rowDifferencesWithPositions(row_number);
        }
    }

    setRowColor(difference, row_number) {
        if (this.type == 'Woodle') {
            return setRowDifferencesWithoutPositions(difference, row_number);
        } else {
            return setRowDifferencesWithPositions(difference, row_number);
        }
    }
}

// Wordle Specific Functions
function tilesChangeColor() {
    let tiles = document.getElementsByClassName('tile');

    Array.from(tiles).forEach(function(t) {
      t.addEventListener('click', function() {
        changeTileColor(t);
      });
    });
}


function changeTileColor(tile) {
    let old_color = getTileColor(tile);
    let new_color = nextColor(old_color);
    tile.classList.replace(old_color, new_color);
}

function nextColor(color) {
    return color == CORRECT ? WRONG_SPOT : (color == WRONG_SPOT ? INCORRECT : CORRECT)
}

function getTileColor(tile) {
    return Array.from(tile.classList).filter(a => a == CORRECT || a == INCORRECT || a == WRONG_SPOT);
}

function differencesWithPositions(word1, word2) {
    if (pairings[word1]) {
        if (pairings[word1][word2]) return pairings[word1][word2];
    } else pairings[word1] = [];
    
    
    let temp1 = word1;
    let temp2 = word2;
    let diff = EMPTY.repeat(word_length);
    let pos = 0;

    for (let j = 0; j < temp1.length; j++) {        
        let word1_c = temp1.charAt(j);
        let word2_c = temp2.charAt(j);

        if (word1_c == word2_c) {
            temp1 = temp1.slice(0, j) + temp1.slice(j+1);
            temp2 = temp2.slice(0, j) + temp2.slice(j+1);
            diff = diff.slice(0, pos) + CORRECT + diff.slice(pos+1);
            j--;
        }
        pos++;
    }

    pos = 0;
    for (let j = 0; j < temp1.length; j++) {
        if (diff.charAt(pos) != 'X') {
            j--;
            pos++;
            continue;
        }

        let word1_c = temp1.charAt(j);
        if (temp2.includes(word1_c)) {
            diff = diff.slice(0, pos) + WRONG_SPOT + diff.slice(pos+1);

            let index = temp2.indexOf(word1_c);
            temp2 = temp2.slice(0, index) + temp2.slice(index+1);
        } else {
            diff = diff.slice(0, pos) + INCORRECT + diff.slice(pos+1);
        }


        pos++;
    }

    pairings[word1][word2] = diff;

    return diff;
}

function rowDifferencesWithPositions(row_number) {
    let row = document.getElementsByClassName("row")[row_number];
    let coloring = "";

    for (let i = 0; i < word_length; i++) {
        coloring += getTileColor(row.getElementsByClassName("tile")[i]);
    }

    return coloring;
}

function setRowDifferencesWithPositions(coloring, row) {
    let tiles = document.getElementsByClassName('row')[row].getElementsByClassName('tile');

    for (let i = 0; i < word_length; i++) {
        tiles[i].classList.replace(INCORRECT, coloring[i]);
    }
}

// Woodle Specific Functions & Constants
const TRACKER_BUTTONS = `<div class = 'tracker'>
                            <select name='woodle-count' class = 'woodle-count G'></select>
                            <select name='woodle-count' class = 'woodle-count Y'></select>
                        </div>`


function woodleDropdown() {
    let selector = document.getElementsByClassName('woodle-count');
    for (let i = 0; i < selector.length; i++) {
        if (selector[i].getElementsByTagName('option').length) {
            continue;
        }

        let options = "";
        for (let j = 0; j <= word_length; j++) {
            options += "<option value='" + j + "'>" + j + "</option>"
        }

        selector[i].innerHTML = options;
    }
}

function rowDifferencesWithoutPositions(row) {
    let num_correct = document.getElementsByClassName('woodle-count ' + CORRECT)[row].value;
    let num_wrong_spots = document.getElementsByClassName('woodle-count ' + WRONG_SPOT)[row].value;
    let num_wrong = word_length - num_correct - num_wrong_spots;

    return CORRECT.repeat(num_correct) + WRONG_SPOT.repeat(num_wrong_spots) + INCORRECT.repeat(num_wrong);
}

function differencesWithoutPositions(word1, word2) {
    let temp1 = word1;
    let temp2 = word2;

    if (pairings[word1]) {
        if (pairings[word1][word2]) return pairings[word1][word2];
    } else pairings[word1] = [];

    let correct = "";
    let wrong_spots = "";
    let num_wrong = word_length;

    for (let j = 0; j < temp1.length; j++) {
        if (num_wrong == 0) break;
        
        let word1_c = temp1.charAt(j);
        let word2_c = temp2.charAt(j);

        if (word1_c == word2_c) {
            correct += CORRECT;
            num_wrong--;
            
            temp1 = temp1.slice(0, j) + temp1.slice(j+1);
            temp2 = temp2.slice(0, j) + temp2.slice(j+1);
            j--;
        }
    }

    for (let j = 0; j < temp1.length && num_wrong > 0; j++) {
        let word1_c = temp1.charAt(j);

        if (temp2.includes(word1_c)) {
            wrong_spots += WRONG_SPOT;
            num_wrong--;

            let index = temp2.indexOf(word1_c);
            temp2 = temp2.slice(0, index) + temp2.slice(index+1);
        }
    }

    let diff = correct + wrong_spots + INCORRECT.repeat(num_wrong);
    pairings[word1][word2] = diff;

    return diff;
}

function setRowDifferencesWithoutPositions(coloring, row) {
    let num_correct = document.getElementsByClassName('woodle-count ' + CORRECT)[row];
    let num_wrong_spots = document.getElementsByClassName('woodle-count ' + WRONG_SPOT)[row];

    num_correct.value = count(coloring, CORRECT);
    num_wrong_spots.value = count(coloring, WRONG_SPOT);
}

// Specific Functions
function getAlphabeticDifferences(word1, word2) {
    let diff = "";
    for (let i = 0; i < word_length; i++) {
        let a = word1.charAt(i), b = word2.charAt(i);

        if (a == b) {
            diff += CORRECT;
        } else if (a > b) {
            diff += 'B';
        } else if (a < b) {
            diff += 'Y';
        }
    }

    return diff;
}