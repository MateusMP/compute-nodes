import { CanvasNode } from "node-machine";

export interface DataFormat {
    A: any
}

export default class DataPreviewNode extends CanvasNode {
    static Type = "DataPreview";

    static InputFormat = {
        A: {
            type: 'any',
            visualName: '',
        }
    }
    static OutputFormat = undefined;

    static construct(args: any) {
        return new DataPreviewNode(args);
    }
    static localResolve(args: any, input: any) {
        return input;
    }
}