import CanvasNode from "node-machine";

export default class InputVariableNode extends CanvasNode {
    static Type = "InputVariable";

    data: {
        value: any,
        name: string,
    };

    static outValue = "value";
    static InputFormat = undefined;
    static OutputFormat = {
        [InputVariableNode.outValue]: {
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

    static construct(args: any) {
        return new InputVariableNode(args);
    }
    static localResolve(node: any, input: any) {
        return { [InputVariableNode.outValue]: node.data.value };
    }
}