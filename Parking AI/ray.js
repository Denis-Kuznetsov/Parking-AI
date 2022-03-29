// Ray class
class Ray {
    // Class constructor
    // Args:
    //  position - a point (or vector) class object of the starting position of the ray
    //  angle - direction angle from X-axis 
    //  color - color of the line
    constructor(position, angle, color = 'red') {
        this.position = position
        this.direction = new Point(Math.cos(angle), Math.sin(angle))
        this.distance = Math.sqrt(Math.pow(this.direction.x, 2) + Math.pow(this.direction.y, 2))
        this.color = color
    }

    // Display the ray on the screen
    show() {
        c.beginPath()
        c.moveTo(this.position.x, this.position.y)
        c.lineTo(this.position.x + this.direction.x, this.position.y + this.direction.y)
        c.lineWidth = 2
        c.strokeStyle = this.color
        c.stroke()
    }

    // Change the direction of the vector to the given point
    lookAt(x, y) {
        this.direction.x = x - this.position.x
        this.direction.y = y - this.position.y
        this.distance = Math.sqrt(Math.pow(this.direction.x, 2) + Math.pow(this.direction.y, 2))
    }

    // Calculate, if exists, the intersection point with the given boundary
    cast(wall) {
        const x1 = wall.a.x;
        const y1 = wall.a.y;
        const x2 = wall.b.x;
        const y2 = wall.b.y;
    
        const x3 = this.position.x;
        const y3 = this.position.y;
        const x4 = this.position.x + this.direction.x;
        const y4 = this.position.y + this.direction.y;
    
        const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        if (den == 0) {
            return;
        }
    
        const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
        const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;
        
        if (t > 0 && t < 1 && u > 0) {
            const point = new Point();
            point.x = x1 + t * (x2 - x1);
            point.y = y1 + t * (y2 - y1);
            return point;
        } else {
            return;
        }
      }
}