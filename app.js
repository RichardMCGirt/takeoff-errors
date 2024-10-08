// Your Airtable API settings
const AIRTABLE_API_KEY = 'your_airtable_api_key';
const BASE_ID = 'your_airtable_base_id';
const TABLE_ID = 'your_airtable_table_id'; // Replace with the correct table ID

// API endpoint for Airtable
const AIRTABLE_URL = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`;

// Headers for Airtable API
const headers = {
    Authorization: `Bearer ${AIRTABLE_API_KEY}`,
    'Content-Type': 'application/json'
};

// Get form, file input, and drop zone elements
const errorForm = document.getElementById('errorForm');
const statusMessage = document.getElementById('statusMessage');
const excelFileInput = document.getElementById('excelFile');
const dropZone = document.getElementById('dropZone');

// Handle form submission
errorForm.addEventListener('submit', (e) => {
    e.preventDefault();  // Prevent default form submission

    // Get form data
    const builder = document.getElementById('builder').value;
    const planName = document.getElementById('planName').value;
    const elevation = document.getElementById('elevation').value;
    const materialType = document.getElementById('materialType').value;
    const date = document.getElementById('date').value;
    const estimator = document.getElementById('estimator').value;
    const errorDescription = document.getElementById('errorDescription').value;

    // Create record data to send to Airtable
    const recordData = {
        fields: {
            "Builder": builder,
            "Plan Name": planName,
            "Elevation": elevation,
            "Material Type": materialType,
            "Date": date,
            "Estimator": estimator,
            "Error Description": errorDescription,
            "Status": "Open"
        }
    };

    // Send data to Airtable
    fetch(AIRTABLE_URL, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(recordData)
    })
    .then(response => {
        if (response.ok) {
            statusMessage.textContent = "Error report submitted successfully!";
            errorForm.reset();  // Clear the form after successful submission
        } else {
            statusMessage.textContent = "Failed to submit error report.";
        }
    })
    .catch(error => {
        statusMessage.textContent = `Error: ${error.message}`;
    });
});

// Handle Excel file input and auto-populate form
excelFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    console.log('File selected via input:', file);
    handleFile(file);
});

// Handle drag-and-drop functionality
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
    console.log('File dragged over drop zone');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
    console.log('File left the drop zone');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    console.log('File dropped into drop zone');

    const file = e.dataTransfer.files[0];
    console.log('File dropped:', file);

    handleFile(file);
});

// Function to handle file parsing and form auto-fill
// Function to handle file parsing and form auto-fill
function handleFile(file) {
    if (!file) {
        console.log('No file found');
        return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
        console.log('File reading completed');
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Parse Excel data as JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        console.log('Parsed Excel data:', jsonData);

        // Check if the relevant data rows are available
        if (jsonData.length > 19) {
            // Extract and populate form fields
            document.getElementById('builder').value = jsonData[14][11] || '';      // Builder
            document.getElementById('planName').value = jsonData[15][11] || '';    // Plan Name
            document.getElementById('elevation').value = jsonData[16][11] || '';   // Elevation
            document.getElementById('materialType').value = jsonData[17][11] || ''; // Material Type

            // Convert Excel date to a readable format for the date input
            const excelDate = jsonData[18][11];
            if (excelDate) {
                const jsDate = new Date((excelDate - 25569) * 86400 * 1000); // Convert Excel date to JS date
                const formattedDate = jsDate.toISOString().split('T')[0];    // Format as yyyy-mm-dd for input
                document.getElementById('date').value = formattedDate;
            }

            document.getElementById('estimator').value = jsonData[19][11] || '';  // Estimator
        } else {
            console.log('Excel data is missing the expected rows.');
        }
    };

    reader.readAsArrayBuffer(file);
    console.log('File reading started');
}
