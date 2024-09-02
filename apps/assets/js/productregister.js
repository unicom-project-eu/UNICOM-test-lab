document.getElementById('questionnaireForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const selects = document.querySelectorAll('.dynamic-select');
    //start transaction
    const selectedData = {};

    selects.forEach(select => {
        const selectData = $(select).select2('data');
        if (!selectedData[select.id]) {
            selectedData[select.id] = [];
        }
        selectData.forEach(item => {
            selectedData[select.id].push({
                id: item.id,
                text: item.text
            });
        });
    });

    console.log('All selected data:', selectedData);

    // Create FHIR-compliant JSON
    var fhirTransaction = {
        "resourceType": "Bundle",
        "id": "bundle-transaction",
        "type": "transaction",
        "entry": [
        ]
    };

    ////////////////////////////////////////////// Capture form data for MEDICINAL PRODUCT DEFINITION //////////////////////////////////////////////
    const MPID = document.getElementById('MPID').value;
    const IVP = document.getElementById('IVP').value;
    const SP = document.getElementById('SP').value;
    const PDFP = document.getElementById('PDFP').value;


    var mpd = {
        "fullUrl": "MedicinalProductDefinition/" + MPID,
        "resource": {
            "resourceType": "MedicinalProductDefinition",
            "meta": {
                "profile": [
                    "http://unicom-project.eu/fhir/StructureDefinition/PPLMedicinalProductDefinition"
                ]
            },
            "identifier": [
                {
                    "system": "http://ema.europa.eu/fhir/mpId",
                    "value": MPID,
                }
            ],
            "domain": {
                "coding": [
                    {
                        "system": "https://spor.ema.europa.eu/v1/lists/100000000004",
                        "code": "100000000012",
                        "display": "Human use"
                    }
                ]
            },
            "status": {
                "coding": [
                    {
                        "system": "https://spor.ema.europa.eu/v1/lists/200000005003",
                        "code": "200000005004",
                        "display": "Current"
                    }
                ]
            },
            "combinedPharmaceuticalDoseForm": {
                "coding": [
                    {
                        "system": "https://spor.ema.europa.eu/v1/lists/200000000004",
                        "code": selectedData['mpddoseform'][0].id,
                        "display": selectedData["mpddoseform"][0].text
                    }
                ]
            },
            "legalStatusOfSupply": {
                "coding": [
                    {
                        "system": "https://spor.ema.europa.eu/v1/lists/100000072051",
                        "code": "100000072084",
                        "display": "Medicinal product subject to medical prescription"
                    }
                ]
            },
            "classification": [
                {
                  "coding": [
                    {
                      "code": selectedData['classification'][0].id,
                      "system": "https://spor.ema.europa.eu/v1/lists/100000093533",
                      "display": selectedData['classification'][0].text,
                    }
                  ]
                }],
            "name": [
                {
                    "productName": IVP + " " + SP + " " + PDFP,
                    "part": [
                        {
                            "part": IVP,
                            "type": {
                                "coding": [
                                    {
                                        "system": "https://spor.ema.europa.eu/v1/lists/220000000000",
                                        "code": "220000000002",
                                        "display": "Invented name part"
                                    }
                                ]
                            }
                        },
                        {
                            "part": SP,
                            "type": {
                                "coding": [
                                    {
                                        "system": "https://spor.ema.europa.eu/v1/lists/220000000000",
                                        "code": "220000000004",
                                        "display": "Strength part"
                                    }
                                ]
                            }
                        },
                        {
                            "part": PDFP,
                            "type": {
                                "coding": [
                                    {
                                        "system": "https://spor.ema.europa.eu/v1/lists/220000000000",
                                        "code": "220000000005",
                                        "display": "Pharmaceutical dose form part"
                                    }
                                ]
                            }
                        }
                    ],
                    "usage": [
                        {
                            "country": {
                                "coding": [
                                    {
                                        "system": "https://spor.ema.europa.eu/v1/lists/100000000002",
                                        "code": selectedData["nameusage"][0].id,
                                        "display": selectedData["nameusage"][0].text,
                                    }
                                ]
                            },
                            "language": {
                                "coding": [
                                    {
                                        "system": "urn:ietf:bcp:47",
                                        "code": selectedData["language"][0].id,
                                        "display": selectedData["language"][0].id,
                                    }
                                ]
                            }
                        }
                    ]
                }]
        },
        "request": {
            "method": "POST",
            "url": "MedicinalProductDefinition"
        }
    };
    fhirTransaction["entry"].push(mpd);
    ////////////////////////////////////////////// Capture form data for MEDICINAL PRODUCT DEFINITION //////////////////////////////////////////////

    const MAH = document.getElementById('MAH').value;
    const MAID = document.getElementById('MAID').value;
    const MASTATUSDATE = document.getElementById('MASTATUSDATE').value;
    const MAHID = document.getElementById('MAHID').value;

    var reagauth = {
        "fullUrl": "RegulatedAuthorization/" + MAID,
        "resource": {
            "resourceType": "RegulatedAuthorization",
            "meta": {
                "profile": [
                    "http://unicom-project.eu/fhir/StructureDefinition/PPLRegulatedAuthorization"
                ]
            },
            "identifier": [
                {
                    "value": MAID,
                }
            ],
            "subject": [
                {
                    "reference": "MedicinalProductDefinition/" + MPID
                }
            ],
            "type": {
                "coding": [
                    {
                        "system": "https://spor.ema.europa.eu/v1/lists/220000000060",
                        "code": "220000000061",
                        "display": "Marketing Authorisation"
                    }
                ]
            },
            "region": [
                {
                    "coding": [
                        {
                            "system": "https://spor.ema.europa.eu/v1/lists/100000000002",
                            "code": selectedData["region"][0].id,
                            "display": selectedData["region"][0].text,
                        }
                    ]
                }
            ],
            "status": {
                "coding": [
                    {
                        "system": "https://spor.ema.europa.eu/v1/lists/100000072049",
                        "code": selectedData["mahstatus"][0].id,
                        "display": selectedData["mahstatus"][0].text,
                    }
                ]
            },
            "statusDate": MASTATUSDATE,
            "holder": {
                "reference": "Organization/" + MAHID + "-" + MAH,
            }
        }, "request": {
            "method": "POST",
            "url": "RegulatedAuthorization"
        }
    };
    fhirTransaction["entry"].push(reagauth);

    ////////////////////////////////////////////// Capture form data for MEDICINAL PRODUCT DEFINITION //////////////////////////////////////////////

    var org = {
        "fullUrl": "Organization/" + MAHID + "-" + MAH,
        "resource": {
            "resourceType": "Organization",
            "meta": {
                "profile": [
                    "http://unicom-project.eu/fhir/StructureDefinition/PPLOrganization"
                ]
            },
            "identifier": [
                {
                    "system": "https://spor.ema.europa.eu/v1/locations",
                    "value": MAHID
                }
            ],
            "name": MAH,
        }, "request": {
            "method": "POST",
            "url": "Organization"
        }
    };
    fhirTransaction["entry"].push(org);

    ////////////////////////////////////////////// Capture form data for MEDICINAL PRODUCT DEFINITION //////////////////////////////////////////////


    var roas = [];
    for (var i = 0; i < selectedData["roa"].length; i++) {

        roas.push({
            "code": {
                "coding": [
                    {
                        "system": "https://spor.ema.europa.eu/v1/lists/100000073345",
                        "code": selectedData["roa"][i].id,
                        "display": selectedData["roa"][i].text
                    }
                ]
            }
        })
    };

    var apd = {
        "fullUrl": "AdministrableProductDefinition/" + MPID + "-APD",
        "resource": {
            "resourceType": "AdministrableProductDefinition",
            "meta": {
                "profile": [
                    "http://unicom-project.eu/fhir/StructureDefinition/PPLAdministrableProductDefinition"
                ]
            },

            "status": "active",
            "formOf": [
                {
                    "reference": "MedicinalProductDefinition/" + MPID
                }
            ],
            "administrableDoseForm": {
                "coding": [
                    {
                        "system": "https://spor.ema.europa.eu/v1/lists/200000000004",
                        "code": selectedData["apddoseform"][0].id,
                        "display": selectedData["apddoseform"][0].text,
                    }
                ]
            },
            "unitOfPresentation": {
                "coding": [
                    {
                        "system": "https://spor.ema.europa.eu/v1/lists/200000000014",
                        "code": selectedData["apdunit"][0].id,
                        "display": selectedData["apdunit"][0].text,
                    }
                ]
            },
            "producedFrom": [
                {
                    "reference": "ManufacturedItemDefinition/" + MPID + "-MID"
                }
            ],
            "routeOfAdministration": roas,
        }, "request": {
            "method": "POST",
            "url": "AdministrableProductDefinition"
        }
    };
    fhirTransaction["entry"].push(apd);

    ////////////////////////////////////////////// Capture form data for MEDICINAL PRODUCT DEFINITION //////////////////////////////////////////////

    var mid = {
        "fullUrl": "ManufacturedItemDefinition/" + MPID + "-MID",
        "resource": {
            "resourceType": "ManufacturedItemDefinition",
            "meta": {
                "profile": [
                    "http://unicom-project.eu/fhir/StructureDefinition/PPLManufacturedItemDefinition"
                ]
            },
            "status": "active",
            "manufacturedDoseForm": {
                "coding": [
                    {
                        "system": "https://spor.ema.europa.eu/v1/lists/200000000004",
                        "code": selectedData["middoseform"][0].id,
                        "display": selectedData["middoseform"][0].text,
                    }
                ]
            },
            "unitOfPresentation": {
                "coding": [
                    {
                        "system": "https://spor.ema.europa.eu/v1/lists/200000000014",
                        "code": selectedData["midunitpres"][0].id,
                        "display": selectedData["midunitpres"][0].text,
                    }
                ]
            }
        }, "request": {
            "method": "POST",
            "url": "ManufacturedItemDefinition"
        }
    };
    fhirTransaction["entry"].push(mid);

    ////////////////////////////////////////////// Capture form data for MEDICINAL PRODUCT DEFINITION //////////////////////////////////////////////


    const packdescription = document.getElementById('packdescription').value;
    const packquantity = document.getElementById('packquantity').value;

    var materials = [];
    for (var i = 0; i < selectedData["packquantitymaterial"].length; i++) {

        materials.push({
            "code": {
                "coding": [
                    {
                        "system": "https://spor.ema.europa.eu/v1/lists/200000003199",
                        "code": selectedData["packquantitymaterial"][i].id,
                        "display": selectedData["packquantitymaterial"][i].text
                    }
                ]
            }
        })
    };

    const packidentifier = document.getElementById('packidentifier').value;

    const containedelements = document.getElementById('containedelements').value;

    var ppd = {
        "fullUrl": "PackagedProductDefinition-" + MPID + "-PPD",
        "resource": {
            "resourceType": "PackagedProductDefinition",
            "meta": {
                "profile": [
                    "http://unicom-project.eu/fhir/StructureDefinition/PPLPackagedProductDefinition"
                ]
            },

            "identifier": [
                {
                    "system": "http://ema.europa.eu/example/pcid",
                    "value": packidentifier
                }
            ],
            "packageFor": [
                {
                    "reference": "MedicinalProductDefinition/" + MPID,
                }
            ],
            "containedItemQuantity": [
                {
                    "value": packquantity,
                    "unit": selectedData["packquantityunit"][0].text,
                    "system": "https://spor.ema.europa.eu/v1/lists/200000000014",
                    "code": selectedData["packquantityunit"][0].id
                }
            ],
            "description": packdescription,
            "packaging": {
                "type": {
                    "coding": [
                        {
                            "system": "https://spor.ema.europa.eu/v1/lists/100000073346",
                            "code": "100000073498",
                            "display": "Box"
                        }
                    ]
                },
                "quantity": 1,
                "material": [
                    {
                        "coding": [
                            {
                                "system": "https://spor.ema.europa.eu/v1/lists/200000003199",
                                "code": "200000003529",
                                "display": "Cardboard"
                            }
                        ]
                    }
                ],
                "packaging": [
                    {
                        "type": {
                            "coding": [
                                {
                                    "system": "https://spor.ema.europa.eu/v1/lists/100000073346",
                                    "code": selectedData["packsizeunit"][0].id,
                                    "display": selectedData["packsizeunit"][0].text,
                                }
                            ]
                        },
                        "quantity": packsize,
                        "material": materials,
                        "containedItem": [
                            {
                                "item": {
                                    "reference": {
                                        "reference": "ManufacturedItemDefinition/" + MPID + "-MID"
                                    }
                                },
                                "amount": {
                                    "value": containedelements,
                                }
                            }
                        ]
                    }
                ]
            }
        }, "request": {
            "method": "POST",
            "url": "PackagedProductDefinition"
        }
    };
    fhirTransaction["entry"].push(ppd);

    ////////////////////////////////////////////// Capture form data for INGREDIENT //////////////////////////////////////////////

    var ingcount = document.querySelectorAll("#ingredientBoxContainer > div").length;

    console.log('Number of Ingredients:', ingcount);

    for (var i = 0; i < ingcount; i++) {
        if (i == 0) { appendix = "" }
        else { appendix = i + 1 }
        console.log(i);
        console.log(appendix);
        const substrole = document.getElementById('substrole' + appendix).selectedOptions[0].textContent;
        const substroleid = document.getElementById('substrole' + appendix).selectedOptions[0].value;

        const psnumerator = document.getElementById('ps-numerator' + appendix).value;

        const psdenominator = document.getElementById('ps-denominator' + appendix).value;

        const rsnumerator = document.getElementById('rs-numerator' + appendix).value;

        const rsdenominator = document.getElementById('rs-denominator' + appendix).value;
        console.log(selectedData["substance" + appendix][0].id);
        var ing = {
            "fullUrl": "Ingredient-" + MPID + "-" + appendix,
            "resource": {
                "resourceType": "Ingredient",
                "meta": {
                    "profile": [
                        "http://unicom-project.eu/fhir/StructureDefinition/PPLIngredient"
                    ]
                },
                "status": "active",
                "for": [
                    {
                        "reference": "MedicinalProductDefinition/" + MPID
                    },
                    {
                        "reference": "ManufacturedItemDefinition/" + MPID + "-MID",
                    },
                    {
                        "reference": "AdministrableProductDefinition/" + MPID + "-APD",
                    }
                ],
                "role": {
                    "coding": [
                        {
                            "system": "https://spor.ema.europa.eu/v1/lists/100000072050",
                            "code": substroleid,
                            "display": substrole,
                        }
                    ]
                },
                "substance": {
                    "code": {
                        "concept": {
                            "coding": [
                                {
                                    "system": "https://spor.ema.europa.eu/v2/SubstanceDefinition",
                                    "code": selectedData["substance" + appendix][0].id,
                                    "display": selectedData["substance" + appendix][0].text
                                }
                            ]
                        }
                    },
                    "strength": [
                        {
                            "presentationRatio": {
                                "numerator": {
                                    "value": psnumerator,
                                    "unit": selectedData["ps-num-unit" + appendix][0].text,
                                    "system": "https://spor.ema.europa.eu/v1/lists/100000110633",
                                    "code": selectedData["ps-num-unit" + appendix][0].id,
                                },
                                "denominator": {
                                    "value": psdenominator,
                                    "unit": selectedData["ps-den-unit" + appendix][0].text,
                                    "system": "https://spor.ema.europa.eu/v1/lists/200000000014",
                                    "code": selectedData["ps-den-unit" + appendix][0].id
                                }
                            },
                            "referenceStrength": [
                                {
                                    "substance": {
                                        "concept": {
                                            "coding": [
                                                {
                                                    "system": "https://spor.ema.europa.eu/v2/SubstanceDefinition",
                                                    "code": selectedData["refsubstance" + appendix][0].id,
                                                    "display": selectedData["refsubstance" + appendix][0].text
                                                }
                                            ]
                                        }
                                    },
                                    "strengthRatio": {
                                        "numerator": {
                                            "value": rsnumerator,
                                            "unit": selectedData["rs-num-unit" + appendix][0].text,
                                            "system": "https://spor.ema.europa.eu/v1/lists/100000110633",
                                            "code": selectedData["rs-num-unit" + appendix][0].id
                                        },
                                        "denominator": {
                                            "value": rsdenominator,
                                            "unit": selectedData["rs-den-unit" + appendix][0].text,
                                            "system": "https://spor.ema.europa.eu/v1/lists/200000000014",
                                            "code": selectedData["rs-den-unit" + appendix][0].id
                                        }
                                    }
                                }
                            ]
                        }
                    ]
                }
            }, "request": {
                "method": "POST",
                "url": "Ingredient"
            }
        };

        fhirTransaction["entry"].push(ing);

    }

    // Convert JSON object to string
    const fhirTransactionString = JSON.stringify(fhirTransaction);
    console.log(fhirTransactionString);



    // Push JSON to server
    // Load server URL from config.json
    fetch('config.json')
        .then(response => response.json())
        .then(config => {
            var baseurl = config.server_url;
            console.log(baseurl);

            // Push JSON to server using the baseurl from config.json
            fetch(baseurl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/fhir+json'
                },
                body: fhirTransactionString
            })
                .then(response => {
                    if (response.ok) {
                        showNotification("Submission successful!");

                        return response.json();
                    }
                    throw new Error('Network response was not ok.');
                })
                .then(data => {
                    console.log('Success:', data);
                })
                .catch(error => {
                    showNotification("Submission failed!", true);

                    console.error('Error:', error);
                });

        })
        .catch(error => {
            console.error('Error loading config:', error);
        });

    // Function to show notification
    function showNotification(message, isError = false) {
        const notificationDiv = document.getElementById("notification");
        notificationDiv.textContent = message;
        notificationDiv.style.backgroundColor = isError ? '#f44336' : '#4CAF50';  // Red for error, green for success
        notificationDiv.style.display = 'block';
        setTimeout(() => {
            notificationDiv.style.display = 'none';
        }, 3000);
    }

    // Display FHIR transaction string
    const jsonOutputDiv = document.getElementById("jsonOutput");
    jsonOutputDiv.innerHTML = `<pre>${fhirTransactionString}</pre>`;
});
