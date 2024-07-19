let layers = [784,128,64,32,16,10];

let collapse = false;

function toggleCollapse(){
    collapse = !collapse;
    let button = $('#collapse-btn');
    button.empty();
    if(collapse) {
        button.append('<i class="bi bi-chevron-down"></i>')
    } else {
        button.append('<i class="bi bi-chevron-up"></i>')
    }
}

// Display file name using jQuery
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

    // Add event listeners for input changes
    $('.layer-input').on('input', function () {
        let index = $(this).data('index');
        layers[index] = parseInt($(this).val(), 10) || 0; // Update the corresponding layer value
    });
}

function addLayer() {
    let value = $('#layer-input').val();
    layers.push(+value);
    displayLayers();
}

function deleteLayer(index) {
    layers.splice(index, 1); // Remove element from array
    displayLayers(); // Redraw layers
}



// Handle input using jQuery
$('#file-upload').on('change', function (event) {
    handleFileSelect(event);
});

function handleFileSelect(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function (e) {
        const contents = e.target.result;
        parseCSV(contents);
    };
    reader.readAsText(file);
}

// Parse CSV using jQuery
function parseCSV(csv) {
    const lines = csv.trim().split('\n');
    const data = [];
    lines.forEach(line => {
        if (line.trim() !== '') {
            const values = line.trim().split(',');
            const label = parseInt(values[0], 10);
            if (!isNaN(label)) {
                const pixels = values.slice(1).map(pixel => parseInt(pixel, 10));
                data.push([label, pixels]);
            } else {
                console.warn(`Invalid label found: ${values[0]}`);
            }
        }
    });
    displayData(data);
}

// Display data using jQuery
function displayData(data) {
    for (let i = 0; i < Math.min(10, data.length); i++) {
        console.log(`element ${i + 1}:`, data[i]);
    }
}

$(() => {
    displayLayers();
});
