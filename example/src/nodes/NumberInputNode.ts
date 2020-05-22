import { CanvasNode } from "compute-nodes";

export default class NumberInputNode extends CanvasNode {
    static Type = "InputVariable";
    static Name = "Input Variable"

    data: {
        value: any,
        name: string,
    };

    static outValue = "value";
    static InputFormat = undefined;
    static OutputFormat = {
        [NumberInputNode.outValue]: {
            type: 'any',
            visualName: ''
        }
    }

    constructor(args: any) {
        super(args);
        this.data = {
            value: 0,
            name: ""
        };
    }

    static Construct = (args: any) => {
        return new NumberInputNode(args);
    }
    static LocalResolve = (node: NumberInputNode, input: any) => {
        return { [NumberInputNode.outValue]: node.data.value };
    }
}