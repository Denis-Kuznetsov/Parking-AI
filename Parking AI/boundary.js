// Boundary class
class Boundary {
    // Class constructor
    // Args:
    //  x1 - X-coord of the first point
    //  y1 - Y-coord of the first point
    //  x2 - X-coord of the second point
    //  y2 - Y-coord of the second point
    //  color - line color
    constructor(x1, y1, x2, y2, color = 'black') {
        this.a = new Point(x1, y1)
        this.b = new Point(x2, y2)
        this.color = color
    }

    // Change boundary color to the given one
    setColor(color) {
        this.color = color
    }

    // Display the boundary on the field
    draw() {
        c.beginPath()
        c.moveTo(this.a.x, this.a.y)
        c.lineTo(this.b.x, this.b.y)
        c.lineWidth = 3
        c.strokeStyle = this.color
        c.stroke()
    }
}