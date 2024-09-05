import { layerSizes } from "./render.js";
import { trainData } from "./parse.js";
import { testData } from "./parse.js";
import { dataAvailable } from "./parse.js";

export let activations = [];
export let model;
let stopTraining = false;

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

async function trainModel(trainData, trainLabels, epochs = 10, batchSize = 32) {
    if (!trainData || !trainLabels) {
        throw new Error('Training data and labels must be provided');
    }

    stopTraining = false;

    let finalAccuracy;

    await model.fit(trainData, trainLabels, {
        batchSize,
        epochs,
        validationSplit: 0.2,
        callbacks: {
            onEpochEnd: (epoch, logs) => {
                if (stopTraining) {
                    model.stopTraining = true;
                }
                $('#epoch-info').text(`Epoch ${epoch + 1}: loss = ${logs.loss.toFixed(4)}, accuracy = ${logs.acc.toFixed(4)}`);
                console.log(`Epoch ${epoch + 1}: loss = ${logs.loss.toFixed(4)}, accuracy = ${logs.acc.toFixed(4)}`);
                finalAccuracy = logs.acc;
            },
            onTrainEnd: () => {
                if (!stopTraining) {
                    $('#epoch-info').hide();
                    $('#final-score').text(`Training finished. Final accuracy: ${finalAccuracy.toFixed(4)}`).show();
                    $('.spinner-border').hide();
                    $('#accuracy-display').text(`Accuracy: ${(finalAccuracy * 100).toFixed(2)}%`).show();
                } else {
                    $('#epoch-info').text('Training was canceled.');
                }
            }
        }
    });
}

async function predictAndCalculateAccuracy(testData, testLabels) {
    if (!testData || !testLabels || !model) {
        throw new Error('Test data, labels, and trained model must be provided');
    }

    if (Array.isArray(testData)) {
        testData = tf.stack(testData);
    }

    if (Array.isArray(testLabels)) {
        testLabels = tf.tensor(testLabels);
    }

    if (testLabels.shape.length > 1) {
        testLabels = testLabels.argMax(1);
    }

    const predictions = model.predict(testData);

    const predictedLabels = predictions.argMax(1).dataSync();

    const actualLabels = testLabels.dataSync();

    console.log("Predicted Labels:", predictedLabels);
    console.log("Actual Labels:", actualLabels);

    let correctPredictions = 0;
    for (let i = 0; i < predictedLabels.length; i++) {
        if (predictedLabels[i] === +actualLabels[i]) {
            correctPredictions++;
        }
    }
    const accuracy = (correctPredictions / predictedLabels.length) * 100;

    console.log(`Accuracy on test data: ${accuracy.toFixed(2)}%`);
    return accuracy;
}



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

            const testAccuracy = await predictAndCalculateAccuracy(testData.pixels, testData.labels);
            $('#accuracy-display').text(`Test Accuracy: ${testAccuracy.toFixed(2)}%`).show();
        });
    }, 0); 
});


$('#trainingModal').on('hidden.bs.modal', function () {
    stopTraining = true;
});
