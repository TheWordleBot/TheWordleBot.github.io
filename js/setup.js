$(document).ready(function() {
    getPreferences();
    createPage();

    $("#bot-type").change(function() {
        let val = $(this).val();
        localStorage.setItem('bot_type', val);
        setBotMode(val);
        createPage();
    });

    $("#word-length").on('input', function() {
        localStorage.setItem('word_length', $(this).val());
        createPage();
    });

    $("#wordbank").on('input', function() {
        localStorage.setItem('wordbank', $(this).val());
        setWordbank();
        update();
    });

    
    $("#word-entered").on('input', function(e) {
        let val = $("#word-entered").val();
        if (words.includes(val)) {
            $("#word-entered").blur();
            
            makeTables(val);
            
            if (word_length == 11) {
                $(".tile").css('font-size', '1rem');
            }
        } 
    });

    $(document).on('click', '.showlist', function() {
        if ($(this).children().hasClass("visible")) {
            ($(this).children().removeClass("visible"));
        } else {
            $(this).children().addClass("visible");
        }
    });
});

function createPage() {
    drawPage();
    setLength();
    setWordbank();
    update();
}

function resetPage() {
    document.getElementById('grid').innerHTML = "";
    document.getElementById('next-previous-buttons').innerHTML = "";
    update();
}

function getPreferences() {
    if (localStorage.getItem('bot_type')) {
        setBotMode(localStorage.getItem('bot_type'));
    } else {
        setBotMode('Wordle');
    }

    if (localStorage.getItem('wordbank')) {
        document.getElementById('wordbank').value = localStorage.getItem('wordbank');
    }
}

function drawPage() {
    let container = document.getElementById('container');
    let header = document.getElementById('top-of-screen');

    createMainHeader(header);
    createWordLengthSelector(header);

    createGuessInput(container);
    createAnswerSuggestions(container);

    // header.innerHTML += "<button id = 'wordlebot'>Run Bot</button>"
}

function createMainHeader(div) {
    let main_header = document.getElementById('top-of-screen');
    let title = main_header.getElementsByTagName('h1')[0];

    title.innerHTML = bot.type + ' Calcle';
    main_header.append(title);
}

function createWordLengthSelector() {
    let select_length = document.getElementById('word-length');

    let options = ""
    for (let i = SMALLEST_WORD; i <= LARGEST_WORD; i++) {
        let selected = "";
        if (i == 5) selected = "selected = 'selected'";
        options += "<option value='" + i + "' " + selected +">" + i + "</option>";
    }

    select_length.innerHTML = options;
    
    if (localStorage.getItem('word_length')) {
        select_length.value = localStorage.getItem('word_length');
    }
}

function createInfoPage() {
    let info = document.getElementsByClassName('info screen')[0];
    let example_row = createRow('CRUST', 'dummy');
    example_row.getElementsByClassName('tile')[3].classList.replace(INCORRECT, WRONG_SPOT);
    example_row.getElementsByClassName('tile')[4].classList.replace(INCORRECT, CORRECT);


    let example_list = document.createElement('ul');
    example_list.setAttribute('class', 'word-list');
    
    example_list.innerHTML = createListItem('ALEPH', '2.290 guesses left', 1) + 
    createListItem('PLENA', '2.323 guesses left', 2) + 
    createListItem('PHIAL', '2.323 guesses left', 3) +
    createListItem('SPALE', '2.323 guesses left', 4);
    
    let example_wrong = document.createElement('ul');
    example_wrong.setAttribute('class', 'word-list dummy');
    example_wrong.innerHTML = createListItem('ALEPH', '96.77% solve rate', 1)

    info.innerHTML = 
        `<button class="info close"></button>
        <h3 class="top-header">How does this work?</h3>
        <p>Simply enter in your last guess, click on the tiles until the colors match, hit calculate, 
            and the WordleBot will give you sthe best possible guesses from that point.</p>
        <h3 class = 'mini'>After each guess you should see something like this:</h3><div class = 'examples'>` + example_row.outerHTML + example_list.outerHTML + 

        `</div><p>
        This means the best guess from this point would be ALEPH,
        and that you have an average of 2.290 guesses left. If you see:
        </p>`
        + example_wrong.outerHTML + 
        `<p>That means ALEPH will only solve 96.77% of the remaining possible answers within 6 guesses.
        Generally speaking, you should only see this if you're playing on hard mode.</p>`
        +
        `<p>
        Want to see how good your starting word is? Click the <button class = 'test dummy' disabled><i class="gg-bot"></i></button> on the top right to get a good idea.
        </p>`
    
    info.classList.remove('hide');
    info.classList.add('display');

    let close = info.getElementsByClassName('close')[0];
    close.addEventListener('click', function() {
        info.classList.remove("display");
        info.classList.add("hide");
        info.innerHTML = "";
    });
}

