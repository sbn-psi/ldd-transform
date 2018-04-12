<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:p="http://pds.nasa.gov/pds4/pds/v1"
  exclude-result-prefixes="p"
>
  <xsl:output method="html" encoding="utf-8"/>
  <xsl:param name="ns"><xsl:value-of select="/p:Ingest_LDD/p:namespace_id"/></xsl:param>
  <xsl:template match="/">
    <html>
      <head>
        <style>
          h1 {font-size:125%; font-weight:bold; margin:0px; background-color:lightgray}
          ul {margin:0px;}
          div.doc {font-style: italic}
          div.attribute {border: thin black solid; margin:10px; padding:10px}
          div.class {border: thin black solid; margin:10px; padding:10px}
          div.choice {border: thin blue solid; margin:10px; padding:10px}
          div.path {font-style: italic}
        </style>
      </head>
      <body>
        <xsl:apply-templates select="p:Ingest_LDD"/>
      </body>
    </html>
  </xsl:template>

  <xsl:template match="p:Ingest_LDD">
    <h1><xsl:value-of select="p:name"/></h1>
    <p>
      <xsl:value-of select="p:comment"/>
    </p>
    <h2>Elements</h2>
    <xsl:choose>
      <xsl:when test="p:DD_Class[p:element_flag='true']">
        <xsl:for-each select="p:DD_Class[p:element_flag='true']">
          <h3><xsl:value-of select="p:name"/></h3>
          <xsl:apply-templates select=".">
            <xsl:with-param name="parent"></xsl:with-param>
          </xsl:apply-templates>
        </xsl:for-each>
      </xsl:when>
      <xsl:otherwise>
        <xsl:for-each select="p:DD_Class">
          <h3><xsl:value-of select="p:name"/></h3>
          <xsl:apply-templates select=".">
            <xsl:with-param name="parent"></xsl:with-param>
          </xsl:apply-templates>
        </xsl:for-each>
      </xsl:otherwise>
    </xsl:choose>

  </xsl:template>


  <!--
    Template for DD_Class. This describes the elements in the schema.
  -->
  <xsl:template match="p:DD_Class">
    <xsl:param name="parent"/>
    <!-- The xpath to this element is based on the path of the parent element. -->
    <xsl:variable name="path"><xsl:value-of select="$parent"/><xsl:value-of select="$ns"/>:<xsl:value-of select="p:name"/></xsl:variable>

    <div class="class">
      <div class="path"><xsl:value-of select="$path"/></div>
      <div>
        <xsl:value-of select="p:definition"/>
      </div>
      <h3>Members:</h3>
      <xsl:apply-templates select="p:DD_Association">
        <xsl:with-param name="parent"><xsl:value-of select="$path"/>/</xsl:with-param>
      </xsl:apply-templates>

      <!--
           XPath to find all DD_Rules that will apply to this element at this location.
           The matching rules are all of the ones where the current path ends with the rule context.
           We are reduced to using substring comparisons since ends-with is an XSLT 2.0 feature.
      -->
      <xsl:if test="//p:DD_Rule[substring($path, string-length($path) - string-length(p:rule_context) +1) = p:rule_context]">
        <h3>Rules:</h3>
        <ul>
          <xsl:apply-templates select="//p:DD_Rule[substring($path, string-length($path) - string-length(p:rule_context) +1) = p:rule_context]"/>
        </ul>
      </xsl:if>
    </div>
  </xsl:template>


  <!--
    Associations are the relationships between classes and child classes and attributes.
    This is where the cardinality information is maintained as well.
  -->
  <xsl:template match="p:DD_Association">
    <xsl:param name="parent"/>
    <xsl:variable name="local_identifier">
      <xsl:value-of select="p:identifier_reference | p:local_identifier"/>
    </xsl:variable>
    <div>
      <h4>
        <xsl:value-of select="$local_identifier"/>
        <!-- Translates the cardinality to English -->
        (<xsl:choose>
          <xsl:when test="p:minimum_occurrences='0'">Optional</xsl:when>
          <xsl:when test="p:minimum_occurrences='1'">Required</xsl:when>
          <xsl:otherwise>Required <xsl:value-of select="p:minimum_occurrences"/> times</xsl:otherwise>
        </xsl:choose>
        ,
        <xsl:choose>
            <xsl:when test="p:maximum_occurrences='1'">Not repeatable</xsl:when>
            <xsl:when test="p:maximum_occurrences='*'">Repeatable</xsl:when>
            <xsl:when test="p:maximum_occurrences='unbounded'">Repeatable</xsl:when>
            <xsl:otherwise>Repeatable <xsl:value-of select="p:maximum_occurrences"/> times</xsl:otherwise>
        </xsl:choose>)
      </h4>
      <xsl:choose>
        <!-- If the association is an attribute_of association, we should look for attributes with the same name as the association -->
        <xsl:when test="p:reference_type='attribute_of'">
          <xsl:apply-templates select="//p:DD_Attribute[p:local_identifier=$local_identifier]">
            <xsl:with-param name="parent"><xsl:value-of select="$parent"/></xsl:with-param>
          </xsl:apply-templates>
        </xsl:when>
        <!-- If the association is an component_of association, we should look for classes with the same name as the association -->
        <xsl:when test="p:reference_type='component_of'">
          <xsl:apply-templates select="//p:DD_Class[p:local_identifier=$local_identifier]">
            <xsl:with-param name="parent"><xsl:value-of select="$parent"/></xsl:with-param>
          </xsl:apply-templates>
        </xsl:when>
      </xsl:choose>
    </div>
  </xsl:template>

  <!-- XS choice is a magic keyword in the association list. This will find
       associations that contain xs choice and handle them differently.
  -->
  <xsl:template match="p:DD_Association[p:identifier_reference='XSChoice#']">
    <xsl:param name="parent"/>

    <h4><xsl:value-of select="p:minimum_occurrences"/>
      <xsl:if test="not(p:minimum_occurrences = p:maximum_occurrences)">-<xsl:value-of select="p:maximum_occurrences"/></xsl:if>
    of the following:</h4>
    <div class='choice'>
      <xsl:for-each select="p:identifier_reference[not(.='XSChoice#')]">
        <xsl:variable name="local_identifier"><xsl:value-of select="."/></xsl:variable>
        <div>
          <h4><xsl:value-of select="."/></h4>
          <xsl:choose>
            <xsl:when test="../p:reference_type='attribute_of'">
              <xsl:apply-templates select="//p:DD_Attribute[p:local_identifier=$local_identifier]">
                <xsl:with-param name="parent"><xsl:value-of select="$parent"/></xsl:with-param>
              </xsl:apply-templates>
            </xsl:when>
            <xsl:when test="../p:reference_type='component_of'">
              <xsl:apply-templates select="//p:DD_Class[p:local_identifier=$local_identifier]">
                <xsl:with-param name="parent"><xsl:value-of select="$parent"/></xsl:with-param>
              </xsl:apply-templates>
            </xsl:when>
          </xsl:choose>
        </div>
      </xsl:for-each>
    </div>
  </xsl:template>

  <!-- Constructs a description of an attribute in the schema -->
  <xsl:template match="p:DD_Attribute">
    <xsl:param name="parent"/>
    <!-- The xpath to this element is based on the path of the parent element. -->
    <xsl:variable name="path"><xsl:value-of select="$parent"/><xsl:value-of select="$ns"/>:<xsl:value-of select="p:name"/></xsl:variable>

    <div class="attribute">
      <div class="path"><xsl:value-of select="$path"/></div>
      <xsl:if test="p:nillable_flag='true'">Nillable.</xsl:if>
      <xsl:value-of select="p:definition"/>
      <xsl:apply-templates select="p:DD_Value_Domain"/>

      <!--
           XPath to find all DD_Rules that will apply to this attributes at this location.
           The matching rules are all of the ones where the current path ends with the rule context.
           We are reduced to using substring comparisons since ends-with is an XSLT 2.0 feature.
      -->
      <xsl:if test="//p:DD_Rule[substring($path, string-length($path) - string-length(p:rule_context) +1) = p:rule_context]">
        <h4>Rules:</h4>
        <ul>
          <xsl:apply-templates select="//p:DD_Rule[substring($path, string-length($path) - string-length(p:rule_context) +1) = p:rule_context]"/>
        </ul>
      </xsl:if>

    </div>

  </xsl:template>

  <!-- Attributes that have an enumerated value list should show the list -->
  <xsl:template match="p:DD_Value_Domain[p:DD_Permissible_Value]">
    <xsl:param name="parent"/>
    <h4>Values:</h4>
    <ul>
      <xsl:apply-templates select="p:DD_Permissible_Value"/>
    </ul>
  </xsl:template>

  <xsl:template match="p:DD_Permissible_Value">
    <li><b><xsl:value-of select="p:value"/></b>: <xsl:value-of select="p:value_meaning"/></li>
  </xsl:template>


  <!-- Attributes that do not have an enumerated value list should show the
      formation rules, min/max, units, etc. -->
  <xsl:template match="p:DD_Value_Domain">
    Non-enumerated.
    <xsl:if test="p:formation_rule">
      <div>
        Formation rule: <xsl:value-of select="p:formation_rule"/>
      </div>
    </xsl:if>
    <xsl:if test="p:pattern">
      <div>
        Pattern: <xsl:value-of select="p:pattern"/>
      </div>
    </xsl:if>
    <xsl:if test="p:value_data_type">
      <div>
        Data Type: <xsl:value-of select="p:value_data_type"/>
      </div>
    </xsl:if>
    <xsl:if test="p:unit_of_measure_type">
      <div>
        Unit Type: <xsl:value-of select="p:unit_of_measure_type"/>
      </div>
    </xsl:if>
    <xsl:if test="p:minimum_value">
      <div>
        Min: <xsl:value-of select="p:minimum_value"/> (<xsl:value-of select="p:specified_unit_id"/>)
      </div>
    </xsl:if>
    <xsl:if test="p:maximum_value">
      <div>
        Max: <xsl:value-of select="p:maximum_value"/> (<xsl:value-of select="p:specified_unit_id"/>)
      </div>
    </xsl:if>
    <xsl:if test="p:minimum_characters">
      <div>
        Min length: <xsl:value-of select="p:minimum_characters"/>
      </div>
    </xsl:if>
    <xsl:if test="p:maximum_characters">
      <div>
        Max length: <xsl:value-of select="p:minimum_characters"/>
      </div>
    </xsl:if>
  </xsl:template>

  <xsl:template match="p:DD_Rule">
    <xsl:apply-templates select="p:DD_Rule_Statement"/>
  </xsl:template>

  <xsl:template match="p:DD_Rule_Statement">
    <li><xsl:value-of select="p:rule_message"/></li>
  </xsl:template>
</xsl:stylesheet>
