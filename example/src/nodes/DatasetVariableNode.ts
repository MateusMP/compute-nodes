import CanvasNode from "../../../src/nodes/CanvasNode";

export default class DatasetVariableNode extends CanvasNode {
    static Type = "DatasetVariable";

    name: string;
    datasetRef: string;

    static InputFormat : any = {};

    static out = "out";

    constructor(args: any) {
        super(args);

        this.name = args.name;
        this.datasetRef = args.datasetRef;
    }
}