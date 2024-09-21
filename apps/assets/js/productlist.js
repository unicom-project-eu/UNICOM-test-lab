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
  //  const validationUrl = 
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




document.addEventListener('DOMContentLoaded', async function () {
  // Fetch the configuration from config.json
  fetch('config.json')
    .then((response) => response.json())
    .then((config) => {
      var baseurl = config.server_url;
      console.log(baseurl);
      var url = baseurl + '/Bundle?_format=json&_count=20000';

      var productFormatType = document.getElementById('productFormatType');

      // Event listener for the checkbox
      productToggle.addEventListener('change', function () {
        var isBundleOfBundles = this.checked;
        var url = isBundleOfBundles
          ? baseurl + '/Bundle?_format=json&_count=20000'
          : baseurl + '/MedicinalProductDefinition?_format=json&_count=20000';

        // Clear the existing data in the table
        t.clear();

        // Fetch and process the new data
        getDataToProcess(url, isBundleOfBundles)
          .then(data => processData(data, baseurl))
          .catch(error => console.error('Error:', error));
      });



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

      productToggle.dispatchEvent(new Event('change'));
      //// Fetch and process the data
      // getDataToProcess(url, false) // Set true for Bundle of Bundles
      //   .then(data => processData(data, baseurl))
      //   .catch((error) => console.error('Error processing data:', error));
    })
    .catch((error) => console.error('Error fetching configuration:', error));
});









































async function getDataToProcess(url, isBundleOfBundles) {
  const response = await fetch(url);
  const data = await response.json();

  if (isBundleOfBundles) {
    // Process a Bundle of Bundles
    return data.entry
      .map(bundle => bundle.resource.entry)
      .flat()
      .map(entry => entry.resource);
  } else {
    // Process a single Bundle
    return data.entry.map(entry => entry.resource);
  }
}

