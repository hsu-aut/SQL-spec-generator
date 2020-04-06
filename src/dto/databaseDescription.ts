export class Column {
    isIdentifier: boolean;
    columnName: string;

    constructor(isIdentifier: boolean, columnName: string) {
        this.isIdentifier = isIdentifier;
        this.columnName = columnName;
    }
}

export class Mapping {

    id: string;
    typeDescription: string;
    expressionGoal: string; 
    logicInterpretation: string; 
    columnNames: string[]; 

    constructor(mappingId: string, typeDescription: string, expressionGoal: string, logicInterpretation: string, columnNames: string[]) {
        this.id = mappingId;
        this.typeDescription = typeDescription;
        this.expressionGoal = expressionGoal;
        this.logicInterpretation = logicInterpretation;
        this.columnNames = columnNames;
    }
}