var averages = [];
// test
function reduceList(list) {
    for (let i = 0; i < list.length; i++) {
        var vowels = count(list[i], "A") + count(list[i], "E") + count(list[i], "I") + count(list[i], "O") + count(list[i], "U") + count(list[i], "Y");
        if (vowels > 1) {
            list.splice(i, 1);
            i--;
            continue;
        } 

        var cons = count(list[i], "C");
        
        if (cons < 1) {
            list.splice(i, 1);
            i--;
            continue;
        }

        cons = count(list[i], "R");
        
        if (cons < 1) {
            list.splice(i, 1);
            i--;
            continue;
        }        

        cons = count(list[i], "B");
        
        if (cons < 1) {
            list.splice(i, 1);
            i--;
        }
    }
    return list;
}

function testStartingWords() {
    console.log("testing");
    // var check_list = update(true);

    var check_list = easy;
    // var check_list = hard;
    check_list = check_list.sort((a, b) => a.average >= b.average ? 1 : -1);
    // check_list = check_list.sort((a, b) => a.wrong >= b.wrong ? 1 : -1);
    check_list = check_list.map(a => a.word);
    check_list = check_list.filter(a => a.length == word_length);
    
    // check_list = reduceList(check_list);
    console.log(check_list);


    // var hard_mode = true;
    var hard_mode = false;
    

    var i = 0;
    var count = 0;
    var test_size = check_list.length;
    var current = -1;

    if (hard_mode) newlist = hard.slice();
    else newlist = easy.slice();

    var iv = setInterval(function() {
        if (averages.length > current) {
            current = averages.length;

            // while (true) {
            //     if (newlist.filter(a => a.word == check_list[i]).length) {
            //         i++;
            //     } else {
            //         break;
            //     }
            // }

            makeTables(check_list[i]);
            setupTest(check_list[i]);

            if (document.getElementById("summary")) {
                document.getElementById("summary").remove();
            }

            if (document.getElementById("test-settings")) {
                document.getElementById("test-settings").remove();
            }
            
            let average = runBot(check_list[i], hard_mode, false);
            
            i++;
        }
        
        if (i > test_size) {
            clearInterval(iv);
        }
    }, 1);
}

function getWord() {
    let tiles = document.getElementsByClassName("tile");
    var guess = "";

    for (let i = 0; i < word_length; i++) {
        guess += tiles[i].innerHTML;
    }

    return guess;
}

function removeTest() {
    if (document.getElementById("results")) {
        document.getElementById("results").remove();
    } 

    document.getElementById("grid").innerHTML = "";
    document.getElementById("word_entered").disabled = false;
}

