document.addEventListener('DOMContentLoaded', async () => {
    const vanirOfficeSelect = document.getElementById('vanirOffice');
    const submittedBySelect = document.getElementById('submittedBy');
    const issueTypeSelect = document.getElementById('issueType'); // Add issue type dropdown element
    const airtableApiKey = 'patxrKdNvMqOO43x4.274bd66bb800bb57cd8b22fe56831958ac0e8d79666cc5e4496013246c33a2f3';
    const baseId = 'appgX5NR5p1apwf7N';
    const tableId = 'tblLLrBKn5SOoVUNk'; // Table for fetching Full Name, Vanir Office, and Issue Type

    // Function to fetch records from Airtable
    const fetchAirtableRecords = async () => {
        const response = await fetch(`https://api.airtable.com/v0/${baseId}/${tableId}`, {
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

    // Fetch records from Airtable on page load
    const records = await fetchAirtableRecords();

    // Check if there is a saved Vanir Office in localStorage and set it
    const savedVanirOffice = localStorage.getItem('vanirOffice');
    if (savedVanirOffice) {
        vanirOfficeSelect.value = savedVanirOffice;
        filterSubmittedBy(records, savedVanirOffice); // Populate submittedBy dropdown based on saved office
    }

    // Populate Issue Types on page load
    populateIssueTypes(records);

    // Add event listener to Vanir Office dropdown
    vanirOfficeSelect.addEventListener('change', (event) => {
        const selectedOffice = event.target.value;
        filterSubmittedBy(records, selectedOffice);

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
});
