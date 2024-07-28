import { layerSizes } from "./main.js";
import { trainData } from "./parse.js";
import { testData } from "./parse.js";
import { dataAvailable } from "./parse.js";

export let activations = []
export let model;

class CustomModel extends tf.Sequential {
    constructor() {
        super();
    }

    async predictWithActivations(inputTensor) {
        const modelLayers = this.layers;

        if (inputTensor.shape.length === 1) {
            inputTensor = inputTensor.expandDims(0);
        }

    
        let activationTensor = inputTensor;
        const activationsArray = [];
    
        activationsArray.push(Array.from(inputTensor.dataSync()));
        // Perform forward pass through all layers and collect activations
        for (let i = 0; i < modelLayers.length; i++) {
            activationTensor = modelLayers[i].apply(activationTensor);
            const activations = activationTensor.dataSync();
            if(i > 0){
                activationsArray.push(Array.from(activations));
            }
        }
    
        return activationsArray;
    }
}



// Function to create a model
function createModel(layerSizes) {
    if (!Array.isArray(layerSizes) || layerSizes.length === 0) {
        throw new Error('layerSizes must be a non-empty array');
    }

    const model = new CustomModel();
    layerSizes.forEach((size, index) => {
        if (index === 0) {
            model.add(tf.layers.dense({
                units: size,
                activation: 'relu',
                inputShape: [layerSizes[0]]
            }));
        } else if (index === layerSizes.length - 1) {
            model.add(tf.layers.dense({
                units: size,
                activation: 'softmax'
            }));
        } else {
            model.add(tf.layers.dense({
                units: size,
                activation: 'relu'
            }));
        }
    });

    model.compile({
        optimizer: 'sgd',
        loss: 'meanSquaredError',
        metrics: ['accuracy']
    });

    return model;
}

// Function to train a model
async function trainModel(trainData, trainLabels) {
    if (!trainData || !trainLabels) {
        throw new Error('Training data and labels must be provided');
    }

    const batchSize = 32;
    const epochs = 50;
    let finalAccuracy;

    await model.fit(trainData, trainLabels, {
        batchSize,
        epochs,
        validationSplit: 0.2,
        callbacks: {
            onEpochEnd: (epoch, logs) => {
                $('#epoch-info').text(`Epoch ${epoch + 1}: loss = ${logs.loss.toFixed(4)}, accuracy = ${logs.acc.toFixed(4)}`);
                console.log(`Epoch ${epoch + 1}: loss = ${logs.loss.toFixed(4)}, accuracy = ${logs.acc.toFixed(4)}`);
                finalAccuracy = logs.acc;
            },
            onTrainEnd: () => {
                $('#epoch-info').hide();
                $('#final-score').text(`Training finished. Final accuracy: ${finalAccuracy.toFixed(4)}`).show();
                $('.spinner-border').hide();
            }
        }
    });
}

// Handle Train button click
$('#train').on('click', async () => {
    if (!dataAvailable) {
        alert("Data is not available. Please load the data before training the model.");
        return;
    }

    if (model) {
        model.dispose();
    }
    tf.disposeVariables();

    $('#trainingModal').modal('show');
    $('.spinner-border').show();
    $('#epoch-info').show();
    $('#final-score').hide();

    // Use a slight delay to ensure the UI has time to update
    setTimeout(async () => {
        // Force browser to repaint before starting training
        requestAnimationFrame(async () => {
            model = createModel(layerSizes);
            const oneHotEncodedLabels = tf.oneHot(trainData.labels.map(label => parseInt(label, 10)), 10);

            await trainModel(tf.stack(trainData.pixels), oneHotEncodedLabels);
            console.log("Model trained");

        });
    }, 0); 
});

