// Defining constants
const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')
// Slider
const slider = document.getElementById('myRange')
// Save button
const button = document.getElementById('save-button')
// Show 10 button
const showBest = document.getElementById('show-best')
// Show All button
const showAll = document.getElementById('show-all')
// Generation count paragraph
const generationCount = document.getElementById('generation')
// Level count paragraph
const levelCount = document.getElementById('level')
// Count of parked cars
const parkedCarsCount = document.getElementById('parked-cars')

// Canvas width
canvas.width = innerWidth
// Canvas height
canvas.height = innerHeight

let showClosest = false
const randomSize = 10

const GenSize = 200

let keysPressed = {}

window.onscroll = null

// Main game coordinator class
class Game {
    constructor() {
        // Initialize array of players and finished players
        this.players = []
        this.finishedPlayers = []

        tf.setBackend('cpu')

        // Initialize array of parked cars
        this.cars = []

        // Generation Count
        this.genCount = 1
        // Level count
        this.level = 0
        // Number of parked cars
        this.parkedCount = 0

        // Left X-coord of left parked cars
        this.leftBorder = 405
        // Left X-coord of right parked cars
        this.rightBorder = 868
        // Top Y-coord of parked cars
        this.startTop = 145
        
        // Width of a parking lot
        this.parkingWidth = 56
        
        // Width and height of cars
        this.carW = 95
        this.carH = 40

        // Randomize the position of the parking spot
        let posR = null
        let posL = null
        if (Math.random() > 0.5) {
            posR = Math.floor(Math.random() * 2 + 2)
            console.log(posR)
        } else {
            posL = Math.floor(Math.random() * 2 + 2)
            console.log(posL)
        }

        // Initialize all the parked cars and the parking spot
        for (let i = 0; i < 6; i++)
            if (posL == i)
                this.parkingSpot = new Car(this.leftBorder, this.startTop + this.parkingWidth * i, this.carW, this.carH + 4, 'red', 'right', true)
            else
                this.cars.push(new Car(this.leftBorder, this.startTop + this.parkingWidth * i, this.carW, this.carH, 'black', 'left'))
        
        for (let i = 0; i < 6; i++)
            if (posR == i)
                this.parkingSpot = new Car(this.rightBorder, this.startTop + this.parkingWidth * i, this.carW, this.carH + 4, 'red', 'right', true)
            else
                this.cars.push(new Car(this.rightBorder, this.startTop + this.parkingWidth * i, this.carW, this.carH, 'black', 'right'))
        
        
        // Initialize all the players
        for (let i = 0; i < GenSize; i++) {
            this.players.push(new Player(670, 540, 'green'))
            this.players[i].update_parking(this.parkingSpot)
        }
       
        // Game ticks
        this.ticks = 0
        this.time = Date.now()

        // Initialize boundaries of the parked cars
        this.carBoundaries = []
        for (let car of this.cars) {
            this.carBoundaries.push(new Boundary(car.x, car.y, car.x + car.width, car.y))
            this.carBoundaries.push(new Boundary(car.x + car.width, car.y, car.x + car.width, car.y + car.height))
            this.carBoundaries.push(new Boundary(car.x + car.width, car.y + car.height, car.x, car.y + car.height))
            this.carBoundaries.push(new Boundary(car.x, car.y, car.x, car.y + car.height))
        }

        // Initialize boundaries for the game field
        this.topBoundary = new Boundary(250, 50, 1130, 50)
        this.rightBoundary = new Boundary(1130, 50, 1130, 650)
        this.botBoundary = new Boundary(250, 650, 1130, 650)
        this.leftBoundary = new Boundary(250, 50, 250, 650)
            
        this.fieldBoundaries = [this.topBoundary, this.rightBoundary, this.botBoundary, this.leftBoundary]

        // Initialize the game field class
        this.parking = new Parking(this.topBoundary.a.x, this.topBoundary.a.y)
    }

    // Save the obj to JSON txt file
    save(obj, filename) {
        download(JSON.stringify(obj), filename, 'text/plain')
    }

