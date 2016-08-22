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
    var ipt = document.getElementById('numbers');
    ipt.addEventListener('change',setNumbers);
    var frm = document.getElementById('form');
    frm.addEventListener('submit',function(e) {e.preventDefault();});
}

window.addEventListener('load',init,false);

function setNumbers(e) {
    e.preventDefault();
    var lst = e.target.value;
    var re = /\s*[;,]\s*/;
    var arr = lst.split(re);
    var num = [];
    for (var i = 0; i < arr.length; i++) {
	num.push(parseInt(arr[i]));
    }
    var tgt = getTarget(num);
    var tgtelt = document.getElementById('target');
    tgtelt.innerHTML = tgt.target;
    var lstelt = document.getElementById('route');
    lstelt.innerHTML = '';
    var li,txt;
    for (var i = 0; i < tgt.route.length; i++) {
	li = document.createElement('li');
	txt = document.createTextNode(tgt.route[i]);
	li.appendChild(txt);
	lstelt.appendChild(li);
    }
    return false;
}

