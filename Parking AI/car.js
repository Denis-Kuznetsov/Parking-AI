// Car class
class Car {
    // Class constructor
    // Args:
    //  x - X-coord of the top-left corner of the car
    //  y - Y-coord of the top-left corner of the car
    //  width - width of the car
    //  height - height of the car
    //  color - color of the car boundary
    //  direction - direction of the front facet
    //  stroke - flag if show car boundary
    constructor(x, y, width, height, color, direction='left', stroke=false) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.color = color
        this.stroke = stroke

        this.path = new Path2D()
        this.img = new Image()
        if (!stroke)
            if (direction == 'left')
                this.img.src = 'cars/car' + (Math.floor(Math.random() * 5) + 1) + ' left.png'
            else if (direction == 'right')
                this.img.src = 'cars/car' + (Math.floor(Math.random() * 5) + 1) + '.png'
    }

    // Display the car on the field
    draw() {
        c.fillStyle = this.color
        if (!this.stroke) {
            c.drawImage(this.img, this.x - 2.5, this.y - 5, this.width + 5, this.height + 10)
        } else {
            c.strokeStyle = this.color
            c.lineWidth = 3.5
            c.strokeRect(this.x, this.y, this.width, this.height)
        }
    }
}