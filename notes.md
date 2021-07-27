# LD3 Improvements

## Bugfixes / Improvements
* Improve contextual fields
    * Min/max value should not appear for non-numeric values
    * Pattern/Formation rule should not appear for numeric values
* Improve exports
    * Do not remove comments
    * Do not re-order elements
    * Remove stray elements when generating:
    * permissible_value_1
    * dd_attribute_reference
    * dd_class_reference
* Consolidate LDD Transform & LD3 into single application
    * Tool should retain selected Ingest_LDD file when navigating between tools
* Better rendering
    * less overlap of elements/links
    * Re-render visualization on window resize
* Forward to SSL

## Features
* Organize elements logically rather than in order
    * Logical "focus" mode
* Custom backend for describing Ingest_LDD class
    * Support multiple versions of IM
        * Support as many versions of IM as possible
    * Migrate dictionaries to new IM version
* Create UML visualization using PlantUML
* Create dropdown of stewards
* Extract tooltips for documenation
* Allow renaming attributes
* Add mini-map

## Guiding Questions
* Who are we targeting with this tool? Who uses it?
    * Mission teams
* To what extent can we extract components from the model? (Model de-coupling)
