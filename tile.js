var edge,
    interpolate,
    getPositionFromAnchor,
    getAnchorFromPosition,
    getRelativeCoords
;

Tiles = function() {
    this.tiles = [];
    var self = this;
    window.requestAnimationFrame(function(dt) {self.doAnimation(dt) });
    document.body.addEventListener('mousedown', function(e) {self.checkTouch(e)});
    document.body.addEventListener('touchstart', function(e) {self.checkTouch(e)});
    document.body.addEventListener('mousemove', function(e) {self.updateTouch(e)});
    document.body.addEventListener('touchmove', function(e) {self.updateTouch(e)});
    document.body.addEventListener('mouseup', function(e) {self.endTouch(e)});
    document.body.addEventListener('touchend', function(e) {self.endTouch(e)});
}

Tiles.prototype.doAfterAnimation = function(f) {
    this.afterAnimation = f;
}

Tiles.prototype.addTile = function(t) {
    t.parent = this;
    t.setAll();
    this.tiles.push(t);
}

Tiles.prototype.newTile = function() {
    var t = new Tile();
    this.addTile(t);
    return t;
}

Tiles.prototype.removeTile = function(t) {
    var index;
    for (var k = 0; k < this.tiles.length; k++) {
	if (this.tiles[k] == t) {
	    index = k;
	    break;
	}
    }
    this.tiles.splice(index,1);
}

Tiles.prototype.foreachTile = function(f) {
    if (typeof f === 'function') {
	for (var k = 0; k < this.tiles.length; k++) {
	    f(this.tiles[k]);
	}
    } else if (typeof f === 'string') {
	for (var k = 0; k < this.tiles.length; k++) {
	    this.tiles[k][f]();
	}
    }
}

Tiles.prototype.doAnimation = function(dt) {
    var finished = true;
    var self = this;
    this.foreachTile(function (t) {if (t.update(dt)) {finished = false} } );
    if (finished && this.afterAnimation) {
	this.afterAnimation();
	this.afterAnimation = null;
    }
    window.requestAnimationFrame(function(dt) { self.doAnimation(dt) });
}

Tiles.prototype.setScale = function(x,y) {
    var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    var s = Math.floor(Math.min(w/x,h/y));
    var fs = Math.floor((s - 40)/3);
    this.scale = s;
    this.fontsize = fs;
    this.foreachTile('rescale');
}

Tiles.prototype.destroy = function() {
    this.foreachTile('remove');
    this.tiles = [];
}

Tiles.prototype.ScreenAnchor = function(a) {
    var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    var p = getAnchorFromPosition(w,h,0,0,a);
    p.x /= this.scale;
    p.y /= this.scale;
    return p;
}

Tiles.prototype.ScreenCoordinates = function(x,y) {
    x /= this.scale;
    y /= this.scale;
    return {x: x, y: y};
}

Tiles.prototype.checkTouch = function(e) {
    var p = this.ScreenCoordinates(e.clientX,e.clientY);
    var tile;
    this.foreachTile(function(t) {
	if (t.checkTouch(p)) {
	    tile = t;
	}
    })
    if (tile) {
	this.touchedTile = tile;
    } else {
	this.touchedTile = null;
    }
}

Tiles.prototype.updateTouch = function(e) {
    if (this.touchedTile) {
	var p = this.ScreenCoordinates(e.clientX,e.clientY);
	this.touchedTile.updateTouch(p);
    }
}

Tiles.prototype.endTouch = function(e) {
    if (this.touchedTile) {
	var p = this.ScreenCoordinates(e.clientX,e.clientY);
	this.touchedTile.endTouch(p);
	this.touchedTile = null;
    }
}

function edge (t) {
    return Math.min(1,Math.max(0, t));
}

function interpolate (t,a,b) {
    t = edge(t);
    return (1 - t) * a + t * b;
}

function getPositionFromAnchor(w,h,x,y,a) {
    if (a == "north") {
	x -= w/2;
    } else if (a == "north east") {
	x -= w;
    } else if (a == "east") {
	x -= w;
	y -= h/2;
    } else if (a == "south east") {
	x -= w;
	y -= h;
    } else if (a == "south") {
	x -= w/2;
	y -= h;
    } else if (a == "south west") {
	y -= h;
    } else if (a == "west") {
	y -= h/2;
    } else if (a == "centre") {
	x -= w/2;
	y -= h/2;
    }
    return {x: x, y: y};
}