async function transformDatatorequestphpid(data){
  //console.log(data);

  const newdata ={
    "resourceType": "Task",
    "id": "template-generated-by-server-phpid-req",
    "meta": {
      "versionId": "1",
      "lastUpdated": "2022-06-29T15:36:22.8252002+00:00",
      "source": "http://idmp.who-umc.org/fhir",
      "profile": [
        "http://who-umc.org/idmp/StructureDefinition/Task-who-php-phpid"
      ]
    },
    "contained": [
      {
        "resourceType": "MedicinalProductDefinition",
        "id": "296b006a-f1c6-4595-be0e-0d02a0811710",
        "meta": {
          "versionId": "1",
          "lastUpdated": "2024-02-29T15:36:22.8247159+00:00",
          "source": "http://idmp.who-umc.org/fhir",
          "profile": [
            "http://who-umc.org/idmp/StructureDefinition/MedicinalProductDefinition-who-php-req"
          ]
        },
        "identifier": [
          {
            "system": "http://ema.europa.eu/example/mpid",
            "value": "MPID-123"
          }
        ],
        "type": {
          "coding": [
            {
              "system": "http://hl7.org/fhir/medicinal-product-type",
              "code": "MedicinalProduct"
            }
          ]
        },
        "domain": {
          "coding": [
            {
              "system": "http://hl7.org/fhir/medicinal-product-domain",
              "code": "Human"
            }
          ],
          "text": "Human use"
        },
        "status": {
          "coding": [
            {
              "system": "http://hl7.org/fhir/publication-status",
              "code": "active"
            }
          ],
          "text": "Active"
        },
        "combinedPharmaceuticalDoseForm": {
          "text": "tablet"
        },
        "attachedDocument": [
          {
            "display": "SPC/123"
          }
        ],
        "contact": [
          {
            "type": {
              "coding": [
                {
                  "system": "http://hl7.org/fhir/medicinal-product-contact-type",
                  "code": "ProposedMAH"
                }
              ]
            },
            "contact": {
              "reference": "#acmeinc",
              "type": "Organization",
              "display": "Acme Inc"
            }
          }
        ],
        "name": [
          {
            "productName": "Marvelol",
            "usage": [
              {
                "country": {
                  "coding": [
                    {
                      "system": "urn:iso:std:iso:3166",
                      "code": "NLD"
                    }
                  ]
                },
                "jurisdiction": {
                  "coding": [
                    {
                      "system": "http://who-umc.org/idmp/CodeSystem/jurisdiction",
                      "code": "EU"
                    }
                  ]
                },
                "language": {
                  "coding": [
                    {
                      "system": "urn:ietf:bcp:47",
                      "code": "nl"
                    }
                  ]
                }
              }
            ]
          }
        ]
      },
      {
        "resourceType": "Ingredient",
        "id": "2a5fb5c2-5422-4eff-8326-f9c24fa306e1",
        "meta": {
          "versionId": "1",
          "lastUpdated": "2021-03-09T15:36:22.8249693+00:00",
          "source": "http://idmp.who-umc.org/fhir",
          "profile": [
            "http://who-umc.org/idmp/StructureDefinition/Ingredient-who-php"
          ]
        },
        "status": "active",
        "for": [
          {
            "reference": "#296b006a-f1c6-4595-be0e-0d02a0811710"
          }
        ],
        "role": {
          "coding": [
            {
              "system": "http://hl7.org/fhir/ingredient-role",
              "code": "100000072072"
            }
          ],
          "text": "Active"
        },
        "substance": {
          "code": {
            "concept": {
              "coding": [
                {
                  "system": "http://who-umc.org/idmp/gsid",
                  "code": "GSID23G92UMX93H45"
                }
              ],
              "text": "Methotrexate"
            }
          },
          "strength": [
            {
              "presentationRatio": {
                "numerator": {
                  "value": 1.5,
                  "unit": "mg",
                  "system": "http://unitsofmeasure.org",
                  "code": "mg"
                },
                "denominator": {
                  "value": 1,
                  "unit": "IU",
                  "system": "http://who-umc.org/idmp/CodeSystem/strengthUnit",
                  "code": "IU"
                }
              },
              "textPresentation": "1.5 mg"
            }
          ]
        }
      },
      {
        "resourceType": "Organization",
        "id": "acmeinc",
        "meta": {
          "versionId": "1",
          "lastUpdated": "2023-11-25T15:36:22.8249835+00:00",
          "source": "http://idmp.who-umc.org/fhir",
          "profile": [
            "http://who-umc.org/idmp/StructureDefinition/MarketingAuthorizationHolder-who-php"
          ]
        },
        "active": true,
        "type": [
          {
            "coding": [
              {
                "system": "http://terminology.hl7.org/CodeSystem/organization-type",
                "code": "bus"
              }
            ],
            "text": "Non-Healthcare Business or Corporation"
          }
        ],
        "name": "Acme Inc"
      }
    ],
    "identifier": [
      {
        "system": "http://requester.org/phpidreqid",
        "value": "123456"
      }
    ],
    "status": "requested",
    "intent": "proposal",
    "priority": "routine",
    "authoredOn": "2024-09-21",
    "lastModified": "2024-09-21",
    "input": [
      {
        "type": {
          "coding": [
            {
              "system": "http://who-umc.org/idmp/CodeSystem/task-input-type",
              "code": "mpd-request-resource",
              "display": "Medicinal Product for PhPID request"
            }
          ]
        },
        "valueReference": {
          "reference": "#296b006a-f1c6-4595-be0e-0d02a0811710"
        }
      },
      {
        "type": {
          "coding": [
            {
              "system": "http://who-umc.org/idmp/CodeSystem/task-input-type",
              "code": "ingredient-request-resource",
              "display": "Ingredient for PhPID request"
            }
          ]
        },
        "valueReference": {
          "reference": "#2a5fb5c2-5422-4eff-8326-f9c24fa306e1"
        }
      },
      {
        "type": {
          "coding": [
            {
              "system": "http://who-umc.org/idmp/CodeSystem/task-input-type",
              "code": "organization-request-resource",
              "display": "Marketing Auth Holder for PhPID request"
            }
          ]
        },
        "valueReference": {
          "reference": "#acmeinc"
        }
      }
    ]
  }
  return newdata
}


