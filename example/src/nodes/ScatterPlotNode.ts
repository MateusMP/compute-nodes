import { CanvasNode } from "node-machine";

export default class ScatterPlotNode extends CanvasNode {
    static Type = "ScatterPlotGraph";

    static InputFormat = {
        X: {
            type: "any",
        },
        Y: {
            type: "any"
        }
    }


    static OutputFormat = undefined;

    static construct(args: any) {
        return new ScatterPlotNode(args);
    }
    static localResolve(args: any, input: any) {
        return input;
    }
}