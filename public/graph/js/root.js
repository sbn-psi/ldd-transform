const _root = {
    "Ingest_LDD": {
        "$": {
            "xmlns": "http://pds.nasa.gov/pds4/pds/v1",
            "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
            "xsi:schemaLocation": "http://pds.nasa.gov/pds4/pds/v1 \n        http://pds.nasa.gov/pds4/pds/v1/PDS4_PDS_1A00.xsd "
        },
        "name": ["New Ingest_LDD"],
        "ldd_version_id": ["1.0.0.0"],
        "full_name": ["Your Name"],
        "steward_id": [""],
        "namespace_id": [""],
        "comment": [""],
        "last_modification_date_time": [""],
        "DD_Attribute": [],
        "DD_Class": [{
            "name": ["Click to Edit"],
            "version_id": [""],
            "local_identifier": ["Click to Edit"],
            "submitter_name": [""],
            "definition": [""],
            "DD_Association": []
        }]
    }
};

const _template = {
    "Ingest_LDD": {
        "$": {
            "xmlns": "http://pds.nasa.gov/pds4/pds/v1",
            "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
            "xsi:schemaLocation": "http://pds.nasa.gov/pds4/pds/v1 http://pds.nasa.gov/pds4/pds/v1/PDS4_PDS_1900.xsd"
        },
        "name": ["Template IngestLDD"],
        "ldd_version_id": ["1.0.0.0"],
        "full_name": ["Johnny Appleseed"],
        "steward_id": ["placeholder"],
        "namespace_id": ["placeholder"],
        "comment": ["This is a template IngestLDD file."],
        "last_modification_date_time": [""],
        "DD_Attribute": [{
            "name": ["template_attribute"],
            "version_id": ["1.0"],
            "local_identifier": ["placeholder.template_attribute"],
            "nillable_flag": ["false"],
            "submitter_name": ["Johnny Appleseed"],
            "definition": ["This is a placeholder attribute. This element can be edited to being construction of a new IngestLDD file."],
            "DD_Value_Domain": [{
                "enumeration_flag": ["false"],
                "value_data_type": ["ASCII_Integer"]
            }]
        }],
        "DD_Class": [{
            "name": ["Template_Class"],
            "version_id": ["1.0"],
            "local_identifier": ["placeholder.Template_Class"],
            "submitter_name": ["Johnny Appleseed"],
            "definition": ["This is a placeholder class. This element can be edited to begin construction of a new IngestLDD file."],
            "DD_Association": [{
                "identifier_reference": ["placeholder.template_attribute"],
                "reference_type": ["attribute_of"],
                "minimum_occurrences": ["1"],
                "maximum_occurrences": ["1"]
            }]
        }]
    }
};

const _testRoot = {
    "Ingest_LDD": {
        "$": {
            "xmlns": "http://pds.nasa.gov/pds4/pds/v1",
            "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
            "xsi:schemaLocation": "http://pds.nasa.gov/pds4/pds/v1 \n        http://pds.nasa.gov/pds4/pds/v1/PDS4_PDS_1A00.xsd "
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

const _devRoot = {
    "Ingest_LDD": {
        "$": {
            "xmlns": "http://pds.nasa.gov/pds4/pds/v1",
            "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
            "xsi:schemaLocation": "http://pds.nasa.gov/pds4/pds/v1 \n        http://pds.nasa.gov/pds4/pds/v1/PDS4_PDS_1A00.xsd "
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
            "version_id": ["1.0"],
            "identifier_reference": ["test.attr"],
            "submitter_name": ["conor"],
            "definition": ["def"],
            "nillable_flag": ["true"]
        }, {
            "name": ["attr2"],
            "version_id": ["1.0"],
            "identifier_reference": ["test.attr2"],
            "submitter_name": ["conor"],
            "definition": ["def"],
            "nillable_flag": ["true"]
        }],
        "DD_Class": [{
            "name": ["Root"],
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