    // Reset main variables and initialize new field
    nextLevel() {
        this.finishedPlayers = []

        this.cars = []

        this.parkedCount = 0

        // Randomize the position of the parking spot
        let posR = null
        let posL = null
        if (Math.random() > 0.5) {
            posR = Math.floor(Math.random() * 5) + 1
            console.log(posR)
        } else {
            posL = Math.floor(Math.random() * 5) + 1
            console.log(posL)
        }

        // Initialize parked cars and the parking spot
        for (let i = 0; i < 6; i++)
            if (posL == i)
                this.parkingSpot = new Car(this.leftBorder, this.startTop + this.parkingWidth * i, this.carW, this.carH + 4, 'red', 'right', true)
            else
                this.cars.push(new Car(this.leftBorder, this.startTop + this.parkingWidth * i, this.carW, this.carH, 'black', 'left'))
        
        for (let i = 0; i < 6; i++)
            if (posR == i)
                this.parkingSpot = new Car(this.rightBorder, this.startTop + this.parkingWidth * i, this.carW, this.carH + 4, 'red', 'right', true)
            else
                this.cars.push(new Car(this.rightBorder, this.startTop + this.parkingWidth * i, this.carW, this.carH, 'black', 'right'))

        // Initialize new players
        for (let i = 0; i < GenSize; i++) {
            this.players.push(new Player(670, 540, 'green'))
            this.players[i].update_parking(this.parkingSpot)
        }
       
        // Reset main variables and car boundaries
        this.parkedTime = 0
        this.parkedCount = 0
        this.ticks = 0
        this.time = Date.now()
        this.carBoundaries = []
        for (let car of this.cars) {
            this.carBoundaries.push(new Boundary(car.x, car.y, car.x + car.width, car.y))
            this.carBoundaries.push(new Boundary(car.x + car.width, car.y, car.x + car.width, car.y + car.height))
            this.carBoundaries.push(new Boundary(car.x + car.width, car.y + car.height, car.x, car.y + car.height))
            this.carBoundaries.push(new Boundary(car.x, car.y, car.x, car.y + car.height))
        }
    }

    // Search for the best players
    best() {
        const bestPlayers = this.players
        bestPlayers.sort((a, b) => b.score - a.score)
        return bestPlayers
    }

    // Draw and update all the players, proceed to next generation if neccessary
    display() {
            // Clear the canvas
            c.setTransform(1, 0, 0, 1, 0, 0);
            c.clearRect(0, 0, canvas.width, canvas.height)

            // Update screen info
            generationCount.innerText = this.genCount
            levelCount.innerText = this.level
            parkedCarsCount.innerText = this.parkedCount

            // Draw Parking field
            this.parking.draw()

            // Draw the parked cars
            for (let car of this.cars) {
                car.draw()
            }    

            // Draw Parking spot
            this.parkingSpot.draw()

            // Draw field boundaries
            for (let boundary of this.fieldBoundaries)
                boundary.draw()

            
            // If the button is clicked, show the 10 closest players to the parking spot
            if (showClosest) {
                this.update_players()
                for (let i = 0; i < 10; i++) {
                    this.players[i].draw()
                }
            // Else draw all players
            } else
                for (let player of this.players) {
                    player.draw()
                }
            
            // Slider control of the computation speed per updated frame
            for (let j = 0; j < slider.value; j++) {
                // update game ticks
                this.ticks++
                
                // if the time limit is reached, clear all the players
                if (this.ticks > 400)
                    // remove the current players
                    for (let i = this.players.length - 1; i >= 0; i--) {
                        this.finishedPlayers.push(this.players.splice(i, 1)[0])
                    }
                
                // If there are no players left, proceed to the next generation
                if (this.players.length == 0) {
                     // For each player update the distance to parking spot,
                    // and update the score based on how far the player is at the end of the game
                    for (let player of this.finishedPlayers) {
                        player.update_parking(this.parkingSpot)
                        player.score += (200 - player.parkingDist) * 5
                        player.score += (Math.abs(Math.cos(player.angle)) - 1) * 10
                    }
                    // Increase generation count
                    this.genCount++
                    
                    // Initialize new generation
                    this.nextGeneration(0.1)

                    // Save the array of players to JSON txt file
                    /*** 
                    if (this.genCount % 100 == 0)
                        this.save(this.players, 'players_gen_' + this.genCount + '.txt')
                    ***/

                    // Reset the game properties
                    game.clear()
                    break
                }
                
                // Get player decisions, update their position and vision rays
                for (let player of this.players) {
                    player.score -= this.ticks % 2
                    player.think(this.parkingSpot)
                    player.update()
                    player.update_rays([...this.carBoundaries, ...this.fieldBoundaries])
                }

                // Check if players collide with any obstacle
                for (let i = this.players.length - 1; i >= 0; i--)
                    if (this.players[i].isCollide()) {
                        this.players[i].score -= 300
                        this.finishedPlayers.push(this.players.splice(i, 1)[0])
                    }
                
                // Check if players are parked
                this.parkingSpot.color = 'red'
                for (let i = this.players.length - 1; i >= 0; i--) {
                    // If not parked reset the parked time
                    if (!this.players[i].isParked(this.parkingSpot)) {
                        this.players[i].parkedTime = 0
                    } else {
                        this.parkingSpot.color = 'green'
                        this.players[i].parkedTime++

                        // Player is considered fully parked if they stay at the parking spot for more than 50 ticks
                        if (this.players[i].parkedTime > 50 && Math.abs(this.players[i].velocity) < 0.3) {
                            this.players[i].score += 7000
                            
                            // Initialize fitness as max value: 1
                            this.players[i].fitness = 1
                            this.parkedCount++
                            this.finishedPlayers.push(this.players.splice(i, 1)[0])
                        }
                    }
                }

                // If more than 10% of all players have parked, proceed to the next level
                if (this.parkedCount > GenSize * 0.1) {
                    for (let i = this.players.length - 1; i >= 0; i--) {
                        this.players[i].brain.dispose()
                        this.players.splice(i, 1)[0]
                    }
                    // this.save(this.finishedPlayers, 'winners_gen_' + this.genCount + '_LVL' + this.level + '.txt')
                    
                    this.nextGeneration(0.04)
                    this.genCount++
                    this.nextLevel()
                    this.level++
                    break
                }
            }
    }

