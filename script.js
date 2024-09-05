let layers = [784, 128, 64, 32, 10];
let collapse = false;


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

function displayFileName() {
    const fileName = $('#file-upload').prop('files')[0]?.name || '';
    $('#file-name').text(fileName);
}

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

    $('.layer-input').on('input', function () {
        let index = $(this).data('index');
        layers[index] = parseInt($(this).val(), 10) || 0; 
    });
}

function addLayer() {
    let value = $('#layer-input').val();
    layers.push(+value);
    displayLayers();
}

function deleteLayer(index) {
    if(layers.length !== 2){
        layers.splice(index, 1); 
        displayLayers(); 
    } else {
        alert("Can't have less than 2 layers.")
    }
}

$(document).ready(function () {
    displayLayers();
});
