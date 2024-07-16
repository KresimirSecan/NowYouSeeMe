//handle input
document.getElementById('file-upload').addEventListener('change', handleFileSelect, false);

function handleFileSelect(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        const contents = e.target.result;
        parseCSV(contents);
    };
    reader.readAsText(file);
}

//parse
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

//provjera
function displayData(data) {
    for (let i = 0; i < Math.min(3, data.length); i++) {
        console.log(`element ${i + 1}:`, data[i]);
    }
}


//prikazuje file kad se uploda na sidebaru
function displayFileName() {
    const input = document.getElementById('file-upload');
    const fileName = input.files[0]?.name || '';
    document.getElementById('file-name').textContent = fileName;
}
