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

    static Construct = (args: any) => {
        return new ScatterPlotNode(args);
    }
    static LocalResolve = (args: any, input: any) => {
        return input;
    }
}