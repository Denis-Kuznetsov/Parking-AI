// Vector class
class Vector {
    // Class constructor
    // Args:
    //  if type is 'position':
    //      a - X-coord of the vector
    //      b - Y-coord of the vector
    //  if type is 'angle':
    //      a - direction angle of the vector
    constructor(a = 0, b = 0, type = 'position') {
        if (type === 'position') {
            this.x = a
            this.y = b
        } else if (type === 'angle') {
            this.x = Math.cos(a)
            this.y = Math.sin(a)
        }
    }

    // Add up another vector
    add(vec) {
        this.x = this.x + vec.x
        this.y = this.y + vec.y
    }

    // Substract another vector
    sub(vec) {
        this.x -= vec.x
        this.y -= vec.y
    }

    // Limit the vector values to the given value
    limit(limit) {
        this.x = Math.abs(this.x) > limit ? limit : this.x
        this.y = Math.abs(this.y) > limit ? limit : this.y
    }

    // Set the vector coords to the given ones
    set(x, y) {
        this.x = x
        this.y = y
    }

    // Calculate the length
    length() {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2))
    }

    // Set the vector magnitude
    setMagnitude(magnitude) {
        const len = this.length()
        this.x *= magnitude / len
        this.y *= magnitude / len
    }

    // Calculate the direction angle
    direction() {
        if (this.x == 0)
            return 0
        if (this.x < 0) 
            return Math.atan(this.y / this.x) + Math.PI
        return Math.atan(this.y / this.x)
    }
}