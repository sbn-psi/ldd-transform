<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:p="http://pds.nasa.gov/pds4/pds/v1"
  exclude-result-prefixes="p"
>
  <xsl:output method="text" encoding="utf-8"/>
  <xsl:param name="ns"><xsl:value-of select="/p:Ingest_LDD/p:namespace_id"/></xsl:param>
  <xsl:param name="class"></xsl:param>

  <xsl:template match="/">
    <xsl:choose>
      <xsl:when test="$class=''">
          <xsl:apply-templates select="p:Ingest_LDD" mode="all"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:apply-templates select="p:Ingest_LDD" mode="single"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>


  <!--
    This template coverts an Ingest_LDD file into a graphviz graph.
    The graph is useful for visualizing the relationships between classes,
    attributes, and rules. It will also help locate problems such as
    orphaned classes, attributes, or rules.
  -->
  <xsl:template match="p:Ingest_LDD" mode="all">
    <xsl:text>@startuml</xsl:text>
    <xsl:text>&#10;</xsl:text>
    <xsl:apply-templates select="p:DD_Class" mode="definitions"/>
    <xsl:apply-templates select="p:DD_Class" mode="relationships"/>
    <xsl:text>@enduml</xsl:text>
    <xsl:text>&#10;</xsl:text>
  </xsl:template>

  <xsl:template match="p:Ingest_LDD" mode="single">
    <xsl:text>@startuml</xsl:text>
    <xsl:text>&#10;</xsl:text>
    <xsl:apply-templates select="p:DD_Class[p:name=$class]" mode="definitions"/>
    <xsl:apply-templates select="p:DD_Class[p:name=$class]" mode="relationships"/>
    <xsl:text>@enduml</xsl:text>
    <xsl:text>&#10;</xsl:text>
  </xsl:template>



  <!-- These templates will define the nodes in the graphviz file -->
  <xsl:template match="p:DD_Class" mode="definitions" >
    <xsl:text>class </xsl:text>
    <xsl:value-of select="p:name"/>
    <xsl:if test="p:DD_Association[p:reference_type='attribute_of'] or p:DD_Association[p:identifier_reference='pds.Internal_Reference'] or p:DD_Association[p:identifier_reference='pds.Local_Internal_Reference']">
      <xsl:text> {</xsl:text>
      <xsl:text>&#10;</xsl:text>
      <xsl:apply-templates select="p:DD_Association[p:reference_type='attribute_of']" mode="attributes"/>
      <xsl:if test="p:DD_Association[p:identifier_reference='pds.Internal_Reference' or p:local_identifier='pds.Internal_Reference']">
        <xsl:text>  Internal_Reference: pds.Internal_Reference</xsl:text>
        <xsl:text>&#10;</xsl:text>
      </xsl:if>
      <xsl:if test="p:DD_Association[p:identifier_reference='pds.Local_Internal_Reference' or p:local_identifier='pds.Local_Internal_Reference']">
        <xsl:text>  Local_Internal_Reference: pds.Local_Internal_Reference</xsl:text>
        <xsl:text>&#10;</xsl:text>
      </xsl:if>
      <xsl:text>}</xsl:text>
    </xsl:if>

    <xsl:if test="p:DD_Association[p:reference_type='component_of' or p:reference_type='parent_of'][p:identifier_reference='XSChoice#' or p:local_identifier='XSChoice#']">
      <xsl:text>&#10;</xsl:text>
      <xsl:apply-templates select="p:DD_Association[p:reference_type='component_of'][p:identifier_reference='XSChoice#' or p:local_identifier='XSChoice#']" mode="choice">
        <xsl:with-param name="src-node" select="p:name"/>
      </xsl:apply-templates>
    </xsl:if>
    <xsl:text>&#10;</xsl:text>
    <xsl:text>&#10;</xsl:text>
  </xsl:template>

  <xsl:template match="p:DD_Class" mode="relationships" >
    <xsl:apply-templates select="p:DD_Association[p:reference_type='component_of' or p:reference_type='parent_of']" mode="components">
      <xsl:with-param name="src-node" select="p:name"/>
    </xsl:apply-templates>
  </xsl:template>

  <xsl:template match="p:DD_Association" mode="components">
    <xsl:param name="src-node"/>
    <xsl:variable name="min_occurs"><xsl:value-of select='p:minimum_occurrences'/></xsl:variable>
    <xsl:variable name="max_occurs">
      <xsl:choose>
        <xsl:when test="p:maximum_occurrences='unbounded'">*</xsl:when>
        <xsl:otherwise><xsl:value-of select='p:maximum_occurrences'/></xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="reference_type"><xsl:value-of select='p:reference_type'/></xsl:variable>
    <xsl:for-each select="p:identifier_reference[. != 'XSChoice#'][. != 'pds.Internal_Reference'][. != 'pds.Local_Internal_Reference'] | p:local_identifier[. != 'XSChoice#'][. != 'pds.Internal_Reference'][. != 'pds.Local_Internal_Reference']">
      <xsl:variable name="local_id_reference"><xsl:value-of select='.'/></xsl:variable>
      <xsl:variable name="name"><xsl:value-of select='//p:DD_Class[p:local_identifier=$local_id_reference]/p:name'/></xsl:variable>

      <xsl:choose>
        <xsl:when test="$reference_type='component_of'">
          <xsl:value-of select="$src-node"/>
            <xsl:text> *-- </xsl:text>
            <xsl:if test='not(../p:identifier_reference="XSChoice#") and not(../p:local_identifier="XSChoice#")'>
              <xsl:text>"</xsl:text>
              <xsl:value-of select='$min_occurs'/>
              <xsl:text>..</xsl:text>
              <xsl:value-of select='$max_occurs'/>
              <xsl:text>" </xsl:text>
            </xsl:if>
            <xsl:value-of select='$name'/>
        </xsl:when>
        <xsl:when test="$reference_type='parent_of'">
          <xsl:value-of select="$name"/>
          <xsl:text> &lt;|-- </xsl:text>
          <xsl:value-of select='$src-node'/>
        </xsl:when>
        <xsl:otherwise/>
      </xsl:choose>
       <xsl:text>&#10;</xsl:text>
    </xsl:for-each>
  </xsl:template>

  <xsl:template match="p:DD_Association" mode="choice">
    <xsl:param name='src-node'/>
    <xsl:variable name="min_occurs"><xsl:value-of select='p:minimum_occurrences'/></xsl:variable>
    <xsl:variable name="max_occurs">
      <xsl:choose>
        <xsl:when test="p:maximum_occurrences='unbounded'">*</xsl:when>
        <xsl:otherwise><xsl:value-of select='p:maximum_occurrences'/></xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    
    <xsl:text>note bottom of </xsl:text>
    <xsl:value-of select='$src-node'/>
    <xsl:text>&#10;</xsl:text>
    <xsl:text>  Choice (</xsl:text>
    <xsl:value-of select='$min_occurs'/>
    <xsl:text>-</xsl:text>
    <xsl:value-of select='$min_occurs'/>
    <xsl:text>):</xsl:text>
    <xsl:text>&#10;</xsl:text>

    <xsl:for-each select="p:identifier_reference[. != 'XSChoice#'][. != 'pds.Internal_Reference'][. != 'pds.Local_Internal_Reference'] | p:local_identifier[. != 'XSChoice#'][. != 'pds.Internal_Reference'][. != 'pds.Local_Internal_Reference']">
      <xsl:variable name="local_id_reference"><xsl:value-of select='.'/></xsl:variable>
      <xsl:variable name="name"><xsl:value-of select='//p:DD_Class[p:local_identifier=$local_id_reference]/p:name'/></xsl:variable>
      <xsl:text>  </xsl:text>
      <xsl:value-of select='$name'/>
      <xsl:text>&#10;</xsl:text>
    </xsl:for-each>
    
    <xsl:text>end note</xsl:text>    
    <xsl:text>&#10;</xsl:text>

  </xsl:template>



  <xsl:template match="p:DD_Association" mode="attributes">
    <xsl:variable name="min_occurs"><xsl:value-of select='p:minimum_occurrences'/></xsl:variable>
    <xsl:variable name="max_occurs">
      <xsl:choose>
        <xsl:when test="p:maximum_occurrences='unbounded'">*</xsl:when>
        <xsl:otherwise><xsl:value-of select='p:maximum_occurrences'/></xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:for-each select="p:identifier_reference[. != 'XSChoice#'] | p:local_identifier[. != 'XSChoice#']">
      <xsl:variable name="local_id_reference"><xsl:value-of select='.'/></xsl:variable>
      <xsl:variable name="data_type"><xsl:value-of select='//p:DD_Attribute[p:local_identifier=$local_id_reference]/p:DD_Value_Domain/p:value_data_type'/></xsl:variable>
      <xsl:variable name="name"><xsl:value-of select='//p:DD_Attribute[p:local_identifier=$local_id_reference]/p:name'/></xsl:variable>
      <xsl:text>  {field} </xsl:text>
      <xsl:choose>
        <xsl:when test="$name=''">
          <xsl:value-of select='$local_id_reference'/>
        </xsl:when>
        <xsl:otherwise>
          <xsl:value-of select='$name'/>
          <xsl:text> : </xsl:text>
          <xsl:value-of select='$data_type'/>
        </xsl:otherwise>
      </xsl:choose>
      <xsl:text> (</xsl:text>
      <xsl:value-of select='$min_occurs'/>
      <xsl:text>..</xsl:text>
      <xsl:value-of select='$max_occurs'/>
      <xsl:text>)</xsl:text>
      <xsl:text>&#10;</xsl:text>
    </xsl:for-each>
  </xsl:template>

</xsl:stylesheet>
