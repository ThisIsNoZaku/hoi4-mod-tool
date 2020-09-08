import * as os from "os";
import * as util from "util";
import ParadoxEntityProperty from "./ParadoxEntityProperty";
import {getMappingForField} from "./decorators/ParadoxProperty";

export default abstract class ModEntityModel {
    private _lineMappings = {};

    toParadoxFormat() {
        let fileContent = "";
        const paradoxEntityCategory = Reflect.getMetadata("ParadoxEntityCategory", this.constructor);
        fileContent += paradoxEntityCategory + " = {" + os.EOL +
            "\t{";
        const paradoxProperties = Reflect.getMetadata("ParadoxProperties", this.constructor);
        for (const property of paradoxProperties) {
            const field = this[property];
            if (field.value) {
                fileContent += field.toParadoxFormat();
            }
        }
        fileContent += "}";
        return fileContent;
    }

    asSimpleObject(): { [property: string]: any } {
        const object: { [property: string]: any } = {};
        for (const property in this) {
            const hasProperty = (<any>this[property]).hasOwnProperty("value");
            object[property] = hasProperty ? (<any>this[property]).value : this[property];
        }
        return object;
    };

    updateFrom(object: any) {
        for (const property in object) {
            if(getMappingForField(property, this.constructor)) {
                this[property] = object[property];
            }
        }
        return this;
    }

    abstract get name(): string;

    /**
     * The path to the file where this file
     */
    abstract get sourceFilePath(): string;

    public getObjectPropertyForParadoxProperty(propertyName: string): ParadoxEntityProperty<any> {
        for (const field in this) {
            const fieldValue = (this[field] as any) as ParadoxEntityProperty<any>;
            if (fieldValue?.paradoxPropertyName == propertyName) {
                return fieldValue;
            }
        }
    }

    get lineMappings() {
        return this._lineMappings;
    }
}