'use strict';

var ops = [
    {
	operation: function(a,b) { return a + b },
	condition: function(a,b) { return true },
	display: function(a,b) { return a + " + " + b + " = " + (a + b) },
    },
    {
	operation: function(a,b) { if (a > b) { return a - b } else { return b - a } },
	condition: function(a,b) { return true },
	display: function(a,b) { if (a > b) { return a + " - " + b + " = " + (a - b) } else { return b + " - " + a + " = " + (b - a) } },
    },
    {
	operation: function(a,b) { return a * b },
	condition: function(a,b) { return true },
	display: function(a,b) { return a + " × " + b + " = " + (a * b) },
    },
    {
	operation: function(a,b) { if (a%b == 0) { return a / b } else { return b / a } },
	condition: function(a,b) { if (a%b == 0 || b%a == 0) { return true } else { return false } },
	display: function(a,b) { if (a%b == 0) { return a + " ÷ " + b + " = " + (a/b) } else { return b + " ÷ " + a + " = " + (b/a) } },
    }
];

var numbers = [];
var tilesets = [
    [
	[25,50,75,100],
	[1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6,7,8,9,10]
    ]
];
var tileset = 0;
var tiles = new Tiles();

function getTarget(a) {
    var tops,
	n,
	na,
	nb,
	nc,
	op,
	lst,
	i,
	j;
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
	// Pick two numbers, removing from the list
	na = b.splice(getRandomInt(0,b.length),1)[0];
	nb = b.splice(getRandomInt(0,b.length),1)[0];
	// Make an array of the allowed operations
	tops = [];
	for (j = 0; j < ops.length; j++) {
	    if (ops[j].condition(na,nb)) {
		tops.push(j);
	    }
	}
	// Pick an operation
	op = getRandomInt(0,tops.length);
	// Calculate the answer
	nc = ops[op].operation(na,nb);
	lst.push(ops[op].display(na,nb));
	b.push(nc);
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
}

function setSize() {
    tiles.setScale(7,4);
}

function initTiles() {
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
    tiles.foreachTile(function(t) {
	nums.push(t.contents);
    });
    var tgt = getTarget(nums);
    var tgttile = tiles.newTile();
    tgttile.setSize(2,1);
    tgttile.setContents("Target:<br>" + tgt.target);
    tgttile.setLines(2);
    tgttile.showContents();
    tgttile.show();
    var p = tiles.ScreenAnchor("south");
    tgttile.setPosition(p.x,p.y,"north");
    tgttile.moveTo(p.x,1,"north",1);
    var first = tiles.newTile();
    var op = tiles.newTile();
    var second = tiles.newTile();
    var equals = tiles.newTile();
    var answer = tiles.newTile();
    first.setSize(0,0);
    first.show();
    first.showContents();
    first.setPosition(1.25,2.5,"centre")
    first.resizeTo(1,1,"centre",1);
    op.setSize(0,0);
    op.show();
    op.showContents();
    op.setPosition(2,2.5,"centre")
    op.resizeTo(.5,.5,"centre",1);
    second.setSize(0,0);
    second.show();
    second.showContents();
    second.setPosition(2.75,2.5,"centre")
    second.resizeTo(1,1,"centre",1);
    equals.setSize(0,0);
    equals.show();
    equals.showContents();
    equals.setPosition(3.5,2.5,"centre")
    equals.resizeTo(.5,.5,"centre",1);
    equals.setContents("=");
    answer.setSize(0,0);
    answer.show();
    answer.showContents();
    answer.setPosition(4.25,2.5,"centre")
    answer.resizeTo(1,1,"centre",1);
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
window.addEventListener('resize',setSize,false);

