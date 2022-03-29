// Player class
class Player {
    // Class constructor
    // Args: 
    //  x - X coord of the player
    //  y - Y coord of the player
    //  color - border color of the player's boundary
    //  brain - neural network model
    constructor(x = 670, y = 540, color = 'green', brain = null) {
        this.x = x
        this.y = y
        this.color = color

        // Car width
        this.width = 42
        // Car height
        this.height = 98

        // Player's velocity
        this.velocity = 0
        // Rotation angle
        this.angle = 0
        // Desired velocity at the moment
        this.desiredVelocity = 0

        // Acceleration constant
        this.acceleration = 0.25
        // Rotation degree constant
        this.rotation = Math.PI / 60
        // Max velocity constant
        this.maxVelocity = 110

        // Initialise canvas path
        this.path = new Path2D()
        //Initialise tranformation matrix
        this.matrix = new DOMMatrix()

        // Initialise the car texture
        this.img = new Image()
        this.img.src = 'car.png'

        // Initialise score and fitness
        this.score = 0
        this.fitness = 0

        // Flag if the player parked
        this.parked = false

        // Initialise vision rays
        this.rays = []
        for (let i = 0; i < 8; i++) {
            this.rays.push(new Ray(new Point(this.x + this.width / 2, this.y + this.height / 2), i * Math.PI / 4))
        }

        // Initialise parking distance and time
        this.parkingDist = Infinity
        this.parkedTime = 0

        // Initialise neural network model
        if (brain != null)
            this.brain = brain.copy()
        else {
            this.brain = new NeuralNetwork(12, 36, 4)
        }
    }

    // Copy another player's attributes
    // Args:
    //  playerCopy - player class object to copy the attributes from
    copy(playerCopy) {
        this.x = playerCopy.x
        this.y = playerCopy.y
        this.color = playerCopy.color
        this.width = playerCopy.width
        this.height = playerCopy.height
        this.velocity = playerCopy.velocity
        this.angle = playerCopy.angle

        this.acceleration = playerCopy.acceleration
        this.rotation = playerCopy.rotation

        this.path = playerCopy.path
        this.matrix = playerCopy.matrix
        this.img = playerCopy.img
        this.img.src = playerCopy.img.src

        this.rays = playerCopy.rays
        this.parkingDist = playerCopy.parkingDist
        this.parkedTime = playerCopy.parkedTime

        this.brain = playerCopy.brain.copy()
        this.score = playerCopy.score
        this.fitness = playerCopy.fitness
        this.parked = playerCopy.parked

        return this
    }

    // Reset player's attributes
    reset(x, y) {
        this.x = x
        this.y = y
        this.velocity = 0
        this.angle = 0
        this.desiredVelocity = 0

        this.path = null
        this.path = new Path2D()
        this.matrix = null
        this.matrix = new DOMMatrix()
        this.img = new Image()
        this.img.src = 'car.png'

        this.rays = []
        for (let i = 0; i < 8; i++) {
            this.rays.push(new Ray(new Point(this.x + this.width / 2, this.y + this.height / 2), i * Math.PI / 4))
        }

        this.parkingDist = Infinity
        this.parkedTime = 0

        this.score = 0
        this.fitness = 0
        this.parked = false
    }

    // Load a player from server
    async load() {
        const fileUrl = 'http://localhost:3000/best_player/'

        await fetch(fileUrl)
        .then( r => r.json() )
        .then( t => {
            let newBrain = NeuralNetwork.deserialize(t)
            let newPlayer = new Player(670, 540, 'green', newBrain)
            return this.copy(newPlayer)
        } )
    }

    // Update distance to parking spot
    // Args:
    //  parking - Car class object to calculate the distance
    update_parking(parking) {
        this.parkingDist = Math.sqrt(Math.pow(this.x + this.width / 2 - parking.x - parking.width / 2, 2) + 
            Math.pow(this.y + this.height / 2 - parking.y - parking.height / 2, 2))

        return this.parkingDist
    }

    // Update distances to obstacles for each vision ray
    // Args:
    //  boundaries - array of all boundaries as Boundary class objects
    update_rays(boundaries) {
        for (let ray of this.rays) {
            let closest = null
            let record = 500
            
            for (let boundary of boundaries) {
                const point = ray.cast(boundary)
                if (point) {
                    const distance = Math.sqrt(Math.pow((ray.position.x - point.x), 2) + Math.pow((ray.position.y - point.y), 2))
                    if (distance < record) {
                        record = distance
                        closest = point
                    }
                }
            }

            if (closest) {
                ray.lookAt(closest.x, closest.y)
                ray.color = 'green'
            } else {
                ray.direction.x *= 1000
                ray.direction.y *= 1000
                ray.distance = Math.sqrt(Math.pow(ray.direction.x, 2) + Math.pow(ray.direction.y, 2))
            }
        }
    }

