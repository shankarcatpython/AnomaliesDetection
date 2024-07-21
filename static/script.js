let chartInstance;

// Enable/disable the fetch button based on selections
function updateFetchButtonState() {
    const tableSelected = document.getElementById('table-select').value !== '';
    const featureSelected = document.getElementById('feature-select').value !== '';
    document.getElementById('fetch-data').disabled = !(tableSelected && featureSelected);
}

// Fetch table names and populate the select element
fetch('/api/tables')
    .then(response => response.json())
    .then(data => {
        const tableSelect = document.getElementById('table-select');
        data.forEach(table => {
            const option = document.createElement('option');
            option.value = table;
            option.textContent = table;
            tableSelect.appendChild(option);
        });
        updateFetchButtonState();
    });

// Fetch features for the selected table
document.getElementById('table-select').addEventListener('change', () => {
    const tableName = document.getElementById('table-select').value;
    const featureSelect = document.getElementById('feature-select');
    featureSelect.innerHTML = '<option value="" disabled selected>Select Feature</option>'; // Clear previous options and add default
    featureSelect.disabled = true;

    if (tableName) {
        fetch(`/api/features?table_name=${tableName}`)
            .then(response => response.json())
            .then(data => {
                data.forEach(feature => {
                    const option = document.createElement('option');
                    option.value = feature.feature_name;
                    option.textContent = feature.feature_name;
                    featureSelect.appendChild(option);
                });
                featureSelect.disabled = false;
                updateFetchButtonState();
            });
    } else {
        updateFetchButtonState();
    }
});

// Fetch data and display chart and details
document.getElementById('fetch-data').addEventListener('click', () => {
    const tableName = document.getElementById('table-select').value;
    const featureName = document.getElementById('feature-select').value;
    fetch(`/api/features?table_name=${tableName}`)
        .then(response => response.json())
        .then(data => {
            const selectedFeature = data.find(feature => feature.feature_name === featureName);
            const labels = ['Mean', 'Median', 'Std Dev', 'Min Value', 'Max Value', 'Anomaly Count'];
            const dataValues = [
                selectedFeature.mean,
                selectedFeature.median,
                selectedFeature.std_dev,
                selectedFeature.min_value,
                selectedFeature.max_value,
                selectedFeature.anomaly_count
            ];

            if (chartInstance) {
                chartInstance.destroy();
            }

            const ctx = document.getElementById('anomalyChart').getContext('2d');
            chartInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: featureName,
                        data: dataValues,
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    },
                    plugins: {
                        legend: {
                            display: true,
                            labels: {
                                color: '#333'
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.7)',
                            titleColor: '#fff',
                            bodyColor: '#fff'
                        }
                    }
                }
            });

            // Update summary
            const summaryText = `
                <strong>Feature:</strong> ${featureName}<br>
                <strong>Mean:</strong> ${selectedFeature.mean.toFixed(2)}<br>
                <strong>Median:</strong> ${selectedFeature.median.toFixed(2)}<br>
                <strong>Std Dev:</strong> ${selectedFeature.std_dev.toFixed(2)}<br>
                <strong>Min Value:</strong> ${selectedFeature.min_value.toFixed(2)}<br>
                <strong>Max Value:</strong> ${selectedFeature.max_value.toFixed(2)}<br>
                <strong>Anomaly Count:</strong> ${selectedFeature.anomaly_count}
            `;
            document.getElementById('summary-text').innerHTML = summaryText;

            // Update details table
            const detailsBody = document.getElementById('details-body');
            detailsBody.innerHTML = ''; // Clear previous details
            const anomalies = JSON.parse(selectedFeature.anomalies);
            anomalies.forEach(anomaly => {
                const row = document.createElement('tr');
                const idCell = document.createElement('td');
                idCell.textContent = anomaly.id;
                const valueCell = document.createElement('td');
                valueCell.textContent = anomaly.value.toFixed(2);
                row.appendChild(idCell);
                row.appendChild(valueCell);
                detailsBody.appendChild(row);
            });
        });
});

document.getElementById('feature-select').addEventListener('change', updateFetchButtonState);
