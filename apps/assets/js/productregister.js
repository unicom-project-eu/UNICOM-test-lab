document.getElementById('questionnaireForm').addEventListener('submit', function (event) {
    event.preventDefault();

    ////////////////////////////////////////////// Capture form data for MEDICINAL PRODUCT DEFINITION //////////////////////////////////////////////
    const MPID = document.getElementById('MPID').value;
    const IVP = document.getElementById('IVP').value;
    const SP = document.getElementById('SP').value;
    const PDFP = document.getElementById('PDFP').value;
    const nameusage = document.getElementById('nameusage').value;
    const nameusageid = document.getElementById('nameusage').id;
    const mpddoseform = document.getElementById('mpddoseform').value;
    const mpddoseformid = document.getElementById('mpddoseform').id;

    var mpd = {
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
                    "code": mpddoseformid,
                    "display": mpddoseform
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
                                    "code": nameusageid,
                                    "display": nameusage,
                                }
                            ]
                        },
                        "language": {
                            "coding": [
                                {
                                    "system": "urn:ietf:bcp:47",
                                    "code": "et",
                                    "display": "Estonian"
                                }
                            ]
                        }
                    }
                ]
            }]
    };
    ////////////////////////////////////////////// Capture form data for MEDICINAL PRODUCT DEFINITION //////////////////////////////////////////////

    const region = document.getElementById('region').value;
    const regionid = document.getElementById('region').id;

    const mahstatus = document.getElementById('mahstatus').value;
    const mahstatusid = document.getElementById('mahstatus').id;

    const MAH = document.getElementById('MAH').value;
    const MAID = document.getElementById('MAID').value;
    const MASTATUSDATE = document.getElementById('MASTATUSDATE').value;

    var reagauth={
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
                        "code": regionid,
                        "display": region,
                    }
                ]
            }
        ],
        "status": {
            "coding": [
                {
                    "system": "https://spor.ema.europa.eu/v1/lists/100000072049",
                    "code": mahstatusid,
                    "display": mahstatus
                }
            ]
        },
        "statusDate": MASTATUSDATE,
        "holder": {
            "reference": "Organization/" + MAHID + "-" + MAH,
        }
    };

       ////////////////////////////////////////////// Capture form data for MEDICINAL PRODUCT DEFINITION //////////////////////////////////////////////

    const MAHID = document.getElementById('MAHID').value;
    const FHIRBASE = "http://localhost:8080/fhir/"


    var org={
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
    };
    ////////////////////////////////////////////// Capture form data for MEDICINAL PRODUCT DEFINITION //////////////////////////////////////////////

    const apddoseformid = document.getElementById('mahstatus').id;
    const apddoseform = document.getElementById('mahstatus').value;

    const apdunit = document.getElementById('apdunit').value;
    const apdunitid = document.getElementById('apdunit').id;

    const selectedRoas = $('#roa').select2('data').map(option => ({
        id: option.id,
        text: option.text
    }));
    console.log('Selected RoA:', selectedRoas);
    var roas = [];
    for (var i = 0; i < selectedRoas.length; i++) {

        roas.push({
            "code": {
                "coding": [
                    {
                        "system": "https://spor.ema.europa.eu/v1/lists/100000073345",
                        "code": selectedRoas[i].id,
                        "display": selectedRoas[i].text
                    }
                ]
            }
        })
    };

    var apd={
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
                    "code": apddoseformid,
                    "display": apddoseform
                }
            ]
        },
        "unitOfPresentation": {
            "coding": [
                {
                    "system": "https://spor.ema.europa.eu/v1/lists/200000000014",
                    "code": apdunitid,
                    "display": apdunit
                }
            ]
        },
        "producedFrom": [
            {
                "reference": "ManufacturedItemDefinition/" + MPID + "-MID"
            }
        ],
        "routeOfAdministration": roas,
    };
    ////////////////////////////////////////////// Capture form data for MEDICINAL PRODUCT DEFINITION //////////////////////////////////////////////

    
    const midunitpres = document.getElementById('apdunit').value;
    const midunitpresid = document.getElementById('apdunit').id;

    const middoseform = document.getElementById('apdunit').value;
    const middoseformid = document.getElementById('apdunit').id;


    var mid={
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
                    "code": middoseformid,
                    "display": middoseform
                }
            ]
        },
        "unitOfPresentation": {
            "coding": [
                {
                    "system": "https://spor.ema.europa.eu/v1/lists/200000000014",
                    "code": midunitpresid,
                    "display": midunitpres
                }
            ]
        }
    };
    ////////////////////////////////////////////// Capture form data for MEDICINAL PRODUCT DEFINITION //////////////////////////////////////////////

    const packquantityunit = document.getElementById('packquantityunit').value;
    const packquantityunitid = document.getElementById('packquantityunit').id;
    const packdescription = document.getElementById('packdescription').value;
    const packquantity = document.getElementById('packquantity').value;
    const selectedMaterials = $('#packquantitymaterial').select2('data').map(option => ({
        id: option.id,
        text: option.text
    }));
    console.log('Selected packquantitymaterial:', selectedMaterials);

    var materials = [];
    for (var i = 0; i < selectedMaterials.length; i++) {

        materials.push({
            "code": {
                "coding": [
                    {
                        "system": "https://spor.ema.europa.eu/v1/lists/200000003199",
                        "code": selectedMaterials[i].id,
                        "display": selectedMaterials[i].text
                    }
                ]
            }
        })
    };
    
    const packidentifier = document.getElementById('packidentifier').value;
    const packsizeunit = document.getElementById('packsizeunit').value;
    const packsize = document.getElementById('packsize').value;
    const packsizeunitid = document.getElementById('packsizeunit').id;
    const containedelements= document.getElementById('packsizeunit').value;

    var ppd={
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
                "unit": packquantityunit,
                "system": "https://spor.ema.europa.eu/v1/lists/200000000014",
                "code": packquantityunitid,
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
                                "code": packsizeunitid,
                                "display": packsizeunit
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
    };
   
  // check how many ings:

   // Select the parent div by its id
   const parentDiv = document.getElementById('ingredientBoxContainer');

   // Select all child div elements
   const childDivs = parentDiv.querySelectorAll('div');

   // Get the count of child divs
   const ingcount = childDivs.length;
   var ings={};
   console.log('Number of Ingredients:', ingcount);

    for (var i = 0; i < ingcount; i++) {
    if(i==0){appendix=""}
    else{appendix=i}
    const substrole = document.getElementById('substrole'+appendix).value;
    const substroleid = document.getElementById('substrole'+appendix).id;

    const substance = document.getElementById('substance'+appendix).value;
    const substanceid = document.getElementById('substance'+appendix).id;

    const psnumerator = document.getElementById('ps-numerator'+appendix).value;
    const psnumunit = document.getElementById('ps-num-unit'+appendix).value;
    const psnumunitid = document.getElementById('ps-num-unit'+appendix).id;

    const psdenominator = document.getElementById('ps-denominator'+appendix).value;
    const psdenunit = document.getElementById('ps-den-unit'+appendix).value;
    const psdenunitid = document.getElementById('ps-den-unit'+appendix).id;

    const rsnumerator = document.getElementById('rs-numerator'+appendix).value;
    const rsnumunit = document.getElementById('rs-num-unit'+appendix).value;
    const rsnumunitid = document.getElementById('rs-num-unit'+appendix).id;

    const rsdenominator = document.getElementById('rs-denominator'+appendix).value;
    const rsdenunit = document.getElementById('rs-den-unit'+appendix).value;
    const rsdenunitid = document.getElementById('rs-den-unit'+appendix).id;

    var ing={
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
                    "display": substrole
                }
            ]
        },
        "substance": {
            "code": {
                "concept": {
                    "coding": [
                        {
                            "system": "https://spor.ema.europa.eu/v2/SubstanceDefinition",
                            "code": substanceid,
                            "display": substance
                        }
                    ]
                }
            },
            "strength": [
                {
                    "presentationRatio": {
                        "numerator": {
                            "value": psnumerator,
                            "unit": psnumunit,
                            "system": "https://spor.ema.europa.eu/v1/lists/100000110633",
                            "code": psnumunitid
                        },
                        "denominator": {
                            "value": psdenominator,
                            "unit": psdenunit,
                            "system": "https://spor.ema.europa.eu/v1/lists/200000000014",
                            "code": psdenunitid
                        }
                    },
                    "referenceStrength": [
                        {
                            "substance": {
                                "concept": {
                                    "coding": [
                                        {
                                            "system": "https://spor.ema.europa.eu/v2/SubstanceDefinition",
                                            "code": "100000085259",
                                            "display": "Amlodipine"
                                        }
                                    ]
                                }
                            },
                            "strengthRatio": {
                                "numerator": {
                                    "value": rsnumerator,
                                    "unit": rsnumunit,
                                    "system": "https://spor.ema.europa.eu/v1/lists/100000110633",
                                    "code": rsnumunitid
                                },
                                "denominator": {
                                    "value": rsdenominator,
                                    "unit": rsdenunit,
                                    "system": "https://spor.ema.europa.eu/v1/lists/200000000014",
                                    "code": rsdenunitid
                                }
                            }
                        }
                    ]
                }
            ]
        }
    };

    ings.push({
        "fullUrl": "Ingredient" + MPID + "-" + substanceid+appendix,
        "resource": ing, "request": {
            "method": "POST",
            "url": "Ingredient"
        }
    })


    }

    // Create FHIR-compliant JSON
    var fhirTransaction = {
        "resourceType": "Bundle",
        "id": "bundle-transaction",
        "type": "transaction",
        "entry": [
            {
                "fullUrl": "MedicinalProductDefinition/" + MPID,
                "resource": mpd,
                "request": {
                    "method": "POST",
                    "url": "MedicinalProductDefinition"
                }
            },
            {
                "fullUrl": "RegulatedAuthorization/" + MAID,
                "resource": reagauth, "request": {
                    "method": "POST",
                    "url": "RegulatedAuthorization"
                }
            },
            {
                "fullUrl": "Organization/" + MAHID + "-" + MAH,
                "resource": org, "request": {
                    "method": "POST",
                    "url": "Organization"
                }
            },
            {
                "fullUrl": "AdministrableProductDefinition/" + MPID + "-APD",
                "resource": apd, "request": {
                    "method": "POST",
                    "url": "AdministrableProductDefinition"
                }
            },
            {
                "fullUrl": "ManufacturedItemDefinition/" + MPID + "-MID",
                "resource": mid, "request": {
                    "method": "POST",
                    "url": "ManufacturedItemDefinition"
                }
            },
           ings,
            {
                "fullUrl": "PackagedProductDefinition-" + MPID + "-PPD",
                "resource": ppd, "request": {
                    "method": "POST",
                    "url": "PackagedProductDefinition"
                }
            }
        ]
    };



    // Convert JSON object to string
    const fhirTransactionString = JSON.stringify(fhirTransaction);
    console.log(fhirTransactionString);



    // Push JSON to server
    fetch('http://localhost:8080/fhir', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/fhir+json'
        },
        body: fhirTransactionString
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Network response was not ok.');
        })
        .then(data => {
            console.log('Success:', data);
        })
        .catch(error => {
            console.error('Error:', error);
        });
});
