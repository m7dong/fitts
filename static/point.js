function Point(x, y) {
	this.x = x;
	this.y = y;
}

Point.prototype.getDistance = function(toPoint) {
    return Math.hypot(toPoint.x - this.x, toPoint.y - this.y);
};

Point.prototype.relativePosition = function(top, left) {
	newX = this.x - left,
    newY = this.y - top;
	var newPoint = new Point(newX, newY);
    return newPoint;
};

Point.prototype.normalizedPosition = function(width, height) {
	newX = this.x / width,
    newY = this.y / height;
	var newPoint = new Point(newX, newY);
    return newPoint;
};

Point.prototype.isEqual = function(point) {
	if ((this.x == point.x) && (this.y == point.y)) {
		return true
	}
	return false
};

Point.prototype.asString = function(point) {
	return "(" + this.x.toString() + ", " + this.y.toString() + ")"
};
