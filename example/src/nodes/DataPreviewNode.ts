import { CanvasNode } from "node-machine";

export interface DataFormat {
    A: any
}

export class DataPreviewNode extends CanvasNode {
    static Type = "DataPreview";

    static InputFormat = {
        a: {
            type: 'any',
            visualName: '',
        }
    }
    static OutputFormat = undefined;

    static Construct = (args: any) =>{
        return new DataPreviewNode(args);
    }
    static LocalResolve = (args: any, input: any) => {
        return input;
    }
}