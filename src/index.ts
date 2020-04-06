import * as fs from 'fs';
import * as yargs from 'yargs';
import {Argv} from "yargs";


import { DatabaseConfiguration, MappingConfiguration, RowDataPacket } from './dto/interfaces';
import { Column, Mapping } from './dto/databaseDescription';
import { SQL } from './sql/mysqlQueries';
import { MappingBuilder } from './rdf/mapping';

// file paths
const DB_CONF_PATH = "./config/databaseConfig.json";
const MAPPING_CONF_PATH = "./config/mappingConfig.json";
const RDF_OUTPUT_PATH = "./output/mapping.ttl";


const DB_CONF: DatabaseConfiguration = JSON.parse(fs.readFileSync(DB_CONF_PATH, "utf8"))
const MAPPING_CONF: MappingConfiguration = JSON.parse(fs.readFileSync(MAPPING_CONF_PATH, "utf8"))



sampleMapping();
console.log("Checking if mappingConf.json contains some columns...")
if(MAPPING_CONF.columns.length === 0){
    console.log("There are no columns in the mapping.Conf.json, will query them from the SQL DB.. please restart the script")
    preBuildMapping();
    
} else {
    console.log("Execute the mapping...")
    executeMapping();
    console.log("Done")
}





function sampleMapping() {

    const sampleMapping:MappingConfiguration = {
        describedResource: "http://example.com#SampleTypeDescription",
        typeDescription: "http://example.com#SampleResource",
        columns: [new Column(true, "id"), new Column(false, "col1"), new Column(false, "col2"), new Column(false, "col3")],
        mappings: [new Mapping("MyMapping", "http://example.com#SampleTypeDescription", "Actual_Value", "=", ["col1", "col2"])]
    }
    fs.writeFileSync("./config/sampleMappingConfig.json", JSON.stringify(sampleMapping))
}

function preBuildMapping(){
// pre-build mapping config 
new SQL(DB_CONF).selectTableColumns().then(rows => {
    const columns: Column[] = [];
    rows.forEach(dataPacket => {
        let key = false;
        let name;

        if (dataPacket.Key === "PRI") {
            key = true;
        }
        name = dataPacket.Field;

        columns.push(new Column(key, name));
    });

    MAPPING_CONF.columns = columns

    fs.writeFileSync(MAPPING_CONF_PATH, JSON.stringify(MAPPING_CONF))  
})
}

function executeMapping(){

    const turtle = new MappingBuilder(DB_CONF, MAPPING_CONF).createTurtle();
    fs.writeFileSync(RDF_OUTPUT_PATH, turtle)
}







