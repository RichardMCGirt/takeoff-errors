// Your Airtable API settings
const AIRTABLE_API_KEY = 'patxrKdNvMqOO43x4.274bd66bb800bb57cd8b22fe56831958ac0e8d79666cc5e4496013246c33a2f3';
const BASE_ID = 'appgX5NR5p1apwf7N';
const TABLE_ID = 'tblLLrBKn5SOoVUNk';  // For the main table

// URL for Vanir Office (linked table)
const AIRTABLE_URL_VANIR_OFFICE = `https://api.airtable.com/v0/${BASE_ID}/<vanirOfficeTableID>`;

// URL for Submitted by (linked table)
const AIRTABLE_URL_SUBMITTED_BY = `https://api.airtable.com/v0/${BASE_ID}/<submittedByTableID>`;

// URL for submitting the form data to Airtable
const AIRTABLE_URL = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`;

// Headers for Airtable API
const headers = {
    Authorization: `Bearer ${AIRTABLE_API_KEY}`,
    'Content-Type': 'application/json'
};

// Function to fetch "Submitted by" from Airtable and populate the dropdown, filtered by office
async function populateSubmittedByDropdown(selectedOffice = "") {
    try {
        const response = await fetch(AIRTABLE_URL_SUBMITTED_BY, { headers });
        const data = await response.json();

        const submittedByDropdown = document.getElementById('submittedBy');
        submittedByDropdown.innerHTML = '<option value="" disabled selected>Select your name</option>';  // Reset dropdown

        data.records.forEach(record => {
            const fullName = record.fields['Full Name'];  // Adjust field name if different
            const office = record.fields['Vanir Office']; // Assuming you have an 'Office' field in Airtable

            // Only add the name if it matches the selected office or if no office is selected
            if (selectedOffice === "" || office === selectedOffice) {
                const option = document.createElement('option');
                option.value = fullName;
                option.textContent = fullName;
                submittedByDropdown.appendChild(option);
            }
        });
    } catch (error) {
        console.error('Error fetching data from Airtable:', error);
    }
}

// Function to fetch "Issue Type" from Airtable and populate the dropdown (without duplicates)
async function populateIssueTypeDropdown() {
    try {
        const response = await fetch(AIRTABLE_URL, { headers });
        const data = await response.json();

        const issueTypeDropdown = document.getElementById('issueType');
        const uniqueIssueTypes = new Set();  // Use a Set to track unique Issue Types
        
        // Iterate over the records and add unique "Issue Type" values to the dropdown
        data.records.forEach(record => {
            const issueType = record.fields['Issue Type'];  // Adjust the field name if different
            if (issueType && !uniqueIssueTypes.has(issueType)) {
                uniqueIssueTypes.add(issueType);  // Add to Set to ensure uniqueness
                const option = document.createElement('option');
                option.value = issueType;
                option.textContent = issueType;
                issueTypeDropdown.appendChild(option);
            }
        });
    } catch (error) {
        console.error('Error fetching data from Airtable:', error);
    }
}

// Function to submit form data to Airtable
async function submitFormData(formData) {
    // Fetch the record IDs for 'Vanir Office' and 'Submitted by'
    const vanirOfficeId = await getRecordIdForField(formData.get('vanirOffice'), AIRTABLE_URL_VANIR_OFFICE, 'Office Name');  // Fetch the record ID for 'Vanir Office'
    const submittedById = await getRecordIdForField(formData.get('submittedBy'), AIRTABLE_URL_SUBMITTED_BY, 'Full Name');  // Fetch the record ID for 'Submitted by'

    // If either ID is not found, show an error message
    if (!vanirOfficeId || !submittedById) {
        console.error('Error: Unable to find record IDs for selected fields');
        document.getElementById('statusMessage').textContent = 'Error: Unable to find record IDs for selected fields';
        return;
    }

    const payload = {
        fields: {
            'Vanir Office': [vanirOfficeId],  // Must be an array of record IDs for linked records
            'Submitted By': [submittedById],  // Must be an array of record IDs for linked records
            'Issue Type': formData.get('issueType'),  // Assuming this is a single select field
            'Error Description': formData.get('IssueDescription'),  // Assuming this is a text field
        }
    };

    console.log(payload);  // Log the payload to ensure correctness

    try {
        const response = await fetch(AIRTABLE_URL, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload),
        });

        if (response.ok) {
            document.getElementById('statusMessage').textContent = 'Error report submitted successfully!';
        } else {
            const errorData = await response.json();
            console.error('Error:', errorData);
            document.getElementById('statusMessage').textContent = 'Error submitting report. Please try again.';
        }
    } catch (error) {
        document.getElementById('statusMessage').textContent = 'Error submitting report. Please try again.';
        console.error('Error submitting form data:', error);
    }
}

// Helper function to get the record ID based on a field value (e.g., name)
async function getRecordIdForField(value, airtableUrl, fieldName) {
    const response = await fetch(airtableUrl, { headers });
    const data = await response.json();

    // Find the record with the matching field value (e.g., 'Office Name' or 'Full Name')
    const record = data.records.find(record => record.fields[fieldName] === value);
    return record ? record.id : null;  // Return the record ID or null if not found
}





// Event listener for form submission
document.getElementById('errorForm').addEventListener('submit', function(event) {
    event.preventDefault();  // Prevent the default form submission behavior

    const formData = new FormData(event.target);  // Get form data

    submitFormData(formData);  // Submit form data to Airtable
});

// Event listener for Vanir Office dropdown to filter the "Submitted by" dropdown
document.getElementById('vanirOffice').addEventListener('change', function() {
    const selectedOffice = this.value;
    populateSubmittedByDropdown(selectedOffice);  // Filter the submitted by dropdown based on selected office
});

// Call the functions when the page loads to populate the dropdowns
window.onload = function() {
    populateSubmittedByDropdown();  // Populate without filtering initially
    populateIssueTypeDropdown();
};
