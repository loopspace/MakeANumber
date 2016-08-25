'use strict';

var ops = [
    {
	operation: function(a,b) { return a + b },
	condition: function(a,b) { return true },
	display: function(a,b) { return a + " + " + b + " = " + (a + b) },
	symbol: '+',
	symmetric: true,
    },
    {
	operation: function(a,b) { return a - b },
	condition: function(a,b) { if (a < b) {return false} else {return true} },
	display: function(a,b) { return a + " - " + b + " = " + (a - b) },
	symbol: '-',
	symmetric: false,
    },
    {
	operation: function(a,b) { return a * b },
	condition: function(a,b) { return true },
	display: function(a,b) { return a + " × " + b + " = " + (a * b) },
	symbol: '×',
	symmetric: true,
    },
    {
	operation: function(a,b) { return a / b },
	condition: function(a,b) { if (a%b == 0) { return true } else { return false } },
	display: function(a,b) { return a + " ÷ " + b + " = " + (a/b) },
	symbol: '÷',
	symmetric: false,
    }
];

var numbers;
var tilesets = [
    [
	[25,50,75,100],
	[1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6,7,8,9,10]
    ]
];
var tileset = 0;
var tiles;
var score = 0;

/*
The probabilities are skewed in favour of + and x; FIX THIS
*/
function getTarget(a) {
    var tops,
	n,
	na,
	nb,
	nc,
	op,
	lst,
	i,
	j,
	k,
	l,
	m
    ;
    lst = [];
    // Number of numbers to work with
    n = a.length;
    // Copy of the array of numbers
    var b = [];
    for (i = 0; i < n; i++) {
	b.push(a[i]);
    }
    // We do n - 1 operations
    for (i = 1; i < n; i++) {
	// Make a list of all legal operations
	tops = [];
	for (j = 1; j < b.length; j++) {
	    for (k = 0; k < j; k++) {
		for (l = 0; l < ops.length; l++) {
		    if (ops[l].condition(b[j],b[k])) {
			tops.push([j,k,l]);
		    }
		    if (!ops[l].symmetric && ops[l].condition(b[k],b[j])) {
			tops.push([k,j,l]);
		    }
		}
	    }
	}
	// Pick one at random
	m = getRandomInt(0,tops.length);
	// Get the values
	na = b[tops[m][0]];
	nb = b[tops[m][1]];
	// Add the results to the arrays
	b.push(ops[tops[m][2]].operation(na,nb));
	lst.push(ops[tops[m][2]].display(na,nb));
	// Remove the used ones
	na = Math.min(tops[m][0],tops[m][1]);
	nb = Math.max(tops[m][0],tops[m][1]);
	b.splice(nb,1);
	b.splice(na,1);
    }
    return { target: b[0], route: lst };
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function init() {
    initTiles();
    window.addEventListener('resize',setSize,false);
}

function setSize() {
    tiles.setScale(7,4);
}

function initTiles() {
    var msgdiv = document.getElementById('message');
    msgdiv.innerHTML = '';
    msgdiv.style.display = 'none';
    numbers = [];
    if (tiles) {
	tiles.destroy();
    }
    
    tiles = new Tiles();
    tiles.setScale(7,4);
    var vals = shuffle(tilesets[tileset][0]);
    var tile;
    for (var i = 0; i < 4; i++) {
	tile = tiles.newTile();
	tile.setPosition(i + 1.5,0,"north east");
	tile.setSize(1,1);
	tile.show();
	tile.hideContents();
	tile.setContents(vals[i]);
	tile.onClick(pickTile);
    }
    vals = shuffle(tilesets[tileset][1]);
    for (var j = 1; j < 4; j++) {
	for (var i = 0; i < 7; i++) {
	    if (i + j > 1) {
		tile = tiles.newTile();
		tile.setPosition(i,j,"north east");
		tile.setSize(1,1);
		tile.show();
		tile.hideContents();
		tile.setContents(vals[j * 7 + i - 8]);
		tile.onClick(pickTile);
	    }
	}
    }
}

function pickTile(tile,e) {
    tile.showContents();
    tile.offClick();
    numbers.push(tile);
    if (numbers.length == 6) {
	moveTiles();
    }
}

function moveTiles() {
    tiles.foreachTile(function(t) {
	t.offClick();
	t.offScreen("south",true);
    });
    numbers.sort(
	function(a,b) {
	    if (a.contents < b.contents) {
		return -1;
	    } else if (a.contents == b.contents) {
		return 0;
	    } else {
		return 1;
	    }
	}
    );
    for (var k = 0; k < numbers.length; k++) {
	numbers[k].killAnimation();
    	numbers[k].moveTo(k+.5,0,"north west",2);
    }
    tiles.doAfterAnimation(setTarget);
}

function setTarget() {
    var nums = [];
    var first,op,second,equals,answer,trash;
    var a,b,opindex,anstgt,undo,resetop;
    var numdrag, ansdrag;
    var numlen,tgt,tgttile;
    undo = [];
    opindex = 0;
    ansdrag = function(t,e) {
//	if (t.top < 2) {
	    t.moveTo(anstgt.x,anstgt.y,"north west",.25);
	    t.finishAnimation = resetop;
//	} else {
//	    t.moveToSaved();
//	}
    };
    resetop = function() {
//	answer.draggable(false);
	answer.offClick();
	answer.draggable(true);
	answer.savePosition();
	answer.atEndDrag = numdrag;

	a.hide();
	b.hide();
	a.draggable(false);
	b.draggable(false);
	undo.push([answer,a,b]);
	a = null;
	b = null;

	numlen -= 1;
	if (numlen == 1) {
	    var total = answer.contents;
	    var msg;
	    if (total == tgt.target) {
		msg = "Congratulations!";
		score += 10;
	    } else if (Math.abs(total - tgt.target) < 5) {
		msg = "Very close!";
		score += 5;
	    } else if (Math.abs(total - tgt.target) < 10) {
		msg = "Good try!";
		score += 1;
	    } else {
		msg = "Try another.";
	    }
	    var msgdiv = document.getElementById('message');
	    msgdiv.innerHTML = '<div>' + msg + "</div><p>Here's our route:</p><ul><li>" + tgt.route.join('<li>') + '</ul>';
	    msgdiv.style.display = 'inline-block';
	    var scoresp = document.getElementById('score');
	    scoresp.innerHTML = score;
	    msgdiv.addEventListener('click',initTiles,false);
	} else {
	
	    answer = tiles.newTile();
	    answer.setSize(1,1);
	    answer.show();
	    answer.showContents();
	    answer.setPosition(4.25,2.5,"centre")
	    answer.savePosition();
	}
    };
    numdrag = function(t,p) {
	if (first.pointIsIn(t.left + p.x, t.top + p.y)) {
	    t.moveTo(first.left,first.top,"north west",.25);
	    if (a) {
		a.moveToSaved();
	    }
	    a = t;
	    anstgt = a.savedPosition;
	    if (b) {
		answer.setContents(ops[opindex].operation(a.contents,b.contents));
//		answer.draggable(true);
		//		answer.atEndDrag = ansdrag;
		answer.onClick(ansdrag);
	    }
	} else if (second.pointIsIn(t.left + p.x, t.top + p.y)) {
	    t.moveTo(second.left,first.top,"north west",.25);
	    if (b) {
		b.moveToSaved();
	    }
	    b = t;
	    if (a) {
		answer.setContents(ops[opindex].operation(a.contents,b.contents));
//		answer.draggable(true);
		//		answer.atEndDrag = ansdrag;
		answer.onClick(ansdrag);
	    }
	} else if (trash.pointIsIn(t.left + p.x, t.top + p.y)) {
	    if (a == t) {
		a = null;
		answer.setContents('');
		//		answer.draggable(false);
		answer.offClick();
	    }
	    if (b == t) {
		b = null;
		answer.setContents('');
		//		answer.draggable(false);
		answer.offClick();
	    }
	    var tindex = -1;
	    for (var i = 0; i < undo.length; i++) {
		if (t == undo[i][0]) {
		    tindex = i;
		    break;
		}
	    }
	    if (tindex !== -1) {
		numlen += 1;
		undo[tindex][0].destroy();
		for (var i = 1; i < 3; i++) {
		    undo[tindex][i].show();
		    undo[tindex][i].moveToSaved();
		    undo[tindex][i].draggable(true);
		    undo[tindex][i].atEndDrag = numdrag;
		}
		undo.splice(tindex,1);
	    } else {
		t.moveToSaved();
	    }
	} else {
	    t.moveToSaved();
	    if (a == t) {
		a = null;
		answer.setContents('');
		//		answer.draggable(false);
		answer.offClick();
	    }
	    if (b == t) {
		b = null;
		answer.setContents('');
		//answer.draggable(false);
		answer.offClick();
	    }
	}
    }
    tiles.foreachTile(function(t) {
	nums.push(t.contents);
	t.draggable(true);
	t.savePosition();
	t.atEndDrag = numdrag;
    });
    numlen = nums.length;
    tgt = getTarget(nums);
    tgttile = tiles.newTile();
    tgttile.setSize(2,1);
    tgttile.setContents("Target:<br>" + tgt.target);
    tgttile.setLines(2);
    tgttile.showContents();
    tgttile.show();
    tgttile.zIndex = -1;
    tgttile.setElement("zIndex");
    var p = tiles.ScreenAnchor("south");
    tgttile.setPosition(p.x,p.y,"north");
    tgttile.moveTo(p.x,1,"north",1);
    first = tiles.newTile();
    op = tiles.newTile();
    second = tiles.newTile();
    equals = tiles.newTile();
    answer = tiles.newTile();
    trash = tiles.newTile();
    first.setSize(0,0);
    first.show();
    first.setColours(null,"#eee");
    first.setPosition(1.25,2.5,"centre")
    first.resizeTo(1,1,"centre",1);
    first.zIndex = -1;
    first.setElement("zIndex");
    op.setSize(0,0);
    op.show();
    op.zIndex = -1;
    op.setElement("zIndex");
    op.setContents('+');
    op.hideContents();
    op.setPosition(2,2.5,"centre")
    op.resizeTo(.5,.5,"centre",1);
    op.finishAnimation = function() {
	op.showContents();
    };
    op.onClick(function(t,e) {
	opindex += 1;
	opindex %= ops.length;
	if (a && b) {
	    while (!ops[opindex].condition(a.contents,b.contents)) {
		opindex += 1;
		opindex %= ops.length;
	    }
	    answer.setContents(ops[opindex].operation(a.contents,b.contents));
	}
	op.setContents(ops[opindex].symbol);
    });
    second.setSize(0,0);
    second.show();
    second.showContents();
    second.setColours(null,"#eee");
    second.setPosition(2.75,2.5,"centre")
    second.zIndex = -1;
    second.setElement("zIndex");
    second.resizeTo(1,1,"centre",1);
    equals.setSize(0,0);
    equals.show();
    equals.setPosition(3.5,2.5,"centre")
    equals.resizeTo(.5,.5,"centre",1);
    equals.setContents("=");
    equals.hideContents();
    equals.zIndex = -1;
    equals.setElement("zIndex");
    equals.finishAnimation = function() {
	equals.showContents();
    };
    answer.setSize(0,0);
    answer.show();
    answer.showContents();
    answer.setPosition(4.25,2.5,"centre")
    answer.resizeTo(1,1,"centre",1);
    answer.finishAnimation = function() {
	answer.savePosition();
    };
    trash.setSize(0,0);
    trash.show();
    trash.setContents('🗑');
    trash.hideContents();
    trash.setPosition(6,2.5,"centre")
    trash.savePosition();
    trash.zIndex = -1;
    trash.setElement("zIndex");
    trash.resizeTo(1,1,"centre",1);
    trash.finishAnimation = function() {
	trash.showContents();
    };
}

function shuffle(a) {
    var b = [];
    var k,c;
    for (var i = 0; i < a.length; i++) {
	k = getRandomInt(i,a.length);
	c = b[i] || a[i];
	b[i] = b[k] || a[k];
	b[k] = c;
    }
    return b;
}

window.addEventListener('load',init,false);
