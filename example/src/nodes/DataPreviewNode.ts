import { CanvasNode } from "compute-nodes";

export interface DataFormat {
    A: any
}

/**
 * This component doesn't have any special data states
 */
export class DataPreviewNode {
    static Type = "DataPreview";
    static Name = "Data Preview"

    static InputFormat = {
        a: {
            type: 'any',
            visualName: '',
        }
    }
    static OutputFormat = undefined;

    static Construct = (args: any) =>{
        return new CanvasNode(args);
    }
    static LocalResolve = (args: any, input: any) => {
        return input;
    }
}