let testPercentage = 0;
let columnNames = [];
let selectedLabelColumn = '';

export let labels = [];
export let trainData = [];
export let testData = [];
export let dataAvailable = false;

// Handle file input 
$('#file-upload').on('change', function (event) {
    handleFileSelect(event);
});

function handleFileSelect(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function (e) {
        const contents = e.target.result;
        populateColumnDropdown(contents);
    };
    reader.readAsText(file);
}

// Function to populate column dropdown
function populateColumnDropdown(csv) {
    const lines = csv.trim().split('\n');
    columnNames = lines[0].trim().split(',');
    const dropdown = $('#labelColumn');
    dropdown.empty();
    dropdown.append('<option selected disabled>Select column</option>');
    columnNames.forEach(name => {
        dropdown.append(`<option value="${name}">${name}</option>`);
    });
}

// Function to parse CSV using the selected label column
function parseCSV(file) {
    const reader = new FileReader();
    reader.onload = function (e) {
        const lines = e.target.result.trim().split('\n');
        const data = [];
        const labelIndex = columnNames.indexOf(selectedLabelColumn);
        if (labelIndex === -1) {
            alert(`Label column "${selectedLabelColumn}" not found in CSV header.`);
            return;
        }
        lines.slice(1).forEach(line => {
            if (line.trim() !== '') {
                const values = line.trim().split(',');
                const label = values[labelIndex];  
                const pixels = values.filter((_, i) => i !== labelIndex).map(pixel => parseInt(pixel, 10));
                if (pixels.every(pixel => !isNaN(pixel))) {
                    data.push([label, pixels]);
                } else {
                    console.warn(`Invalid pixel values found in line: ${line}`);
                }
            }
        });

        ({trainData, testData} = trainTestSplit(data, testPercentage));

        //Trim to limit
        const MAX_SAMPLES = 30000;
        const trimData = (dataObj) => {
            if (dataObj.labels.length > MAX_SAMPLES) {
                dataObj.labels = dataObj.labels.slice(0, MAX_SAMPLES);
                dataObj.pixels = dataObj.pixels.slice(0, MAX_SAMPLES);
                return true;
            }
            return false;
        };

        const trainDataTrimmed = trimData(trainData);
        const testDataTrimmed = trimData(testData);

        console.log("TrainTestSplit: ");
        console.log("Test data length: ", testData.labels.length);
        const labl = tf.tensor(testData.labels);
        labels = Array.from(tf.unique(labl).values.dataSync()).sort();
       
        //parsing for training proces
        trainData.labels = tf.oneHot(tf.tensor1d(trainData.labels, 'int32'), 10);
        trainData.pixels = tf.stack(trainData.pixels);

        let alertMessage = "Data submitted.";
        if (trainDataTrimmed || testDataTrimmed) {
            alertMessage += " Note: The data was sliced to fit the 30,000 samples limit.";
        }
        alert(alertMessage);
        $('#submit-message').hide();
    };
    reader.readAsText(file);
}

// Handle submit button click
$('#submitPercentage').on('click', function () {
    $('#submit-message').show();
    let value = parseInt($('#testPercentage').val(), 10);
    if (isNaN(value) || value < 0 || value > 100) {
        alert('Please enter a valid percentage for test data between 0 and 100.');
        $('#testPercentage').val(testPercentage);
        $('#submit-message').hide(); 
    } else {
        testPercentage = value;
        console.log('Test Data Percentage:', testPercentage);
    }
    
    selectedLabelColumn = $('#labelColumn').val();
    if (!selectedLabelColumn) {
        alert('Please select a label column.');
        $('#submit-message').hide();
    } else {
        console.log('Selected Label Column:', selectedLabelColumn);
        const file = $('#file-upload').prop('files')[0];
        if (file) {
            dataAvailable = true;
            parseCSV(file);
        }
    }
});

// Data is formatted as an array of ['label', pixelArray]
function trainTestSplit(data, testPercentage) {
    const testSize = Math.floor(data.length * (testPercentage / 100));

    shuffleArray(data);
    const labels = data.map(entry => entry[0]); 
    const pixels = data.map(entry => entry[1]);

    const pixelTensors = pixels.map(pixelArray => tf.tensor(pixelArray));

    // Train-test split
    const trainPixels = pixelTensors.slice(testSize);
    const testPixels = pixelTensors.slice(0, testSize);
    const trainLabels = labels.slice(testSize);
    const testLabels = labels.slice(0, testSize);

    return {
        trainData: {
            labels: trainLabels,
            pixels: trainPixels
        },
        testData: {
            labels: testLabels,
            pixels: testPixels
        }
    };
}

// In-place shuffle function
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