function setupTest(word) {
    if (document.getElementById("results")) {
        document.getElementById("results").remove();
    } 

    document.getElementById("word_entered").disabled = true;

    var test_center = document.createElement("div");
    test_center.setAttribute("id", "results");
    test_center.setAttribute("class", "testing");

    test_center.innerHTML = "<div class = 'average'></div><div class = 'current'></div>";
    test_center.innerHTML += "<div class = 'bar one'><span class = 'num-guesses'>1/6</span><span class = 'count'></span></div>";
    test_center.innerHTML += "<div class = 'bar two'><span class = 'num-guesses'>2/6</span><span class = 'count'></span></div>";
    test_center.innerHTML += "<div class = 'bar three'><span class = 'num-guesses'>3/6</span><span class = 'count'></span></div>";
    test_center.innerHTML += "<div class = 'bar four'><span class = 'num-guesses'>4/6</span><span class = 'count'></span></div>";
    test_center.innerHTML += "<div class = 'bar five'><span class = 'num-guesses'>5/6</span><span class = 'count'></span></div>";
    test_center.innerHTML += "<div class = 'bar sixe'><span class = 'num-guesses'>6/6</span><span class = 'count'></span></div>";
    test_center.innerHTML += "<div class = 'bar x'><span class = 'num-guesses'>X/6</span><span class = 'count'></span></div>";
    test_center.innerHTML += "<button id = 'cancel'>&#10006</button>";

    document.getElementById("suggestions").appendChild(test_center);

    let guess_letters = document.getElementsByClassName("tile");

    document.getElementsByClassName("current")[0].appendChild(
        document.getElementById("grid")
    );

    document.getElementsByClassName("buttons")[0].remove();

    var count = document.getElementsByClassName("count");
    for (let i = 0; i < count.length; i++) {
        count[i].innerHTML = "0";
        document.getElementsByClassName("bar")[i].style.height = "1.125rem";
    }

    
    var tiles = document.getElementsByClassName("tile");
    for (let i = 0; i < tiles.length; i++) {
        tiles[i].classList.add("testing");
    }

    let new_form = document.createElement("div");
    new_form.setAttribute("id", "test-settings");

    var hard = "<div><input type='checkbox' id='hard-mode' name='hard-mode'>";
    hard += "<label for='hard-mode'>Bot plays hard mode</label></div>";
    var submit_button = "<button class = 'bot'>Start WordleBot</button>";

    var info = "<div class = 'info'> The Wordle Bot will test " + word + " against 300 randomly selected answers.</div>";

    new_form.innerHTML = hard + info + submit_button;

    test_center.appendChild(new_form);

    document.getElementById("cancel").addEventListener('click', function() {            
        pairings = [];
        document.getElementById("guesses").appendChild(
            document.getElementById("grid")
        );

        removeTest();
    });

    document.getElementsByClassName("bot")[0].addEventListener("click", function() {
        hard_mode = document.getElementById("hard-mode").checked;
        document.getElementById("test-settings").remove();

        runBot(word, hard_mode);
    });
}

function runBot(guess, hard_mode, remembers_words) {
    const startTime = performance.now();
    // const test_size = common.length;
    const test_size = 300;

    var sum = 0;
    var count = 0;
    var missed = [];
    var scores = new Array(7).fill(0);
    var sample = [];
    // var sample = common.slice();

    for (let i = 0; i < test_size; i++) {
        let index = Math.round(Math.random()*(common.length-1));
        if (!sample.includes(common[index])) sample.push(common[index]);
        else i--;
    }

    var iv = setInterval(function() {
        document.getElementById("grid").innerHTML = "";

        let n = wordleBot(guess, sample[count], hard_mode, remembers_words);
        if (n == 7) {
            // clearInterval(iv);
            missed.push(sample[count]);
        }

        sum += n;
        scores[n-1] += 1;

        let max = Math.max(...scores);

        let points = document.getElementsByClassName("count");
        let bars = document.getElementsByClassName("bar");
        points[n-1].innerHTML = scores[n-1];
        
        for (let x = 0; x < bars.length; x++) {
            bars[x].style.height = "calc(1.125rem + " + ((scores[x]/max)*100)*.4 + "%)";
        }

        document.getElementsByClassName("average")[0].innerHTML = "Average: " + parseFloat(sum/(count+1)).toFixed(3);

        count++;

        document.getElementById("cancel").addEventListener('click', function() {
            clearInterval(iv);
            
            pairings = [];
            document.getElementById("guesses").appendChild(
                document.getElementById("grid")
            );
            removeTest();
        });

        if (count >= test_size) {
            document.getElementById("guesses").appendChild(
                document.getElementById("grid")
            );

            document.getElementById("grid").innerHTML = "";

            let average = parseFloat(sum/count);
            let wrong = missed.length/common.length;
            document.getElementsByClassName("average")[0].innerHTML = "";

            let summary = guess + " solved " + (test_size - missed.length) + "/" + test_size + " words with an average of " + average.toFixed(3) + " guesses per solve.";

            if (missed.length) {
                summary += "<div id = 'wrongs'>Missed words: ";
                for (let i = 0; i < missed.length; i++) {
                    summary += missed[i];
                    if (i < missed.length - 1) {
                        summary += ", ";
                    }
                }

                summary += "</div>"
            }
            document.getElementsByClassName("current")[0].innerHTML = "<div id = 'summary'>" + summary + "</div>";
            clearInterval(iv);

            let data = {word: guess, average: average, wrong: wrong};

            averages.push(data);
            averages.sort((a, b) => a.average >= b.average ? 1 : -1);

            // let index = newlist.map(function(e) { return e.word; }).indexOf(guess);

            // if (index == -1) {
            //     newlist.push(data);
            // } else if (newlist[index].average != average || newlist[index].wrong != wrong) {
            //     newlist[index] = data;
            // }        
            // console.log(newlist);

            const endTime = performance.now();   
            console.log(guess + " --> " + average + " --> " + (endTime - startTime)/1000 + " seconds");
            console.log(averages);

            pairings = [];
        }
    }, 1);
}

