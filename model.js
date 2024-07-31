import { layerSizes } from "./main.js";
import { trainData } from "./parse.js";
import { testData } from "./parse.js";
import { dataAvailable } from "./parse.js";

export let activations = [];
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

        for (let i = 0; i < modelLayers.length; i++) {
            activationTensor = modelLayers[i].apply(activationTensor);
            const activations = activationTensor.dataSync();
            if (i > 0) {
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
                activation: 'relu6',
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
                activation: 'relu6'
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

// Function to train  model
async function trainModel(trainData, trainLabels, epochs = 10, batchSize = 32) {
    if (!trainData || !trainLabels) {
        throw new Error('Training data and labels must be provided');
    }

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
                $('#accuracy-display').text(`Accuracy: ${(finalAccuracy * 100).toFixed(2)}%`).show();
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

    const epochs = parseInt($('#epochs').val()) || 10;
    const batchSize = parseInt($('#batchSize').val()) || 32;

    if (model) {
        model.dispose();
    }
    tf.disposeVariables();

    $('#trainingModal').modal('show');
    $('.spinner-border').show();
    $('#epoch-info').show();
    $('#final-score').hide();

    setTimeout(async () => {
        requestAnimationFrame(async () => {
            model = createModel(layerSizes);
            await trainModel(trainData.pixels, trainData.labels, epochs, batchSize);
            console.log("Model trained");
        });
    }, 0); 
});
