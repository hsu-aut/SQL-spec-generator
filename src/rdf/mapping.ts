import * as uuid from 'uuid';

import { DatabaseConfiguration, MappingConfiguration } from '../dto/interfaces';
import { Mapping } from '../dto/databaseDescription';



export class MappingBuilder {

    namespace: string;
    databaseConfig: DatabaseConfiguration;
    mappingConfig: MappingConfiguration;

    constructor(databaseConfig: DatabaseConfiguration, mappingConfig: MappingConfiguration) {
        this.databaseConfig = databaseConfig;
        this.mappingConfig = mappingConfig;
        this.namespace = databaseConfig.database + "." + databaseConfig.table;
    }

    /**
     * Prepends relevant namespaces and return the final ttl string.
     *
     * @param {String} Triples
     * @returns .ttl as string with prepended prefixes
     */
    private prependPrefixes(triples: string) {

        const prefixes = `
    @prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>.
    @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>.
    @prefix owl: <http://www.w3.org/2002/07/owl#>.
    @prefix SQL: <http://www.hsu-ifa.de/ontologies/SQL#>.
    @prefix DE6: <http://www.hsu-ifa.de/ontologies/DINEN61360#>.
    `;

        return prefixes + "\n" + triples;
    }

    /**
     * Creates a single mapping for a certain mapping config
     *
     * @private
     * @param {string} identifier
     * @param {Mapping} mappingConfig
     * @returns 
     * @memberof MappingBuilder
     */
    private createSingleTurtle(identifier: string, tableIdentifier: string, mappingConfig: Mapping) {

        let selectString = `SELECT ${identifier}`;

        for (let i = 0; i < mappingConfig.columnNames.length; i++) {
            if (i === 0) {
                selectString = selectString + ", ";
            }
            selectString = selectString + mappingConfig.columnNames[i] + " ";
        }

        selectString = selectString + `FROM ${this.databaseConfig.database}.${this.databaseConfig.table}`;

        let columnConcat = "";
        mappingConfig.columnNames.forEach(element => {
            columnConcat = columnConcat + element;
        });

        const dataElement = "urn:" + uuid.v5(this.namespace + mappingConfig.id + "DE", uuid.v5.URL);
        const dataElementInstance = "urn:" + uuid.v5(this.namespace + mappingConfig.id + "DEI", uuid.v5.URL);
        const columnInstance = "urn:" + uuid.v5(this.namespace + columnConcat, uuid.v5.URL);

        const triples = `
    <${dataElement}> rdf:type DE6:Data_Element;	
      a owl:NamedIndividual;
      SQL:label "${mappingConfig.typeDescription}".

    <${dataElementInstance}> rdf:type DE6:Instance_Description;
      a owl:NamedIndividual;
      SQL:label "${mappingConfig.typeDescription}".

    <${tableIdentifier}> DE6:complex_Data_Type_has_Member <${dataElement}>.

    <${dataElement}> DE6:has_Instance_Description <${dataElementInstance}>;
        DE6:has_Type_Description <${mappingConfig.typeDescription}>.
    <${mappingConfig.typeDescription}> DE6:Type_Description_has_Instance <${dataElementInstance}>.
                        
    <${dataElementInstance}> DE6:Expression_Goal "${mappingConfig.expressionGoal}";
        DE6:Logic_Interpretation "${mappingConfig.logicInterpretation}";
        DE6:Value "SQL";
        SQL:hasOntologicalValue <${columnInstance}>.

    <${columnInstance}> SQL:host "${this.databaseConfig.host}";
                        SQL:userName "${this.databaseConfig.user}";
                        SQL:password "${this.databaseConfig.password}";
                        SQL:query "${selectString}".

    `
        return triples;

    }

    createTurtle() {

        const dataElement = "urn:" + uuid.v5(this.mappingConfig.describedResource + this.namespace + "DE", uuid.v5.URL);
        const dataElementInstance = "urn:" + uuid.v5(this.mappingConfig.describedResource + this.namespace + "DEI", uuid.v5.URL);

        // create ttl for description of table
        let turtleString = `
        <${dataElement}> rdf:type DE6:Data_Element;	
        a owl:NamedIndividual;
        SQL:label "${this.mappingConfig.typeDescription}".

        <${dataElementInstance}> rdf:type DE6:Instance_Description;
        a owl:NamedIndividual;
        SQL:label "${this.mappingConfig.typeDescription}".

        <${dataElement}> DE6:has_Instance_Description <${dataElementInstance}>;
        DE6:has_Type_Description <${this.mappingConfig.typeDescription}>.
        `;

        const identifier = this.mappingConfig.columns.find(column => column.isIdentifier === true)?.columnName


        if (!identifier) {
            console.log("ERROR: There was no key found in the mappingConfig.json columns array.")
        } else {
            this.mappingConfig.mappings.forEach(mapping => {
                turtleString = turtleString + this.createSingleTurtle(identifier, dataElementInstance, mapping)
            });
        }

        return this.prependPrefixes(turtleString);

    }

}