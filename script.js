'use strict';

/* TODO

Allow all operations when user is calculating, just forbid when choosing target.

If using all numbers, only allow target when one number is left.

Something goes wrong occasionally when a tile is moved and it disappears.
*/

var options = {
    tileSet: 0,
    allTiles: 0,
    exactTarget: 0,
    operationLevel: 0
}

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
	display: function(a,b) { return a + " − " + b + " = " + (a - b) },
	symbol: '−',
	symmetric: false,
    },
    {
	operation: function(a,b) { return a * b },
	condition: function(a,b) {
	    if (options.operationLevel == 0) {
		if (a * b > 100) {
		    return false;
		} else {
		    return true;
		}
	    } else {
		return true;
	    }
	},
	display: function(a,b) { return a + " × " + b + " = " + (a * b) },
	symbol: '×',
	symmetric: true,
    },
    {
	operation: function(a,b) { return a / b },
	condition: function(a,b) { if (options.operationLevel < 2) {return false}; if (a%b == 0) { return true } else { return false } },
	display: function(a,b) { return a + " ÷ " + b + " = " + (a/b) },
	symbol: '÷',
	symmetric: false,
    }
];

var numbers;
var tilesets = [
    [
	[25,50,100,200],
	[1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6,7,8,9,10]
    ],
    [
	[25,50,75,100],
	[1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6,7,8,9,10]
    ],
    [
	[12,37,62,87],
	[1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6,7,8,9,10]
    ]
];
var tiles;
var score = 0;

function getRandomTarget(a,tgttile) {
    options.operationLevel = 2;
    var i,j,k,l,m,c,d,getRoute,dts;
    var b = [];
    var route = [];
    var lst = [[a,[]]];
    var tgt = getRandomInt(100,1000);
    for (i = 0; i < a.length; i++) {
	b.push([a[i],[]]);
    }
    i = 0;
//    var lg = document.getElementById('log');
    getRoute = function() {
	tgttile.setContents("Target:<br><span class=\"generating\">" + getRandomInt(100,1000) + "</span>");
	for (var di = 0; di < 10000 && i < lst.length; di++) {
	    for (j = 1; j < lst[i][0].length; j++) {
		for (k = 0; k < j; k++) {
		    for (l = 0; l < ops.length; l++) {
			if (ops[l].condition(lst[i][0][j],lst[i][0][k])) {
			    c = [];
			    d = [];
			    c.push(ops[l].operation(lst[i][0][j],lst[i][0][k]));
			    for (m = 0; m < lst[i][0].length; m++) {
				if (m != j && m != k) {
				    c.push(lst[i][0][m]);
				}
			    }
			    for (m = 0; m < lst[i][1].length; m++) {
				d.push(lst[i][1][m]);
			    }
			    d.push([j,k,l]);
			    b.push([c[0],d]);
			    lst.push([c,d]);
			}
			if (!ops[l].symmetric && ops[l].condition(lst[i][0][k],lst[i][0][j])) {
			    c = [];
			    d = [];
			    c.push(ops[l].operation(lst[i][0][k],lst[i][0][j]));
			    for (m = 0; m < lst[i][0].length; m++) {
				if (m != j && m != k) {
				    c.push(lst[i][0][m]);
				}
			    }
			    for (m = 0; m < lst[i][1].length; m++) {
				d.push(lst[i][1][m]);
			    }
			    d.push([k,j,l]);
			    b.push([c[0],d]);
			    lst.push([c,d]);
			}
		    }
		}
	    }
	    i++;
	}
	if (i < lst.length && lst[i][0].length > 1) {
	    window.requestAnimationFrame(getRoute);
	} else {
	    var bb = [];
	    var p;
	    for (i = 0; i < b.length; i++) {
		if (!bb[b[i][0]] || bb[b[i][0]].length > b[i][1].length) {
		    bb[b[i][0]] = b[i][1];
		}
	    }
	    var rt;
	    if (bb[tgt]) {
		rt = bb[tgt];
	    } else if (bb.length < tgt) {
		rt = bb[bb.length-1];
	    } else {
		i = 0;
		while (!bb[tgt - i] && !bb[tgt+i]) {
		    i++;
		}
		rt = bb[tgt - i] || bb[tgt + i];
	    }
	    b = [];
	    for (j = 0; j < a.length; j++) {
		b.push(a[j]);
	    }
	    for (j = 0; j < rt.length; j++) {
		route.push(ops[rt[j][2]].display(b[rt[j][0]],b[rt[j][1]]));
		c = ops[rt[j][2]].operation(b[rt[j][0]],b[rt[j][1]]);
		b.splice(Math.max(rt[j][0],rt[j][1]),1);
		b.splice(Math.min(rt[j][0],rt[j][1]),1);
		b.unshift(c);
	    }
	    tgttile.setContents("Target:<br>" + tgt);
	}
    }
    tgttile.finishAnimation = function() {
	window.requestAnimationFrame(getRoute);
    }
    return { target: tgt, route: route };
}

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
    if (options.allTiles != 0 ) {
	var rm = getRandomInt(0,2);
	var rmi;
	for (i = 0; i < rm; i++) {
	    rmi = getRandomInt(0,b.length);
	    b.splice(rmi,1);
	    n--;
	}
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
    document.addEventListener('touchmove',function(e) {e.preventDefault()});
    var btn = document.getElementById("setopt");
    btn.addEventListener('click',startGame,false);
    /*
      Make the question mark toggle the help pane
     */
    var hlnk = document.getElementById('helplink');
    var hdv = document.getElementById('help');
    hlnk.addEventListener('click', function(e) {
        e.preventDefault();
        if (hdv.style.display == 'none' || hdv.style.display == '') {
            hdv.style.display = 'block';
        } else {
            hdv.style.display = 'none';
        }
        return false;
    });
    /*
      Set the help pane height to the window height,
      Should probably update on resize
     */
    var h = window.innerHeight - 20;
    hdv.style.height = h + 'px';
    /*
     */
    var redobtn = document.getElementById("redogame");
    redobtn.addEventListener('click', function(e) {
	e.preventDefault();
    });
    var quitbtn = document.getElementById("quitgame");
    quitbtn.addEventListener('click', function(e) {
	e.preventDefault();
    });
    /*
      When using a random target, not all the options make sense
    */
    var optform = document.getElementById('optform');
    var disopts = function() {
	if (optform.elements.namedItem('tgtopt').value == 1) {
	    for (var i = 0; i < optform.elements.namedItem('tileopt').length; i++) {
		optform.elements.namedItem('tileopt')[i].disabled = true;
	    }
	    for (var i = 0; i < optform.elements.namedItem('opopt').length; i++) {
		optform.elements.namedItem('opopt')[i].disabled = true;
	    }
	} else {
	    for (var i = 0; i < optform.elements.namedItem('tileopt').length; i++) {
		optform.elements.namedItem('tileopt')[i].disabled = false;
	    }
	    for (var i = 0; i < optform.elements.namedItem('opopt').length; i++) {
		optform.elements.namedItem('opopt')[i].disabled = false;
	    }
	}	    
    }
    for (var i = 0; i < optform.elements.namedItem('tgtopt').length; i++) {
	optform.elements.namedItem('tgtopt')[i].addEventListener('click',disopts);
    }
    disopts();
}

