// Neural Network model with Tensorflow.js
class NeuralNetwork {
    // Class constructor
    // Args:
    //  a - number of input nodes
    //  b - number of hidden nodes
    //  c - number of output nodes
    constructor(a, b, c, d) {
        if (a instanceof tf.Sequential) {
            this.model = a
            this.input_nodes = b
            this.hidden_nodes = c
            this.output_nodes = d
        } else {
            this.input_nodes = a
            this.hidden_nodes = b
            this.output_nodes = c
            this.model = this.createModel()
        }
    }

    // Initialize Tensorflow model
    createModel() {
        return tf.tidy(() => {
            const model = tf.sequential();
            const hidden = tf.layers.dense({
                units: this.hidden_nodes,
                inputShape: [this.input_nodes],
                activation: 'sigmoid'
            });
            model.add(hidden);
            const output = tf.layers.dense({
                units: this.output_nodes,
                activation: 'sigmoid'
            });
            model.add(output);
            return model;
        })
    }

    // Disposal of the current model
    dispose() {
        this.model.dispose();
    }

    // Copy the current model and its attributes
    copy() {
        return tf.tidy(() => {
            const modelCopy = this.createModel()
            const weights = this.model.getWeights()
            const weightCopies = []
            for (let i = 0; i < weights.length; i++) {
                weightCopies[i] = weights[i].clone()
            }
            modelCopy.setWeights(weightCopies)
            return new NeuralNetwork(
                modelCopy,
                this.input_nodes,
                this.hidden_nodes,
                this.output_nodes
            )
        })
    }

    // Predict output values based on the inputs
    predict(inputs) {
        return tf.tidy(() => {
            const xs = tf.tensor2d([inputs]);
            const ys = this.model.predict(xs);
            const outputs = ys.dataSync();
            return outputs;
        });
    }

    // Adjust weights of the layers
    // Args:
    //  rate - chance threshold of weight mutation
    mutate(rate) {
        tf.tidy(() => {
            const weights = this.model.getWeights();
            const mutatedWeights = [];

            for (let i = 0; i < weights.length; i++) {
                let tensor = weights[i];
                let shape = weights[i].shape;
                let values = tensor.dataSync().slice();
                for (let j = 0; j < values.length; j++) {
                    if (Math.random(1) < rate) {
                        let w = values[j];
                        values[j] = w + gaussianRand();
                    }
                }
                let newTensor = tf.tensor(values, shape);
                mutatedWeights[i] = newTensor;
            }
            this.model.setWeights(mutatedWeights);
        });
    }

    // Exchange parts of weight matrices 
    // Args:
    //  crossBrain - the model to exchange values with
    //  rate - chance threshold of weight crossover
    crossover(crossBrain, rate = 0.3) {
        tf.tidy(() => {
            const weights = this.model.getWeights();
            const weightsCross = crossBrain.model.getWeights();
            const mutatedWeights = [];
            const mutatedCrossWeights = [];

            for (let i = 0; i < weights.length; i++) {
                let tensor = weights[i];
                let shape = weights[i].shape;
                let values = tensor.dataSync().slice();
                let tensorCross = weightsCross[i];
                let shapeCross = weightsCross[i].shape;
                let valuesCross = tensorCross.dataSync().slice();

                const temp = values.slice();

                for (let j = 0; j < shape[1]; j++) {
                    if (Math.random() > rate)
                        break

                    // Randomize a section of entries to be exchanged
                    const start = Math.floor(Math.random() * (shape[0] - 1))
                    const end = Math.floor(Math.random() * (shape[0] - start)) % 4 + start
                    for (let k = start; k <= end; k++) {
                        values[k * shape[1] + j] = valuesCross[k * shape[1] + j]
                        valuesCross[k * shape[1] + j] = temp[k * shape[1] + j]
                    }
                }

                let newTensor = tf.tensor(values, shape);
                mutatedWeights[i] = newTensor;
                let newCrossTensor = tf.tensor(valuesCross, shapeCross);
                mutatedCrossWeights[i] = newCrossTensor;
            }
            this.model.setWeights(mutatedWeights);
            crossBrain.model.setWeights(mutatedCrossWeights);
        })
    }
}

// Pseudo-normal distribution randomizer
function gaussianRand() {
    var i = 100
    var res = 0
    while(i--) res += Math.random() - 0.5
    res /= 125

    return res
}

// Pseudo-normal distribution randomizer
function randn_bm() {
    let u = 0, v = 0;
    while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while(v === 0) v = Math.random();
    let num = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
    num = num / 10.0 + 0.5; // Translate to 0 -> 1
    if (num > 1 || num < 0) return randn_bm() // resample between 0 and 1
    return num
  }