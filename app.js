document.addEventListener('DOMContentLoaded', async () => {
    const vanirOfficeSelect = document.getElementById('vanirOffice');
    const submittedBySelect = document.getElementById('submittedBy');
    const issueDescriptionTextarea = document.getElementById('IssueDescription'); 

    const issueTypeSelect = document.getElementById('issueType'); // Add issue type dropdown element
    const airtableApiKey = 'patxrKdNvMqOO43x4.274bd66bb800bb57cd8b22fe56831958ac0e8d79666cc5e4496013246c33a2f3';
    const baseId = 'appgX5NR5p1apwf7N'; // Base ID for both tables
    const tableId1 = 'tblSoqIU5apC8PVtM'; // Table for Full Name, Vanir Office
    const tableId2 = 'tblLLrBKn5SOoVUNk'; 

    // Function to fetch records from the first Airtable table (for Full Name and Vanir Office)
    const fetchAirtableRecords1 = async () => {
        const response = await fetch(`https://api.airtable.com/v0/${baseId}/${tableId1}`, {
            headers: {
                Authorization: `Bearer ${airtableApiKey}`
            }
        });
        const data = await response.json();
        return data.records;
    };

    // Function to fetch records from the second Airtable table (for Issue Type)
    const fetchAirtableRecords2 = async () => {
        const response = await fetch(`https://api.airtable.com/v0/${baseId}/${tableId2}`, {
            headers: {
                Authorization: `Bearer ${airtableApiKey}`
            }
        });
        const data = await response.json();
        return data.records;
    };

    // Function to populate the submittedBy dropdown based on Vanir Office selection
    const filterSubmittedBy = (records, selectedOffice) => {
        // Clear existing options in the submittedBy dropdown
        submittedBySelect.innerHTML = '';

        // Filter records based on the selected Vanir Office
        const filteredRecords = records.filter(record => record.fields['Vanir Office'] === selectedOffice);

        // Create and append options for each filtered record
        filteredRecords.forEach(record => {
            const option = document.createElement('option');
            option.value = record.fields['Full Name'];
            option.textContent = record.fields['Full Name'];
            submittedBySelect.appendChild(option);
        });

        // Check if there is a saved submittedBy in localStorage and set it
        const savedSubmittedBy = localStorage.getItem('submittedBy');
        if (savedSubmittedBy) {
            submittedBySelect.value = savedSubmittedBy;
        }
    };

    // Function to populate the issueType dropdown with distinct Issue Types
    const populateIssueTypes = (records) => {
        // Clear existing options in the issueType dropdown
        issueTypeSelect.innerHTML = '';

        // Create a Set to store unique Issue Types
        const issueTypes = new Set();

        // Extract unique Issue Types from records
        records.forEach(record => {
            if (record.fields['Issue Type']) {
                issueTypes.add(record.fields['Issue Type']);
            }
        });

        // Create and append options for each unique Issue Type
        issueTypes.forEach(issueType => {
            const option = document.createElement('option');
            option.value = issueType;
            option.textContent = issueType;
            issueTypeSelect.appendChild(option);
        });

        // Check if there is a saved issueType in localStorage and set it
        const savedIssueType = localStorage.getItem('issueType');
        if (savedIssueType) {
            issueTypeSelect.value = savedIssueType;
        }
    };

    // Fetch records from both Airtable tables on page load
    const records1 = await fetchAirtableRecords1(); // Fetch Full Name and Vanir Office records
    const records2 = await fetchAirtableRecords2(); // Fetch Issue Type records

    // Check if there is a saved Vanir Office in localStorage and set it
    const savedVanirOffice = localStorage.getItem('vanirOffice');
    if (savedVanirOffice) {
        vanirOfficeSelect.value = savedVanirOffice;
        filterSubmittedBy(records1, savedVanirOffice); // Populate submittedBy dropdown based on saved office
    }

    // Populate Issue Types on page load
    populateIssueTypes(records2);

    // Add event listener to Vanir Office dropdown
    vanirOfficeSelect.addEventListener('change', (event) => {
        const selectedOffice = event.target.value;
        filterSubmittedBy(records1, selectedOffice);

        // Store the selected Vanir Office in localStorage
        localStorage.setItem('vanirOffice', selectedOffice);
    });

    // Add event listener to Submitted By dropdown to store the selected value
    submittedBySelect.addEventListener('change', (event) => {
        const selectedSubmittedBy = event.target.value;

        // Store the selected Submitted By in localStorage
        localStorage.setItem('submittedBy', selectedSubmittedBy);
    });

    // Add event listener to Issue Type dropdown to store the selected value
    issueTypeSelect.addEventListener('change', (event) => {
        const selectedIssueType = event.target.value;

        // Store the selected Issue Type in localStorage
        localStorage.setItem('issueType', selectedIssueType);
    });
 // Function to send data to Airtable when "Submit Error Report" is clicked
 const submitErrorReport = async () => {
    const selectedVanirOffice = vanirOfficeSelect.value;
    const selectedSubmittedBy = submittedBySelect.value;
    const selectedIssueType = issueTypeSelect.value;
    const issueDescription = issueDescriptionTextarea.value; // Get the issue description

    // Log the selected values
    console.log('Selected Vanir Office:', selectedVanirOffice);
    console.log('Selected Submitted By:', selectedSubmittedBy);
    console.log('Selected Issue Type:', selectedIssueType);
    console.log('Issue Description:', issueDescription);

    // Data to be sent to Airtable
    const data = {
        fields: {
            "Vanir Office": selectedVanirOffice,
            "Submitted By": selectedSubmittedBy,
            "Issue Type": selectedIssueType,
            "Issue Description": issueDescription // Add Issue Description to the data
        }
    };

    // Log the data being sent
    console.log('Data to be sent:', data);

    try {
        // Sending data to Airtable
        const response = await fetch(`https://api.airtable.com/v0/${baseId}/${tableId2}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${airtableApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        // Log the response status
        console.log('Response status:', response.status);

        if (response.ok) {
            alert("Error report submitted successfully!");
        } else {
            alert("Error submitting report. Please try again.");
        }
    } catch (error) {
        // Log any errors that occur during the fetch
        console.error('Error submitting report:', error);
        alert("An error occurred while submitting the report. Please try again.");
    }
};

// Add event listener to the submit button
const submitButton = document.getElementById('submitErrorReport');
submitButton.addEventListener('click', (event) => {
    event.preventDefault(); // Prevent default form submission behavior
    submitErrorReport(); // Call the function to submit the data
});

});