    // Sort the players by the distance to the parking spot
    update_players() {
        this.players.sort((a, b) => b.parkingDist - a.parkingDist)
    }

    // Update the fitness all of players, mutate and crossover the gens, initialize new players
    // Args: mutRate - the chance of mutation
    nextGeneration(mutRate) {
        // Calculate fitness
        this.calculateFitness()
        this.players = []
        
        // Pick 2 players crossover ther weights and mutate them
        for (let i = 0; i < GenSize; i += 2) {
            this.players.push(this.pickOne())
            this.players.push(this.pickOne())
            this.players[i].crossover(this.players[i + 1])
            this.players[i].mutate(mutRate)
            this.players[i + 1].mutate(mutRate)
        }

        // Disposal of used tensors
        for (let i = 0; i < this.finishedPlayers.length; i++) {
            this.finishedPlayers[i].brain.dispose()
        }
    }
    
    // Pick one player in tournament
    pickOne() {
        if (this.finishedPlayers.length == GenSize) {
            let index = 0
            let r = Math.random()

            while (r > 0 && index < this.finishedPlayers.length) {
                r = r - this.finishedPlayers[index].fitness
                index++
            }
            index--

            // In case of too low performace of the chosen player, pick a random player instead
            if (this.finishedPlayers[index].fitness < 1 / (1.75 * GenSize))
                index = Math.floor(Math.random() * this.finishedPlayers.length)
            
            // Initialize new player
            let player = this.finishedPlayers[index]
            let newPlayer = new Player(650, 540, 'green', player.brain)
            return newPlayer
        }

        // For the next level, with only winners provided, return a random winner
        let player = this.finishedPlayers[Math.floor(Math.random() * this.finishedPlayers.length)]
        let newPlayer = new Player(650, 540, 'green', player.brain)
        return newPlayer
    }
    
    // Calculate fitness value (from 0 to 1) for all players, all negative scores are considered as 0 fitness
    calculateFitness() {
        let sum = 0
        for (let player of this.finishedPlayers) {
            sum += player.score > 0 ? player.score : 0
        }
        
        for (let i = 0; i < this.finishedPlayers.length; i++) {
            const fitness = this.finishedPlayers[i].score > 0 ? this.finishedPlayers[i].score / sum : 0
            if (this.finishedPlayers[i].fitness != 1)
                this.finishedPlayers[i].update_fitness(fitness)
        }
    }

    // Reset game's main variables
    clear() {
        c.resetTransform()
        this.finishedPlayers = []

        this.ticks = 0

        // Reset player game variables
        for (let i = 0; i < this.players.length; i++) {
            this.players[i].reset(670, 540)
        }

        // Update parking distance
        for (let i = 0; i < this.players.length; i++) {
            this.players[i].update_parking(this.parkingSpot)
        }

        this.parkedTime = 0
        this.parkedCount = 0
        this.time = Date.now()
    }
}

// Initialization of the game
const game = new Game()

// Update the game on each frame
function animate() {
    requestAnimationFrame(animate)
    game.display()
}

// Array of pressed keys to control a car manually
addEventListener("keydown", (event) => {
    keysPressed[event.keyCode] = true
})

addEventListener('keyup', (event) => {
    delete keysPressed[event.keyCode]
})


// Download the txt file with the given content
// Args: 
//     content - string of content to save
//     fileName - name of the txt file
//     contentType - type of content saved
function download(content, fileName, contentType = 'text/plain') {
    var a = document.createElement("a");
    var file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}

// Save current players on button click
button.onclick = () => {
    game.save(game.players)
}

// Update the flag to show 10 closest players
showBest.onclick = () => {
    showClosest = !showClosest
}

// Update the flag to show all players
showAll.onclick = () => {
    showClosest = false
}

// Run the recursive frame update
animate()