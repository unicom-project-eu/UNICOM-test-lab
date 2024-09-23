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




async function sendTransformedData(url, data) {
  //console.log(data);

  const mpd = data["entry"].find(item => item.resource && item.resource.resourceType === "MedicinalProductDefinition");
  const org = data["entry"].find(item => item.resource && item.resource.resourceType === "Organization");
  const ingre = data["entry"].find(item => item.resource && item.resource.resourceType === "Ingredient");

  delete mpd.resource.meta;
  delete org.resource.meta;
  delete ingre.resource.meta;
  delete ingre.resource.substance.strength[0].referenceStrength;
  delete mpd.resource.text;
  delete org.resource.text;
  delete ingre.resource.text;

  //  delete ingre.resource.for.splice(1, 2); //test only
  delete ingre.resource.for

  const mpid_id = mpd["resource"]["id"];
  const org_id = org["resource"]["id"];
  const ingre_id = ingre["resource"]["id"];

  ingre["resource"]["for"] = [{
    "reference": "#" + mpid_id
  }]

  mpd["resource"]["contact"] = [
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
        "reference": "#" + org_id,
        "type": "Organization",
        "display": "Acme Inc"
      }
    }
  ];

  mpd["resource"]["attachedDocument"] = [
    {
      "display": "SPC/123"
    }
  ];


  mpd["resource"]["name"][0]["usage"][0]["jurisdiction"] = {
    "coding": [
      {
        "system": "http://who-umc.org/idmp/CodeSystem/jurisdiction",
        "code": "EU"
      }
    ]
  };

  ingre["resource"]["substance"]["code"]["concept"]["text"] = ingre["resource"]["substance"]["code"]["concept"]["coding"][0]["display"]


// translate codesystem for domain
const domainurl ='http://localhost:8080/fhir/ConceptMap/$translate?system=' + mpd.resource.domain.coding[0].system + '&code=' + mpd.resource.domain.coding[0].code + '&reverse=true';
console.log(domainurl);  
const domainresponse = await fetch(domainurl, {
    method: 'GET'
  });

  delete mpd.resource.domain;
  const jsonResponse_domain = await domainresponse.json();

  const matchParameter_domain = jsonResponse_domain.parameter.find(param => param.name === "match");
  const conceptPart_domain = matchParameter_domain.part.find(part => part.name === "concept");
  const system = conceptPart_domain.valueCoding.system;
  const code = conceptPart_domain.valueCoding.code;


  mpd.resource.domain = {
    "coding": [
      {
        "system": system,
        "code": code
      }
    ],
    "text": code
  };


  console.log(mpd.resource.name[0].usage[0]);
  // translate codesystem for usage country
  countryrul='http://localhost:8080/fhir/ConceptMap/$translate?system=' + mpd.resource.name[0].usage[0].country.coding[0].system + '&code=' + mpd.resource.name[0].usage[0].country.coding[0].code + '&reverse=true';
  console.log(countryrul);
  const countryresponse = await fetch(countryrul, {method: 'GET'});

  const jsonResponse_country = await countryresponse.json();

  delete mpd.resource.domain;

  console.log(jsonResponse_country);
  const matchParameter_country = jsonResponse_country.parameter.find(param => param.name === "match");
  const conceptPart_country = matchParameter_country.part.find(part => part.name === "concept");
  const system_country = conceptPart_country.valueCoding.system;
  const code_country = conceptPart_country.valueCoding.code;


  mpd["resource"]["name"][0]["usage"][0]["country"] = {"coding": [{"system": system_country,"code": code_country}]};
  
   //console.log(mpd);
  const newdata = {
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
    "contained": [mpd["resource"], ingre["resource"], org["resource"]
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
          "reference": "#" + mpid_id
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
          "reference": "#" + ingre_id
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
          "reference": "#" + org_id
        }
      }
    ]
  }

  console.log("task created:", JSON.stringify(newdata));

  const response = await fetch(url, {
    method: 'POST',  // or 'POST', depending on your API
    body: JSON.stringify(newdata),  // Use 'body' to send data and stringify it
    headers: {
      'Content-Type': 'application/json+fhir',
      'Ocp-Apim-Subscription-Key': 'c1847d6e-176b-41d9-9db0-5d5e37b8fc85'
    }
  });
  //console.log("the response from umc is",response.json());
  // Parse the response as JSON
  const jsonResponse = await response.json();

  // Log the JSON result
  console.log("the response from umc is:", JSON.stringify(jsonResponse));
  return jsonResponse;
}
// Function to make the request when the button is clicked
async function sendRequest(url) {
  const newurl = url + "&_revinclude:iterate=Ingredient:for&_revinclude=RegulatedAuthorization:subject&_include:iterate=RegulatedAuthorization:holder#L16"

  ///get a phpID request.
  try {
    // Display a loading message or indicator (optional)
    console.log('Sending request to:', newurl);

    // Make the API call
    const response = await fetch(newurl, {
      method: 'GET',  // or 'POST', depending on your API
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Check if the response is okay
    if (response.ok) {
      const result = await response.json();

      // Now, transform the data based on the result
      //const transformedData = transformDatatorequestphpid(result);

      // Send the transformed data to a different endpoint
      const destinationUrl = 'https://idmp.who-umc.org/fhir/Task';  // Replace with the actual URL
      const resultdata = await sendTransformedData(destinationUrl, result);


      console.log('Request successful:', resultdata);

      if (resultdata["resourceType"]=="OperationOutcome"){
      var messagetoshow="An error ocurred requesting PhPID"
    }else{
      var messagetoshow="A task with id:"+resultdata["id"]+" was created"
    }
      // You can update the UI or process the response further here
      if (resultdata){
      alert('Request successful:\n' + messagetoshow);
    }
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