function wordleBot(guess, answer, hard_mode, remembers_words) {
    var attempts = 1;
    
    while (attempts <= 6) {
        makeTables(guess, "testing");
        if (document.getElementsByClassName("buttons").length) {
            document.getElementsByClassName("buttons")[0].remove();
        }

        var diff = getDifference(guess, answer);
        var letters = document.getElementsByClassName("tile");
        var pos = 0;
        
        for (let i = Math.max(0, letters.length - word_length); i < letters.length; i++) {
            document.getElementsByClassName("tile")[i].style.backgroundColor = clr[diff[pos]];;
            pos++;
        }
        
        if (guess == answer || attempts == 6) {
            if (guess != answer) attempts++;
            break;
        }
        
        attempts++;
        
        var letters = document.getElementsByClassName("tile");
        var list  = filterList(common.slice(), letters);
        var full_list = words.slice();

        if (hard_mode) {
            full_list = filterList(full_list, letters);
        } 
        else {
            if (list.length > 10) { 
                var wrong_letters = getWrongLetters(letters);
                full_list = removeWorthless(full_list, wrong_letters);
            } 
        }

        const max_size = 3000000
        if (list.length * full_list.length > max_size) {
            let small_size = max_size/full_list.length;
            let big_size = max_size/list.length;

            var alphabet = bestLetters(list);
            
            list = sortList(list, alphabet);
            list = list.slice(0, small_size);
            list = list.map(a => a.word);
            
            full_list = sortList(full_list, alphabet, list);
            full_list = full_list.slice(0, big_size);
            full_list = full_list.map(a => a.word);
        }

        full_list = useTop(list, full_list, false, true);

        guess = full_list[0].word;    
    }

    return attempts;
}

function removeWorthless(list, wrong_letters) {
    if (!list.length) return [];

    outer:
    for (let i = 0; i < list.length; i++) {
        var word = list[i];

        for (let j = 0; j < wrong_letters.length; j++) {
            if (list[i].includes(wrong_letters[j])) {
                list.splice(i, 1);
                i--;
                continue outer;
            }
        }
    }

    return list;
}

function getWrongLetters(all_letters) {
    var wrong_letters = [];
    var doubles = [];

    for (let i = 0; i < all_letters.length; i++) {
        var hash = parseInt(i/word_length) + " " + all_letters[i].innerHTML;
        
        if (all_letters[i].style.backgroundColor == wrong_spots_color || all_letters[i].style.backgroundColor == correct_color) {
            if (doubles[hash] == null) {
                doubles[hash] = 1;
            } else {
                doubles[hash]++;
            }
        }
    }
    
    for (let i = 0; i < all_letters.length; i++) {
        var hash = parseInt(i/word_length) + " " + all_letters[i].innerHTML;

        if (all_letters[i].style.backgroundColor == incorrect_color) {
            if (doubles[hash] == null) {
                wrong_letters.push(all_letters[i].innerHTML);
            }
        }
    }

    return wrong_letters;
}