    // Initialise inputs, get player's decision
    // Args:
    //  parking - Car class object to calculate distance
    think(parking) {
        // Update parking distance
        this.update_parking(parking)
        let inputs = []

        // Add as inputs the distance to obstacles from vision rays
        for (let ray of this.rays) {
            inputs.push(ray.distance <= 500 ? (500 - ray.distance) / 500 : 0)
        }
        
        // Add to inputs the difference of X and Y coordinates between centers of player and the parking spot
        inputs.push(this.x + this.width / 2 - parking.x - parking.width / 2)
        inputs.push(this.y + this.height / 2 - parking.y - parking.height / 2)
        // Add to inputs the current velocity to max velocity ratio
        inputs.push(this.velocity / this.maxVelocity)
        // Add to inputs the information of the player has parked
        inputs.push(this.parked ? 1 : 0)

        // Get player's decision
        let output = this.brain.predict(inputs);
        
        // Get the desired velocity: from -maxVelocity to maxVelocity
        this.desiredVelocity = (output[0] - 0.5) * 2 * this.maxVelocity

        // If there is enough speed, get the rotation angle: from -rotation to rotation
        if (Math.abs(this.velocity) > 4 * this.acceleration)
            this.angle += Math.sign(this.velocity) * (output[1] - 0.5) * 2 * this.rotation
    }

    // Update the fitness value
    update_fitness(value) {
        this.fitness = value
    }

    // Mutate the NN model weights
    mutate(value) {
        this.brain.mutate(value)
    }

    // Crossover the NN model weights with another player
    crossover(crossPlayer) {
        this.brain.crossover(crossPlayer.brain)
    }

    // Check if the player collides with any obstacle
    isCollide() {
        for (let i = 0; i < this.rays.length; i += 4) {
            if (this.rays[i].distance < this.width / 2) {
                return true
            }
        }
        for (let i = 2; i < this.rays.length; i += 4) {
            if (this.rays[i].distance < this.height / 2) {
                return true
            }
        }
        for (let i = 1; i < this.rays.length; i += 2) {
            if (this.rays[i].distance < Math.sqrt(2) * this.width / 2) {
                return true
            }
        }
        return false
    }

    // Check if the player is parked
    isParked(spot) {
        let count = 0

        // if the player is close enough, calculate the area of the taken space
        if (this.parkingDist < 30) {
            const path = new Path2D()
            path.addPath(this.path, this.matrix)

            for (let x = spot.x; x < spot.x + spot.width; x++)
                for (let y = spot.y; y < spot.y + spot.height; y++) {
                    if (c.isPointInPath(path, x, y))
                        count++
                }
        }

        // a player is considered parked, if the their car takes more than 75% of the parking area
        if (count > 0.75 * spot.width * spot.height) {
            this.score += 18
            this.parked = true
            return true
        }
        this.parked = false
        return false
    }

    // Update the player position
    update() { 
        let change = 0

        // calculate the acceleraion at the current moment
        let acc = (this.desiredVelocity - this.velocity) % (this.acceleration * 3.5)
        // update the velocity
        this.velocity +=  acc //(acc + Math.sign(acc) * acc * acc / 2)

        // reduce player's speed and convert velocity to the log-fittable value 
        if (this.velocity > 0) {
            if (this.velocity > this.maxVelocity)
                this.velocity = this.maxVelocity
            this.velocity = this.velocity - this.acceleration * (1.5 + this.velocity / 100)
            this.velocity = this.velocity > 0 ? this.velocity : 0
            change = this.velocity
        } else if (this.velocity < -this.maxVelocity * 0.6) {
            this.velocity = -this.maxVelocity * 0.6
            change = 1 / (1 - this.velocity) - 1
        } else if (this.velocity < 0) {
            this.velocity = this.velocity + this.acceleration * (2 + this.velocity / 100)
            this.velocity = this.velocity < 0 ? this.velocity : 0
            change = 1 / (1 - this.velocity) - 1
        }

        // update player coordinates
        this.x = this.x - Math.log(change + 1) * Math.cos(this.angle + Math.PI / 2)
        this.y = this.y - Math.log(change + 1) * Math.sin(this.angle + Math.PI / 2)
        
        // update rotation of vision rays
        this.rays = []
        for (let i = 0; i < 8; i++) {
            this.rays.push(new Ray(new Point(this.x + this.width / 2, this.y + this.height / 2), i * Math.PI / 4 + this.angle))
        }

        // update transformation matrix for canvas path
        c.save()
        this.path = new Path2D()
        this.path.rect(this.x, this.y, this.width, this.height)
        
        c.translate(this.x + 0.5 * this.width, this.y + 0.5 * this.height)
        c.rotate(-Math.PI + this.angle)
        c.translate(-(this.x + 0.5 * this.width), -(this.y + 0.5 * this.height))
        this.matrix = c.getTransform()
        c.restore()
    }

    // Display player on the field
    draw() {
        c.save()
        this.path = new Path2D()
        this.path.rect(this.x, this.y, this.width, this.height)
        
        // get tranformation matrix
        c.translate(this.x + 0.5 * this.width, this.y + 0.5 * this.height)
        c.rotate(-Math.PI + this.angle)
        c.translate(-(this.x + 0.5 * this.width), -(this.y + 0.5 * this.height))
        this.matrix = c.getTransform()
        
        // draw car image
        c.drawImage(this.img, this.x - 2.5, this.y, this.width + 5, this.height)
        c.restore()

        /// draw vision rays
        // for (let ray of this.rays) {
        //     ray.show()
        // }
    }
}