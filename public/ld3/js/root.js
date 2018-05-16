var _root = {
    "Ingest_LDD": {
        "$": {
            "xmlns": "http://pds.nasa.gov/pds4/pds/v1",
            "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
            "xsi:schemaLocation": "http://pds.nasa.gov/pds4/pds/v1 \n        http://pds.nasa.gov/pds4/pds/v1/PDS4_PDS_1100.xsd "
        },
        "name": [""],
        "ldd_version_id": ["1.0.0.0"],
        "full_name": [""],
        "steward_id": [""],
        "namespace_id": [""],
        "comment": [""],
        "last_modification_date_time": [""],
        "DD_Attribute": [],
        "DD_Class": [{
            "name": [""],
            "version_id": [""],
            "local_identifier": [""],
            "submitter_name": [""],
            "definition": [""],
            "DD_Association": []
        }]
    }
};

var _testRoot = {
    "Ingest_LDD": {
        "$": {
            "xmlns": "http://pds.nasa.gov/pds4/pds/v1",
            "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
            "xsi:schemaLocation": "http://pds.nasa.gov/pds4/pds/v1 \n        http://pds.nasa.gov/pds4/pds/v1/PDS4_PDS_1100.xsd "
        },
        "name": ["Test Name"],
        "ldd_version_id": ["1.0.0.0"],
        "full_name": ["Johnny Appleseed"],
        "steward_id": ["sbn"],
        "namespace_id": ["test"],
        "comment": ["This is a test comment."],
        "last_modification_date_time": [""],
        "DD_Attribute": [],
        "DD_Class": [{
            "name": ["Root"],
            "version_id": ["0.0.0.0"],
            "local_identifier": ["sample.Root"],
            "submitter_name": ["Johnny Appleseed"],
            "definition": ["The definition of the element."],
            "DD_Association": []
        }]
    }
}

var _devRoot = {
    "Ingest_LDD": {
        "$": {
            "xmlns": "http://pds.nasa.gov/pds4/pds/v1",
            "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
            "xsi:schemaLocation": "http://pds.nasa.gov/pds4/pds/v1 \n        http://pds.nasa.gov/pds4/pds/v1/PDS4_PDS_1100.xsd "
        },
        "name": ["Test Name"],
        "ldd_version_id": ["1.0.0.0"],
        "full_name": ["Johnny Appleseed"],
        "steward_id": ["sbn"],
        "namespace_id": ["test"],
        "comment": ["This is a test comment."],
        "last_modification_date_time": [""],
        "DD_Attribute": [{
            "name": ["attr"],
            "className": "attribute",
            "version_id": ["1.0"],
            "identifier_reference": ["test.attr"],
            "submitter_name": ["conor"],
            "definition": ["def"],
            "nillable_flag": ["true"]
        }, {
            "name": ["attr2"],
            "className": "attribute",
            "version_id": ["1.0"],
            "identifier_reference": ["test.attr2"],
            "submitter_name": ["conor"],
            "definition": ["def"],
            "nillable_flag": ["true"]
        }],
        "DD_Class": [{
            "name": ["Root"],
            "className": "class",
            "version_id": ["0.0.0.0"],
            "local_identifier": ["sample.Root"],
            "submitter_name": ["Johnny Appleseed"],
            "definition": ["The definition of the element."],
            "DD_Association": [{
                "name": ["attr"],
                "definition": ["def"],
                "identifier_reference": ["test.attr"],
                "version_id": ["1.0"],
                "submitter_name": ["conor"],
                "reference_type": ["attribute_of"],
                "minimum_occurrences": ["1"],
                "maximum_occurrences": ["1"]
            }, {
                "name": ["attr2"],
                "definition": ["def"],
                "identifier_reference": ["test.attr2"],
                "version_id": ["1.0"],
                "submitter_name": ["conor"],
                "reference_type": ["attribute_of"],
                "minimum_occurrences": ["1"],
                "maximum_occurrences": ["1"]
            }]
        }]
    }
}