function createSettingsPage() {
    let settings = document.getElementsByClassName('settings screen')[0];

    settings.classList.remove('hide');
    settings.classList.add('display');
    
    let close = settings.getElementsByClassName('close')[0];
    close.addEventListener('click', function() {
        settings.classList.remove("display");
        settings.classList.add("hide");
    });
}

function createGuessInput(div) {
    let input = document.getElementsByTagName('input')[0];
    setInputAttributes(input);
}

function setInputAttributes(input) {
    input.setAttribute('id', 'word-entered');
    input.setAttribute('type', 'text');
    input.setAttribute('autocomplete', 'off');
    input.setAttribute('placeholder', 'enter your guess here');
    input.setAttribute('onkeypress', 'return /[a-z]/i.test(event.key)');
    input.setAttribute('oninput', 'this.value = this.value.toUpperCase()');
}

function createAnswerSuggestions() {
    let suggestions = document.getElementById('suggestions');

    if (bot.hasHardMode() && !document.getElementById('mode')) {
        createHardModeSwitch(suggestions);
    } else if (!bot.hasHardMode() && document.getElementById('mode')) {
        removeHardModeSwitch(suggestions);
    }

    createAnswerLists(suggestions);
}

function createAnswerLists(div) {
    if (document.getElementById('answers')) {
        document.getElementById('answers').remove();
    }

    let answer_lists = document.createElement('div');
    answer_lists.setAttribute('id', 'answers');
    
    let normal_list_position = 'front', hard_list_position = 'back';
    if (bot.hasHardMode() && document.getElementById('mode').checked) {
        normal_list_position = 'back';
        hard_list_position = 'front';
    }

    createOptions(answer_lists, 'normal ' + normal_list_position);

    if (bot.hasHardMode()) {
        createOptions(answer_lists, 'hard ' + hard_list_position);
    }

    div.append(answer_lists);
}

function createOptions(div, position) {
    let class_name = 'best-guesses ' + position;
    let best_guesses = document.createElement('div');
    best_guesses.setAttribute('class', class_name);

    let word_list = document.createElement('ul');
    word_list.setAttribute('class', 'word-list');
    best_guesses.append(word_list)

    div.append(best_guesses);
}

function createHardModeSwitch(div) {
    let switch_label = document.createElement('div');
    switch_label.setAttribute('class', 'hard label');
    switch_label.innerHTML = "Show me the best guesses for 'Hard Mode': "

    let switch_container = document.createElement('label');
    switch_container.setAttribute('class', 'hard switch');
    
    let switch_checkbox = document.createElement('input');
    switch_checkbox.setAttribute('id', 'mode');
    switch_checkbox.setAttribute('type', 'checkbox');

    let switch_slider = document.createElement('span');
    switch_slider.setAttribute('class', 'slider round');

    switch_container.append(switch_checkbox);
    switch_container.append(switch_slider);
    
    let header = document.getElementsByClassName('mini-title')[0];
    div.insertBefore(switch_label, header);
    div.insertBefore(switch_container, header);

    switch_checkbox.addEventListener('change', function() {
        swapSlides(document.getElementsByClassName('best-guesses normal'), 
                    document.getElementsByClassName('best-guesses hard'), switch_checkbox.checked);
    });
}

function removeHardModeSwitch() {
    let label = document.getElementsByClassName('hard label')[0];
    let container = document.getElementsByClassName('hard switch')[0];

    if (label) label.remove();
    if (container) container.remove();
}
