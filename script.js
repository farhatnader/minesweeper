function placeNumbers(across, down) {
	// traverse all squares and number them depending on bordering mines
	for (i = 1; i <= across; i++) {
		for (j = 1; j <= down; j++) {
			var selector = '.' + i + '-' + j;
			// if the square is not a mine
			if (!$(selector).hasClass("mine")) {
				var mine_count = 0;
				// check all bordering squares for mines
				for (x = i - 1; x < i + 2; x++) {
					for (y = j - 1; y < j + 2; y++) {
						var border = '.' + x + '-' + y;
						if ($(border).hasClass("mine")) {
							mine_count++;
						}
					}
				}

				var inner = document.createElement("div");
				// only show number if abvoe 0; label 0-squares for detection
				if (mine_count == 0)
					$(inner).addClass("zero");
				else
					$(inner).addClass("number").text(mine_count);
				$(selector).append(inner);
			}
		}
	}
}

function placeMines(num_mines, across, down) {
	// place 1 mine for every 5 square
	for (var i = 0; i < num_mines; i++) {
		// generate random coordinates and use square that matches it
		var x = Math.floor((Math.random() * across) + 1);
		var y = Math.floor((Math.random() * down) + 1);
		var selector = '.' + x + '-' + y;
		if ($(selector).hasClass("mine"))
			i--;
		else
			$(selector).addClass("mine");
	}
}

function clearArea(x, y) {
	// traverse bordering squares
	for (var i = x - 1; i < x + 2; i++) {
		for (var j = y - 1; j < y + 2; j++) {
			var selector = '.' + i + '-' + j;
			// if already uncovered square/mine, do nothing
			if ($(selector).children().hasClass("uncovered"))
				continue;
			else if ($(selector).hasClass("mine"))
				continue;
			else {
				$(selector + " .cover").addClass("uncovered").hide();
				// if square is a zero, uncover it and recurse into its borders
				if ($(selector).children().hasClass("zero"))
					clearArea(i, j);
			}
		}
	}
}

function checkSquare(x, y) {
	// check the newly uncovered square and respond accordingly
	var selector = '.' + x + '-' + y;
	if ($(selector).hasClass("mine")) {
		endGame();
		$("#message").text('You Lose!');
	}
	else {
		$(selector + " .cover").addClass("uncovered").hide();
		if ($(selector).children().hasClass("zero"))
			clearArea(x, y);
		// if all non-mines are uncovered
		if ($(".uncovered").length == $(".square").length - $(".mine").length) {
			endGame();
			$("#message").text('You win!');
		}
	}
}

function setBoard(difficulty = 7, across = 20, down = 20) {
	var board = $("#board");
	board.html('');
	board.attr('style', 'width: ' + (across * 30 + across * 2) + 'px');

	var mine_count = Math.ceil(across * down / difficulty);

	// create squares and add them to board
	for (let i = 1; i <= across; i++) {
		for (let j = 1; j <= down; j++) {
			var square = document.createElement("div");
			square.setAttribute('class', 'square ' + i + '-' + j);

			// add a cover div over each square
			var cover = document.createElement("div");
			// set onclick event to trigger flagging / uncovering
			$(cover).addClass("cover")
				.on('click', function() {
					if (!$(this).hasClass("flag")) {
						// if first click, clear area of that square
						if ($(".uncovered").length == 0)
							clearArea(i, j);
						checkSquare(i, j);
					}
				})
				.contextmenu(function(event) {
					event.preventDefault();
					if ($(this).hasClass("flag"))
						$(this).removeClass("flag");
					else
						$(this).addClass("flag");
					// if the amount of flags placed != the amount of mines
					if ($(".flag").length != 0)
						$("#mine-counter").text(mine_count - $(".flag").length);
				});
			square.appendChild(cover);
			board.append(square);
		}
	}

	placeMines(mine_count, across, down);
	placeNumbers(across, down);
}

function toggleBoard() {
	var difficulty = parseInt($("#difficulty").val());
	var across = 20,
		down = 20;
	$("#start").prop('disabled', true);
	$("#end").prop('disabled', false);
	$("#message").text('Watch your click!');
	setBoard(difficulty, across, down);
	$("#mine-counter").text(Math.ceil(across * down / difficulty));
	$("#timer").text(0);
	stopwatch = setInterval(function() { 
		$("#timer").text(parseInt($("#timer").text()) + 1);
	}, 1000);
}

function endGame() {
	$(".mine .cover").addClass("uncovered").hide();
	$("#start").prop('disabled', false);
	$("#end").prop('disabled', true);
	clearInterval(stopwatch)
}