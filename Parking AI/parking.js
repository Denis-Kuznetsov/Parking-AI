// Parking field class
class Parking {
    // Class constructor
    // Args:
    //  x - X-coord of the top-left corner of the field
    //  y - Y-coord of the top-left corner of the field
    constructor(x, y) {
        this.x = x
        this.y = y
        this.img = new Image()
        this.img.src = './cars/parking.png'
    }

    // Display the field
    draw() {
        c.drawImage(this.img, this.x, this.y, 880, 600)
    }
}