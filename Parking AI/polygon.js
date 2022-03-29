// Polygon class
class Polygon {
    // Class constructor
    // Args:
    //  topLeft - point (or vector) class object of the top left coordinate
    //  topRight - point (or vector) class object of the top right coordinate
    //  botRight - point (or vector) class object of the bottom right coordinate
    //  botLeft - point (or vector) class object of the bottom left coordinate
    constructor(topLeft, topRight, botRight, botLeft) {
        this.topLeft = topLeft
        this.topRight = topRight
        this.botRight = botRight
        this.botLeft = botLeft

        this.Points = [this.topLeft, this.topRight, this.botRight, this.topLeft]
    }
}