function setSize() {
    tiles.setScale(7,4);
}

function startGame() {
    getOptions();
    var optdiv = document.getElementById("options");
    optdiv.style.display = "none";
    var scorediv = document.getElementById("scoredivctr");
    scorediv.style.display = "inline-block";
    initTiles();
    window.addEventListener('resize',setSize,false);
}

function getOptions() {
    /*
      get options using 
      myForm.elements.namedItem("my-radio-button-group-name").value
      from http://stackoverflow.com/a/37615705
    */
    var optform = document.getElementById('optform');
    options.tileSet = parseInt(optform.elements.namedItem('lvlopt').value);
    options.allTiles = parseInt(optform.elements.namedItem('tileopt').value);
    options.exactTarget = parseInt(optform.elements.namedItem('tgtopt').value);
    options.operationLevel = parseInt(optform.elements.namedItem('opopt').value);
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
    var tileset = options.tileSet;
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
    var numdrag, ansdrag, finished;
    var numlen,tgt,tgttile;
    undo = [];
    opindex = 0;
    ansdrag = function(t,e) {
	t.moveTo(anstgt.x,anstgt.y,"north west",.25);
	t.finishAnimation = resetop;
    };
    resetop = function() {
	if (!a || !b) {
	    return;
	}
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
	if (numlen > 1) {
	    answer = tiles.newTile();
	    answer.setSize(1,1);
	    answer.show();
	    answer.showContents();
	    answer.setPosition(4.25,1.5,"centre")
	    answer.savePosition();
	}
    };
    numdrag = function(t,p) {
	if (first.pointIsIn(p.x,p.y)) {
	    t.moveTo(first.left,first.top,"north west",.25);
	    if (a) {
		a.moveToSaved();
	    }
	    a = t;
	    anstgt = a.savedPosition;
	    if (b) {
		if (b == t) {
		    b = null;
		    answer.setContents('');
		    answer.offClick();
		} else {
		    if (ops[opindex].condition(a.contents,b.contents)) {
			answer.setContents(ops[opindex].operation(a.contents,b.contents));
			answer.onClick(ansdrag);
		    }
		}
	    }
	} else if (second.pointIsIn(p.x,p.y)) {
	    t.moveTo(second.left,first.top,"north west",.25);
	    if (b) {
		b.moveToSaved();
	    }
	    b = t;
	    if (a) {
		if (a == t) {
		    a = null;
		    answer.setContents('');
		    answer.offClick();
		} else {
		    if (ops[opindex].condition(a.contents,b.contents)) {
			answer.setContents(ops[opindex].operation(a.contents,b.contents));
			answer.onClick(ansdrag);
		    }
		}
	    }
	} else if (trash.pointIsIn(p.x,p.y)) {
	    if (a == t) {
		a = null;
		answer.setContents('');
		answer.offClick();
	    }
	    if (b == t) {
		b = null;
		answer.setContents('');
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
	} else if (tgttile.pointIsIn(p.x, p.y)) {
	    var total = t.contents;
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
	    finished = true;
	} else {
	    t.moveToSaved();
	    if (a == t) {
		a = null;
		answer.setContents('');
		answer.offClick();
	    }
	    if (b == t) {
		b = null;
		answer.setContents('');
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
    var quitbtn = document.getElementById("quitgame");
    quitbtn.addEventListener('click', function(e) {
	e.preventDefault();
	if (finished) {return};
	finished = true;
	var msgdiv = document.getElementById('message');
	var bst = '';
	if (options.exactTarget != 0) { bst = "best " };
	msgdiv.innerHTML = "<div>Have another go.</div><p>Here's our " + bst + "route:</p><ul><li>" + tgt.route.join('<li>') + '</ul>';
	msgdiv.style.display = 'inline-block';
	var scoresp = document.getElementById('score');
	scoresp.innerHTML = score;
	msgdiv.addEventListener('click',initTiles,false);
    });
    var redobtn = document.getElementById("redogame");
    redobtn.addEventListener('click', function(e) {
	e.preventDefault();
	if (finished) {return};
	if (options.exactTarget == 0) {
	    tgt = getTarget(nums);
	} else {
	    tgt = getRandomTarget(nums);
	}
	tgttile.setContents("Target:<br>" + tgt.target);
    });
    numlen = nums.length;
    tgttile = tiles.newTile();
    tgttile.setSize(2,1);
    tgttile.setLines(2);
    tgttile.showContents();
    tgttile.show();
    tgttile.setColours(null,"#555");
    tgttile.zIndex = -1;
    tgttile.setElement("zIndex");
    if (options.exactTarget == 0) {
	tgt = getTarget(nums);
	tgttile.setContents("Target:<br>" + tgt.target);
    } else {
	tgt = getRandomTarget(nums,tgttile);
    }
    var p = tiles.ScreenAnchor("south");
    tgttile.setPosition(p.x,p.y,"north");
    tgttile.moveTo(p.x,2,"north",1);
    first = tiles.newTile();
    op = tiles.newTile();
    second = tiles.newTile();
    equals = tiles.newTile();
    answer = tiles.newTile();
    trash = tiles.newTile();
    first.setSize(0,0);
    first.show();
    first.setColours(null,"#eee");
    first.setPosition(1.25,1.5,"centre")
    first.resizeTo(1,1,"centre",1);
    first.zIndex = -1;
    first.setElement("zIndex");
    op.setSize(0,0);
    op.show();
    op.zIndex = -1;
    op.setElement("zIndex");
    op.setContents('+');
    op.hideContents();
    op.setPosition(2,1.5,"centre")
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
	    answer.onClick(ansdrag);
	}
	op.setContents(ops[opindex].symbol);
    });
    second.setSize(0,0);
    second.show();
    second.showContents();
    second.setColours(null,"#eee");
    second.setPosition(2.75,1.5,"centre")
    second.zIndex = -1;
    second.setElement("zIndex");
    second.resizeTo(1,1,"centre",1);
    equals.setSize(0,0);
    equals.show();
    equals.setPosition(3.5,1.5,"centre")
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
    answer.setPosition(4.25,1.5,"centre")
    answer.resizeTo(1,1,"centre",1);
    answer.finishAnimation = function() {
	answer.savePosition();
    };
    trash.setSize(0,0);
    trash.show();
    trash.setContents('\ud83d\uddd1');
    trash.hideContents();
    trash.setPosition(6,1.5,"centre")
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
