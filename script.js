let layers = [784, 128, 64, 32, 16, 10];
let collapse = false;


// Function to toggle collapse
function toggleCollapse() {
    collapse = !collapse;
    let button = $('#collapse-btn');
    button.empty();
    if (collapse) {
        button.append('<i class="bi bi-chevron-down"></i>');
    } else {
        button.append('<i class="bi bi-chevron-up"></i>');
    }
}

// Function to display file name using jQuery
function displayFileName() {
    const fileName = $('#file-upload').prop('files')[0]?.name || '';
    $('#file-name').text(fileName);
}

// Function to display layers
function displayLayers() {
    let layerContainer = $('#layer-container');
    layerContainer.empty();
    for (let i = 0; i < layers.length; i++) {
        let layer = `<div class="input-group mb-3">
                <button class="btn btn-secondary layer-btn" type="button" onclick="deleteLayer(${i})">-</button>
                <input type="number" class="form-control layer-input" value="${layers[i]}" data-index="${i}">
                </div>`;
        layerContainer.append(layer);
    }

    // Add event listeners for input changes
    $('.layer-input').on('input', function () {
        let index = $(this).data('index');
        layers[index] = parseInt($(this).val(), 10) || 0; // Update the corresponding layer value
    });
}

// Function to add a layer
function addLayer() {
    let value = $('#layer-input').val();
    layers.push(+value);
    displayLayers();
}

// Function to delete a layer
function deleteLayer(index) {
    layers.splice(index, 1); // Remove element from array
    displayLayers(); // Redraw layers
}

// Function to update scene
function updateScene() {
    drawNeuralNet(layers, 6);
}


// Document ready function
$(document).ready(function () {
    displayLayers();
});
