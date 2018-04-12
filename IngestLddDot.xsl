<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:p="http://pds.nasa.gov/pds4/pds/v1"
  exclude-result-prefixes="p"
>
  <xsl:output method="text" encoding="utf-8"/>
  <xsl:param name="ns"><xsl:value-of select="/p:Ingest_LDD/p:namespace_id"/></xsl:param>

  <xsl:template match="/">
    <xsl:apply-templates select="p:Ingest_LDD"/>
  </xsl:template>


  <!--
    This template coverts an Ingest_LDD file into a graphviz graph.
    The graph is useful for visualizing the relationships between classes,
    attributes, and rules. It will also help locate problems such as
    orphaned classes, attributes, or rules.
  -->
  <xsl:template match="p:Ingest_LDD">
    digraph G
    {
      rankdir=LR;
      <xsl:apply-templates select="p:DD_Class" mode="definitions"/>
      <xsl:apply-templates select="p:DD_Attribute" mode="definitions"/>
      <xsl:apply-templates select="p:DD_Rule" mode="definitions"/>

      <xsl:apply-templates select="p:DD_Class" mode="relationships"/>

      edge [color=blue];
      <xsl:apply-templates select="p:DD_Class[p:element_flag='true']" mode="rules"/>


      subgraph cluster0
      {
        legend_attribute [label="Attribute"];
        legend_attribute2 [label="Attribute"];
        legend_class [shape="box", label="Class"];
        legend_rule [shape="diamond", label="Rule"];

        legend_class -> legend_rule;

        edge [color="black"];
        legend_class -> legend_attribute [label="Required"];
        edge [color="gray"];
        legend_class -> legend_attribute2 [label="Optional"];


        labelloc="t";
        label="Legend";
      }

      labelloc="t";
      fontsize=32;
      label="<xsl:value-of select='p:name'/> v<xsl:value-of select='p:ldd_version_id'/>";

    }
  </xsl:template>


  <!-- These templates will define the nodes in the graphviz file -->
  <xsl:template match="p:DD_Class" mode="definitions" >
    <xsl:value-of select="p:name"/> [shape=box];
  </xsl:template>

  <xsl:template match="p:DD_Attribute" mode="definitions" >
    <xsl:value-of select="p:name"/>;
  </xsl:template>

  <xsl:template match="p:DD_Rule" mode="definitions" >
    <xsl:value-of select="p:local_identifier"/>  [shape=diamond];
  </xsl:template>



  <!--
    These templates define the edges from classes to classes and attributes
    in the graphviz file
  -->
  <xsl:template match="p:DD_Class" mode="relationships">
    /* Associations from <xsl:value-of select="p:name"/> */

    <xsl:apply-templates select="p:DD_Association" mode="relationships">
      <xsl:with-param name="src-node" select="p:name"/>
    </xsl:apply-templates>
  </xsl:template>

  <xsl:template match="p:DD_Association" mode="relationships">
    <xsl:param name="src-node"/>
    <xsl:apply-templates select="p:local_identifier | p:identifier_reference" mode="relationships">
      <xsl:with-param name="src-node" select="$src-node"/>
    </xsl:apply-templates>
  </xsl:template>

  <xsl:template match="p:DD_Association[p:local_identifier='XSChoice#']" mode="relationships">
    <xsl:param name="src-node"/>
    <xsl:apply-templates select="p:local_identifier[not(.='XSChoice#')]" mode="relationships">
      <xsl:with-param name="src-node" select="$src-node"/>
    </xsl:apply-templates>
  </xsl:template>

  <xsl:template match="p:local_identifier | p:identifier_reference" mode="relationships">
    <xsl:param name="src-node"/>
    <xsl:variable name="dest-node">
      <xsl:choose>
        <xsl:when test="contains(., '.')">
          <xsl:value-of select="substring-after(., '.')"/>
        </xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="."/>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:if test="../p:minimum_occurrences = 0">edge [color=gray];</xsl:if>
    <xsl:value-of select='$src-node'/> -> <xsl:value-of select="$dest-node"/>;
    <xsl:if test="../p:minimum_occurrences = 0">edge [color=black];</xsl:if>
  </xsl:template>

  <!--
      These templates define the edges from classes and attributes to rules
      in the graphviz file.
  -->
  <xsl:template match="p:DD_Class" mode="rules">
    <xsl:param name="parent-path"/>
    <xsl:variable name="node-path"><xsl:value-of select="$parent-path"/><xsl:value-of select="$ns"/>:<xsl:value-of select="p:name"/></xsl:variable>
    /* Rules for <xsl:value-of select="$node-path"/> */
    <xsl:variable name="class-name" select="p:name"/>

    <xsl:apply-templates select="//p:DD_Rule[substring($node-path, string-length($node-path) - string-length(p:rule_context) +1) = p:rule_context]" mode="rules">
      <xsl:with-param name="src-node" select="p:name"/>
    </xsl:apply-templates>

    <xsl:apply-templates select="p:DD_Association" mode="rules">
      <xsl:with-param name="parent-path"><xsl:value-of select="$node-path"/>/</xsl:with-param>
    </xsl:apply-templates>

    <xsl:for-each select="p:DD_Association[contains(p:local_identifier, '.')]">
        <xsl:variable name="external-path"><xsl:value-of select="$node-path"/>/<xsl:value-of select="translate(p:local_identifier, '.', ':')"/></xsl:variable>

        <xsl:apply-templates select="//p:DD_Rule[substring($external-path, string-length($external-path) - string-length(p:rule_context) +1) = p:rule_context]" mode="rules">
          <xsl:with-param name="src-node" select="$class-name"/>
        </xsl:apply-templates>
    </xsl:for-each>
  </xsl:template>

  <!-- Draw a line from a class to its associated attributes. The color
      will be influenced by the cardinality
  -->
  <xsl:template match="p:DD_Association[p:reference_type='attribute_of']" mode="rules">
    <xsl:param name="parent-path"/>
    <xsl:variable name="local-identifier" select="p:identifier_reference"/>

    <xsl:apply-templates select="//p:DD_Attribute[p:local_identifier=$local-identifier]" mode="rules">
        <xsl:with-param name="parent-path" select="$parent-path"/>
    </xsl:apply-templates>
  </xsl:template>

  <!-- Draw a line from a class to its child classes. The color
      will be influenced by the cardinality
  -->
  <xsl:template match="p:DD_Association[p:reference_type='component_of']" mode="rules">
    <xsl:param name="parent-path"/>
    <xsl:variable name="local-identifier" select="p:identifier_reference"/>

    <xsl:apply-templates select="//p:DD_Class[p:local_identifier=$local-identifier]" mode="rules">
        <xsl:with-param name="parent-path" select="$parent-path"/>
    </xsl:apply-templates>
  </xsl:template>

  <xsl:template match="p:DD_Association" mode="rules">
  </xsl:template>

  <xsl:template match="p:DD_Attribute" mode="rules">
    <xsl:param name="parent-path"/>
    <xsl:variable name="node-path"><xsl:value-of select="$parent-path"/><xsl:value-of select="$ns"/>:<xsl:value-of select="p:name"/></xsl:variable>

    <xsl:apply-templates select="//p:DD_Rule[substring($node-path, string-length($node-path) - string-length(p:rule_context) +1) = p:rule_context]" mode="rules">
      <xsl:with-param name="src-node" select="p:name"/>
    </xsl:apply-templates>
  </xsl:template>


  <!-- Draw a line from a class or attribute to an associated rule -->
  <xsl:template match="p:DD_Rule" mode="rules">
    <xsl:param name='src-node'/>
    <xsl:value-of select="$src-node"/> -> <xsl:value-of select='p:local_identifier'/>;
  </xsl:template>

</xsl:stylesheet>