async function sendTransformedData(url,data){

  const response = await fetch(url, {
    method: 'POST',  // or 'POST', depending on your API
    data: data,
    headers: {
        'Content-Type': 'application/json'
    }
});
console.log(response);
}
// Function to make the request when the button is clicked
async function sendRequest(url) {
  ///get a phpID request.
  try {
      // Display a loading message or indicator (optional)
      console.log('Sending request to:', url);

      // Make the API call
      const response = await fetch(url, {
          method: 'GET',  // or 'POST', depending on your API
          headers: {
              'Content-Type': 'application/json'
          }
      });

      // Check if the response is okay
      if (response.ok) {
          const result = await response.json();

           // Now, transform the data based on the result
           const transformedData = transformDatatorequestphpid(result);

           // Send the transformed data to a different endpoint
           const destinationUrl = 'https://idmp.who-umc.org/fhir/Task';  // Replace with the actual URL
           await sendTransformedData(destinationUrl, transformedData);


          console.log('Request successful:', result);
          // You can update the UI or process the response further here
          alert('Request successful:\n' + JSON.stringify("result", null, 2));

      } else {
          console.error('Request failed with status:', response.status);
      }
  } catch (error) {
      console.error('Error during the request:', error);
  }
}



async function processData(data, baseurl) {
  var processingModal = document.getElementById('processingModal');
  processingModal.style.display = 'block'; // Show the modal
  var totalCount = data.length;

  for (var i = 0; i < totalCount; i++) {
    //    await new Promise(resolve => setTimeout(resolve, 10));


    var resource = data[i];
    if (resource && resource.resourceType === 'MedicinalProductDefinition') {

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
        current_row.push(resource.name[0].usage[0].country.coding[0].display);
      } catch (error) {
        current_row.push(error);
      }

      try {
        current_row.push(
          '<a target="_blank" href="./visualiser/index.html?url=' + baseurl + '/MedicinalProductDefinition/' + resource.id + '">Viewer</a> <br>' +
          '<a target="_blank" href="https://idmp-viewer.azurewebsites.net/display-product?url=' + baseurl + '/MedicinalProductDefinition/' + resource.id + '">Ext. Viewer</a> <br> ');
      } catch (error) {
        current_row.push(error);
      }

      //http://fhir.hl7.pt:8787/fhir/MedicinalProductDefinition?_id=ABASAGLAR-100eml-Solution-SE-IS-MedicinalProductDefinition&_revinclude=RegulatedAuthorization:subject&_include:iterate=RegulatedAuthorization:holder&_revinclude:iterate=Ingredient:for&_revinclude=PackagedProductDefinition:package-for&_include:iterate=PackagedProductDefinition:manufactured-item&_revinclude=AdministrableProductDefinition:form-of&_revinclude:iterate=Ingredient:for&_include:iterate=Ingredient:for&_format=json
      try {
        current_row.push('<a target="_blank" href="' + baseurl + '/MedicinalProductDefinition?_id=' + resource.id + '&_revinclude=RegulatedAuthorization:subject&_include:iterate=RegulatedAuthorization:holder&_revinclude:iterate=Ingredient:for&_revinclude=PackagedProductDefinition:package-for&_include:iterate=PackagedProductDefinition:packaging-manufactured-item&_revinclude=AdministrableProductDefinition:form-of&_revinclude:iterate=Ingredient:for&_include:iterate=Ingredient:for&_format=xml">XML</a> <br> <a href="' + baseurl + '/MedicinalProductDefinition?_id=' + resource.id + '&_revinclude=RegulatedAuthorization:subject&_include:iterate=RegulatedAuthorization:holder&_revinclude:iterate=Ingredient:for&_revinclude=PackagedProductDefinition:package-for&_include:iterate=PackagedProductDefinition:manufactured-item&_revinclude=AdministrableProductDefinition:form-of&_revinclude:iterate=Ingredient:for&_include:iterate=Ingredient:for&_format=json">JSON</a>');
      } catch (error) {
        current_row.push(error);
      }

      /*  try {
          current_row.push('<a target="_blank" href="' + baseurl + '/MedicinalProductDefinition/' + resource.id + '?_format=xml">XML</a> <br> <a href="' + baseurl + '/MedicinalProductDefinition/' + resource.id + '?_format=json">JSON</a>');
        } catch (error) {
          current_row.push(error);
        }
        */

      current_row.push(
        '<span class="full-validation-link">' +
        '<a target="_blank" href="./visualiser/outcome.html?url=' + baseurl + '/MedicinalProductDefinition?_id=' + resource.id + '&_revinclude=RegulatedAuthorization:subject&_include:iterate=RegulatedAuthorization:holder&_revinclude:iterate=Ingredient:for&_revinclude=PackagedProductDefinition:package-for&_include:iterate=PackagedProductDefinition:manufactured-item&_revinclude=AdministrableProductDefinition:form-of&_revinclude:iterate=Ingredient:for&_include:iterate=Ingredient:for&_format=json">Report</a>' +
        '</span>'
      );

      try {
        current_row.push(
          '<span class="requestphpid">' +
          '<button onclick="sendRequest(\'' + baseurl + '/MedicinalProductDefinition?_id=' + resource.id + '\')">Request</button>' +
          '</span>')
      } catch (error) {
        current_row.push(error);
      };
//"<span class="requestphpid"><a target="_blank" href="http://localhost:8080/fhir/MedicinalProductDefinition?_id=CefuroximStragen-1-5g-Powder-SE-IS-MedicinalProductDefinition>Request</a></span>"
    // console.log(current_row);
      t.row.add(current_row);
      // Update progress indicator
      progressIndicator.innerText = 'Processing product ' + (i + 1) + ' of ' + totalCount + '...';
    }
  }

  // Hide the progress indicator after processing
  processingModal.style.display = 'none'; // Hide the modal

  // Draw the DataTable after all data is added
  t.draw();




}





