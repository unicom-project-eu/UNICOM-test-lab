var dataTableInitialized = false; // Flag to track DataTable initialization
var t; // DataTable instance
var appBaseUrl = "";

// Function to initialize or reinitialize the DataTable
function initializeDataTable() {
  // if (dataTableInitialized) {
  //   // Destroy the DataTable if it has been initialized
  //   if (t) {
  //     t.destroy();
  //   }
  // }
  if ($.fn.dataTable.isDataTable('#prod-table')) {
    t = $('#prod-table').DataTable();
  } else {
    // The table has not been initialized as DataTable yet
    // You can initialize it here if you want to
  }
  // // Initialize DataTable
  // // t = $('#prod-table').DataTable({
  // //   // DataTable configuration options
  // // });

  // dataTableInitialized = true; // Set the flag to true
}

// Function to clear validation labels
function clearValidationLabels() {
  $('#prod-table').find('.validation-label').html('');
}

// Function to populate validation labels
function populateValidationLabels(resourceId, validationData) {
  var row = t.row($('#prod-table').find('[data-resource-id="' + resourceId + '"]').closest('tr'));

  if (row.any()) {
    // Update the labels for the corresponding row
    row.data()[5] = '<span class="error-count">' + validationData.errorCount + '</span> ' +
      '<span class="warning-count">' + validationData.warningCount + '</span> ' +
      '<span class="info-count">' + validationData.infoCount + '</span>';
    row.invalidate(); // Invalidate the row to trigger a redraw
  }
}

// Function to validate a resource and populate validation labels
async function validateAndPopulateLabels(resourceId, baseurl) {
  // Construct the validation URL
  const validationUrl = `${baseurl}/MedicinalProductDefinition/${resourceId}/$validate`;

  try {
    // Make the API call to get the validation report
    const response = await fetch(validationUrl);

    if (response.status === 200) {
      const validationData = await response.json();

      // Parse the validation report and count errors, warnings, and info
      let errorCount = 0;
      let warningCount = 0;
      let infoCount = 0;

      if (validationData.issue) {
        validationData.issue.forEach((issue) => {
          if (issue.severity === 'error') {
            errorCount++;
          } else if (issue.severity === 'warning') {
            warningCount++;
          } else if (issue.severity === 'information') {
            infoCount++;
          }
        });
      }

      const updatedValidationData = {
        errorCount,
        warningCount,
        infoCount,
        validationReport: validationData
      };

      populateValidationLabels(resourceId, updatedValidationData);
    } else {
      console.error('Error fetching validation data:', response.status);
    }
  } catch (error) {
    console.error('Error fetching validation data:', error);
  }
}






// Function to remove the event listener for validation
function removeValidationClickListener() {
  document.removeEventListener('click', validationClickListener);
}

// Function to add the event listener for validation
function addValidationClickListener() {
  // Check if the listener has been added before removing it
  if (!document.removeEventListener('click', validationClickListener)) {
    document.addEventListener('click', validationClickListener);
  }
}