function getAnchorFromPosition(w,h,x,y,a) {
    if (a == "north") {
	x += w/2;
    } else if (a == "north east") {
	x += w;
    } else if (a == "east") {
	x += w;
	y += h/2;
    } else if (a == "south east") {
	x += w;
	y += h;
    } else if (a == "south") {
	x += w/2;
	y += h;
    } else if (a == "south west") {
	y += h;
    } else if (a == "west") {
	y += h/2;
    } else if (a == "centre") {
	x += w/2;
	y += h/2;
    }
    return {x: x, y: y};
}

function getRelativeCoords(event) {
    if (event.offsetX !== undefined && event.offsetY !== undefined) { return { x: event.offsetX, y: event.offsetY }; }
    return { x: event.layerX, y: event.layerY };
}


Tile = function() {
    this.element = document.createElement('div');
    this.element.classList.add('tile','noselect');
    document.body.appendChild(this.element);
    this.width = 0;
    this.height = 0;
    this.left = 0;
    this.top = 0;
    this.fgColour = '#000';
    this.bgColour = '#ccc';
    this.border = 10;
    this.margin = 10;
    this.lines = 1;
}

Tile.prototype.show = function() {
    this.element.style.display = 'inline-block';
}

Tile.prototype.hide = function() {
    this.element.style.display = 'none';
}

Tile.prototype.setElement = function(k) {
    var s = this.parent.scale;
    var fs = this.parent.fontsize;
    if (k == "height") {
	var h, pt;
	h = this.height/2 * s + this.lines*fs/2 - this.border - this.margin;
	pt = this.height/2 * s - this.lines*fs/2 - this.border - this.margin;
	this.element.style.height = h + 'px';
	this.element.style.paddingTop = pt + 'px';
    } else if (k == "width") {
	this.element.style.width = (this.width * s - 2*this.border - 2*this.margin) + 'px';
    } else if (k == "foreground") {
	this.element.style.color = this.fgColour;
    } else if (k == "background") {
	this.element.style.backgroundColor = this.bgColour;
	this.element.style.borderColor = this.bgColour;
    } else if (k == "border") {
	this.element.style.borderWidth = this.border + 'px';
	this.element.style.borderRadius = this.border + 'px';
    } else if (k == "top") {
	this.element.style.top = ( this.top * s + this.margin) + 'px';
    } else if (k == "left") {
	this.element.style.left = ( this.left * s + this.margin) + 'px';
    } else if (k == "fontSize") {
	this.element.style.fontSize = fs + 'px';
    } else {
	this.element.style[k] = this[k];
    }
}

Tile.prototype.setBorder = function(b) {
    this.border = b;
    this.setElement("border");
}

Tile.prototype.setMargin = function(b) {
    this.margin = b;
}

Tile.prototype.setPosition = function(x,y,a) {
    var p = getPositionFromAnchor(this.width,this.height,x,y,a);
    this.left = p.x;
    this.top = p.y;
    this.setElement("left");
    this.setElement("top");
}

Tile.prototype.setSize = function(w,h) {
    this.width = w;
    this.height = h;
    this.setElement("width");
    this.setElement("height");
}

Tile.prototype.setColours = function(fg,bg) {
    this.fgColour = fg || this.fgColour;
    this.bgColour = bg || this.bgColour;
    this.setElement("foreground");
    this.setElement("background");
}

Tile.prototype.rescale = function() {
    this.setElement("left");
    this.setElement("top");
    this.setElement("width");
    this.setElement("height");
    this.setElement("fontSize");
}

Tile.prototype.setAll = function() {
    this.setElement("left");
    this.setElement("top");
    this.setElement("width");
    this.setElement("height");
    this.setElement("fontSize");
    this.setElement("foreground");
    this.setElement("background");
}

Tile.prototype.setContents = function(s) {
    this.element.innerHTML = s;
    this.contents = s;
}

Tile.prototype.setLines = function(n) {
    this.lines = n;
}

Tile.prototype.showContents = function() {
    this.element.style.color = this.fgColour;
}

Tile.prototype.hideContents = function() {
    this.element.style.color = this.bgColour;
}