// document.addEventListener('DOMContentLoaded', function () {
//   // Your JavaScript code here, including the event listener for the "Validate All" button

//   // Fetch the configuration from config.json
//   fetch('config.json')
//     .then((response) => {
//       return response.json();
//     })
//     .then((config) => {
//       // Get the server_url from the config
//       var baseurl = config.server_url;

//       // Construct the URL for fetching Bundle resources
//       var url = baseurl + '/MedicinalProductDefinition?_format=json&_count=20000';





//       // Fetch data from the constructed URL
//       return fetch(url)
//         .then((response) => {
//           return response.json();
//         })
//         .then((bundles) => {
//           initializeDataTable(); // Initialize DataTable 

//           // clearValidationLabels(); // Clear validation labels




//           // document.getElementById('validate-all-button').addEventListener('click', function () {
//           //   // Iterate through all rows in the DataTable
//           //   t.rows().every(function () {
//           //     const resourceId = this.data()[0]; // Assuming the resource ID is in the first column

//           //     if (resourceId) {
//           //       // Trigger the validation for each resource
//           //       validateResource(resourceId, baseurl)
//           //         .then((validationData) => {
//           //           // Update the validation labels for the current row
//           //           populateValidationLabels(resourceId, validationData);
//           //         });
//           //     }
//           //   });
//           // });

// // Show the progress indicator
// var progressIndicator = document.getElementById('progressIndicator');
// progressIndicator.style.display = 'block';

// // Get the total count
// var totalCount = bundles.entry.length;



//           // Handle click events on "Validate" buttons
//           $('#prod-table').on('click', '.validate-button', function () {
//             var resourceId = $(this).data('resource-id');
//             validateAndPopulateLabels(resourceId, baseurl);
//           });
//         })
//         .catch((error) => {
//           console.error('Error fetching data:', error);
//         });
//     })
//     .catch((error) => {
//       console.error('Error fetching configuration:', error);
//     });




// });




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







