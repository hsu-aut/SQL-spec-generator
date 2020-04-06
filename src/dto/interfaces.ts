import { Column, Mapping } from './databaseDescription'

export interface DatabaseConfiguration {
    host: string;
    user: string;
    password: string;
    database: string;
    table: string;
}

export interface MappingConfiguration {
    describedResource: string;
    typeDescription: string;
    columns: Column[];
    mappings: Mapping[];
}

export interface RowDataPacket {
    Field: string;
    Type: string;
    Null: string;
    Key: string;
    Default: null;
    Extra: string;
}