document.addEventListener('DOMContentLoaded', function () {
  // Your JavaScript code here, including the event listener for the "Validate All" button

  // Fetch the configuration from config.json
  fetch('config.json')
    .then((response) => {
      return response.json();
    })
    .then((config) => {
      // Get the server_url from the config
      var baseurl = config.server_url;

      // Construct the URL for fetching Bundle resources
      var url = baseurl + '/Bundle?_format=json&_count=20000';




      function addValidationClickListener() {
        function validationClickListener(event) {
          //        console.log('Validation click event'); // Debugging message
          const clickedElement = event.target;

          // Check if a label with the resource-id data attribute was clicked
          if (clickedElement.classList.contains('error-count') ||
            clickedElement.classList.contains('warning-count') ||
            clickedElement.classList.contains('info-count')) {

            // Check if a label with the resource-id data attribute was clicked
            const resourceId = findClosestResource(clickedElement);
            if (resourceId) {


              // Trigger the validation for the clicked resource
              validateResource(resourceId, baseurl)
                .then((validationData) => {
                  // Update the clicked label with the validation result
                  const updatedLabel = createValidationLabel(
                    validationData, resourceId, baseurl
                  );

                  const parentCell = clickedElement.parentNode;
                  parentCell.innerHTML = updatedLabel.innerHTML;


                  // Add the event listener again
                  if (!document.removeEventListener('click', validationClickListener)) {
                    document.addEventListener('click', validationClickListener);
                  }
                });
            }
          }
        }

        document.addEventListener('click', validationClickListener);

      }

      function findClosestResource(element) {
        // Traverse up the DOM tree to find the closest parent with data-resource-id attribute
        while (element) {
          if (element.hasAttribute('data-resource-id')) {
            return element.getAttribute('data-resource-id');
          }
          element = element.parentElement;
        }
        return null; // Return null if no valid resource ID is found
      }


      // Initialize DataTable
      initializeDataTable();

      // Clear validation labels
      clearValidationLabels();

      // Add the event listener for validation
      addValidationClickListener();


      // Fetch data from the constructed URL
      return fetch(url)
        .then((response) => {
          return response.json();
        })
        .then((bundles) => {
          initializeDataTable(); // Initialize DataTable 

          // clearValidationLabels(); // Clear validation labels




          // document.getElementById('validate-all-button').addEventListener('click', function () {
          //   // Iterate through all rows in the DataTable
          //   t.rows().every(function () {
          //     const resourceId = this.data()[0]; // Assuming the resource ID is in the first column

          //     if (resourceId) {
          //       // Trigger the validation for each resource
          //       validateResource(resourceId, baseurl)
          //         .then((validationData) => {
          //           // Update the validation labels for the current row
          //           populateValidationLabels(resourceId, validationData);
          //         });
          //     }
          //   });
          // });




          for (bundle in bundles.entry) {
            // Check if the resource is a Bundle
            if (bundles.entry[bundle].resource.resourceType === 'Bundle') {
              // Process each entry in the Bundle
              for (entry in bundles.entry[bundle].resource.entry) {
                var resource = bundles.entry[bundle].resource.entry[entry].resource;

                // Check if the resource is a MedicinalProductDefinition
                if (resource.resourceType === 'MedicinalProductDefinition') {
                  // Create the data row and add it to DataTable
                  var current_row = [];

                  try {
                    current_row.push(resource.id);
                  } catch (error) {
                    current_row.push(error);
                  }

                  try {
                    current_row.push('<b>' + resource.name[0].productName + '</b>');
                  } catch (error) {
                    current_row.push(error);
                  }

                  try {
                    current_row.push(
                      resource.name[0].usage[0].country.coding[0].display
                    );
                  } catch (error) {
                    current_row.push(error);
                  }

                  try {
                    current_row.push(
                      // '<a target="_blank" href="https://idmp-viewer.azurewebsites.net/display-product?url=' +
                      //   baseurl +
                      //   '/MedicinalProductDefinition/' +
                      //   resource.id +
                      //   '">Viewer</a> <br> '+
                      '<a target="_blank" href="' +

                      './visualiser/index.html?url=' +
                      baseurl +
                      '/MedicinalProductDefinition/' +
                      resource.id +
                      '">Viewer</a>'
                    );
                  } catch (error) {
                    current_row.push(error);
                  }

                  try {
                    current_row.push(
                      '<a target="_blank" href="' +
                      baseurl +
                      '/MedicinalProductDefinition/' +
                      resource.id +
                      '?_format=xml">XML</a> <br> <a href="' +
                      baseurl +
                      '/MedicinalProductDefinition/' +
                      resource.id +
                      '?_format=json">JSON</a>'
                    );
                  } catch (error) {
                    current_row.push(error);
                  }


                  current_row.push(
                    // '<span class="error-count" data-resource-id="' + resource.id + '">&nbsp;&nbsp;</span> ' +
                    // '<span class="warning-count" data-resource-id="' + resource.id + '">&nbsp;&nbsp;</span> ' +
                    // '<span class="info-count" data-resource-id="' + resource.id + '">&nbsp;&nbsp;</span> ' +

                    '<span class="full-validation-link">' +
                    '<a target="_blank" href="' +
                    baseurl +
                    '/MedicinalProductDefinition/' +
                    resource.id +
                    '/$validate">Report</a>' +
                    '</span>'
                  );

                  t.row.add(current_row);
                }
              }
            }
          }

          // Draw the DataTable after all data is added
          t.draw();

          // Handle click events on "Validate" buttons
          $('#prod-table').on('click', '.validate-button', function () {
            var resourceId = $(this).data('resource-id');
            validateAndPopulateLabels(resourceId, baseurl);
          });
        })
        .catch((error) => {
          console.error('Error fetching data:', error);
        });
    })
    .catch((error) => {
      console.error('Error fetching configuration:', error);
    });






});




function createValidationLabel(validationData, resourceID, baseurl) {
  var validationLabel = document.createElement("div");
  validationLabel.className = "validation-label";

  // Create the "Full Validation" link
  var fullValidationLink =
    '<a target="_blank" href="' +
    baseurl +
    '/MedicinalProductDefinition/' +
    resourceID +
    '/$validate">Report</a>';

  validationLabel.innerHTML =
    //    '<button class="validate-button">Validate</button> ' +
    '<span class="error-count">' + validationData.errorCount + '</span> ' +
    '<span class="warning-count">' + validationData.warningCount + '</span> ' +
    '<span class="info-count">' + validationData.infoCount + '</span> ' +
    '<span class="full-validation-link">' + fullValidationLink + '</span>';

  return validationLabel;
}

async function validateResource(resourceId, baseurl) {
  // Construct the validation URL
  const validationUrl = `${baseurl}/MedicinalProductDefinition/${resourceId}/$validate`;

  try {
    // Make the API call to get the validation report
    const response = await fetch(validationUrl);

    if (response.status === 200) {
      const validationData = await response.json();

      // Parse the validation report and count errors, warnings, and info
      let errorCount = 0;
      let warningCount = 0;
      let infoCount = 0;

      if (validationData.issue) {
        validationData.issue.forEach((issue) => {
          if (issue.severity === 'error') {
            errorCount++;
          } else if (issue.severity === 'warning') {
            warningCount++;
          } else if (issue.severity === 'information') {
            infoCount++;
          }
        });
      }

      return {
        errorCount,
        warningCount,
        infoCount,
        validationReport: validationData,
      };
    } else {
      console.error('Error fetching validation data:', response.status);
      return {
        errorCount: -1, // Indicate an error
        warningCount: 0,
        infoCount: 0,
        validationReport: null,
      };
    }
  } catch (error) {
    console.error('Error fetching validation data:', error);
    return {
      errorCount: -1, // Indicate an error
      warningCount: 0,
      infoCount: 0,
      validationReport: null,
    };
  }
}


// Function to clear validation labels
function clearValidationLabels() {
  $('#prod-table').find('.validation-label').html('');
}










