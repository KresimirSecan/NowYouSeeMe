import { layerSizes } from "./main.js";



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
      loss: 'categoricalCrossentropy'
    });
  
    return model;
  }
  
  $('#render').on('click', ()=>{
    let model = createModel(layerSizes);
    model.summary();
  });