Tile.prototype.onClick = function(f) {
    var self = this;
    var fn = function(e) { f(self,e) };
    this.clickFn = fn;
    this.element.addEventListener('click',fn,false);
}

Tile.prototype.offClick = function() {
    if (this.clickFn) {
	this.element.removeEventListener('click',this.clickFn,false);
	this.clickFn = null;
    }
}    

Tile.prototype.moveTo = function(x,y,a,dt) {
    this.isAnimating = true;
    this.duration = dt * 1000;
    this.startTime = performance.now();
    var p = getPositionFromAnchor(this.width,this.height,x,y,a);
    this.targetX = p.x;
    this.targetY = p.y;
    this.originX = this.left;
    this.originY = this.top;
    this.targetW = this.width;
    this.targetH = this.height;
    this.originW = this.width;
    this.originH = this.height;
}

Tile.prototype.resizeTo = function(w,h,a,dt) {
    this.isAnimating = true;
    this.duration = dt * 1000;
    this.startTime = performance.now();
    var p = getAnchorFromPosition(this.width,this.height,this.left,this.top,a);
    var q = getPositionFromAnchor(w,h,p.x,p.y,a);
    this.targetX = q.x;
    this.targetY = q.y;
    this.originX = p.x;
    this.originY = p.y;
    this.targetW = w;
    this.targetH = h;
    this.originW = this.width;
    this.originH = this.height;
}

Tile.prototype.killAnimation = function() {
    this.isAnimating = false;
    this.finishAnimation = null;
}

Tile.prototype.offScreen = function(a,b) {
    if (b) {
	this.finishAnimation = this.destroy;
    } else {
	this.finishAnimation = this.hide;
    }
    var p = this.parent.ScreenAnchor(a);
    this.moveTo(this.x,p.y,"north west",2);
}

Tile.prototype.update = function(t) {
    if (!this.isAnimating) {
	return false;
    }
    t -= this.startTime;
    t /= this.duration;
    this.left = interpolate(t,this.originX,this.targetX);
    this.top = interpolate(t,this.originY,this.targetY);
    this.width = interpolate(t,this.originW,this.targetW);
    this.height = interpolate(t,this.originH,this.targetH);
    this.rescale();
    if (t > 1) {
	if (this.finishAnimation) {
	    this.finishAnimation();
	    this.finishAnimation = null;
	}
	this.isAnimating = false;
    }
    return true;
}

Tile.prototype.destroy = function() {
    document.body.removeChild(this.element);
    this.parent.removeTile(this);
}

Tile.prototype.remove = function() {
    document.body.removeChild(this.element);
}

Tile.prototype.draggable = function(b) {
    var self = this;
    if (b) {
	this.isDraggable = true;
    } else {
	this.isDraggable = false;
    }
}

Tile.prototype.pointIsIn = function(x,y) {
    x -= this.left;
    y -= this.top;
    if (x < 0 || y < 0 || x > this.width || y > this.height) {
	return false;
    }
    return true;
}

Tile.prototype.checkTouch = function(p) {
    if (!this.isDraggable) {
	return false;
    }
    if (this.pointIsIn(p.x,p.y)) {
	this.offset = {x: p.x - this.left, y: p.y - this.top};
	this.isDragging = true;
	this.element.style.zIndex = 1;
	return true;
    } else {
	return false;
    }
}

Tile.prototype.updateTouch = function(p) {
    if (!this.isDragging) {
	return false;
    }
    this.left = p.x - this.offset.x;
    this.top = p.y - this.offset.y;
    this.setElement("left");
    this.setElement("top");
}

Tile.prototype.endTouch = function(p) {
    if (!this.isDragging) {
	return false;
    }
    this.left = p.x - this.offset.x;
    this.top = p.y - this.offset.y;
    this.setElement("left");
    this.setElement("top");
    if (this.atEndDrag) {
	var self = this;
	this.atEndDrag(self,p);
    }
    this.isDragging = false;
    this.element.style.zIndex = 0;
}

Tile.prototype.savePosition = function(p) {
    var x,y;
    if (p) {
	x = p.x || this.left;
	y = p.y || this.top;
    } else {
	x = this.left;
	y = this.top;
    }	
    this.savedPosition = {x: x, y: y};
}

Tile.prototype.moveToSaved = function() {
    this.moveTo(this.savedPosition.x,this.savedPosition.y,"north west",1);
}
