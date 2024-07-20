import { layerSizes } from "./main.js";
import { trainData } from "./parse.js";
import { testData } from "./parse.js";

// Function to create a model
function createModel(layerSizes) {
    // Ensure that the array of layer sizes is valid
    if (!Array.isArray(layerSizes) || layerSizes.length === 0) {
        throw new Error('layerSizes must be a non-empty array');
    }

    // Create a sequential model
    const model = tf.sequential();

    // Add layers to the model based on the layerSizes array
    layerSizes.forEach((size, index) => {
        // Input layer needs the input shape to be specified
        if (index === 0) {
            model.add(tf.layers.dense({
                units: size,
                activation: 'relu',
                inputShape: [layerSizes[0]]
            }));
        } else if (index === layerSizes.length - 1) {
            // Last layer with softmax activation
            model.add(tf.layers.dense({
                units: size,
                activation: 'softmax'
            }));
        } else {
            // Hidden layers with relu activation
            model.add(tf.layers.dense({
                units: size,
                activation: 'relu'
            }));
        }
    });

    // Compile the model with default settings for demonstration
    model.compile({
        optimizer: 'adam',
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy']
    });

    return model;
}



async function trainModel(model, trainData, trainLabels) {
    if (!trainData || !trainLabels) {
        throw new Error('Training data and labels must be provided');
    }

    const batchSize = 32;
    const epochs = 10;
    let finalAccuracy;

    await model.fit(trainData, trainLabels, {
        batchSize,
        epochs,
        validationSplit: 0.2,
        callbacks: {
            onEpochEnd: (epoch, logs) => {
                $('#epoch-info').text(`Epoch ${epoch + 1}: loss = ${logs.loss.toFixed(4)}, accuracy = ${logs.acc.toFixed(4)}`);
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

// Handle Render button click
$('#render').on('click', () => {
    let model = createModel(layerSizes);
    model.summary();
});

// Handle Train button click
$('#train').on('click', async () => {
    if (window.currentModel) {
        window.currentModel.dispose();
        window.currentModel = createModel(layerSizes); 
    }
    tf.disposeVariables();

    $('#trainingModal').modal('show');  
    $('.spinner-border').show();  
    $('#epoch-info').show();
    $('#final-score').hide();  

    setTimeout(async () => {
        const model = createModel(layerSizes);
        const oneHotEncodedLabels = tf.oneHot(trainData.labels.map(label => parseInt(label, 10)), 10);

        await trainModel(model, tf.stack(trainData.pixels), oneHotEncodedLabels);
        console.log("Model trained");
    }, 0);
});
