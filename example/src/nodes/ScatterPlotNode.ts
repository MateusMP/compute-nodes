import { CanvasNode } from "compute-nodes";

export default class ScatterPlotNode extends CanvasNode {
    static Type = "ScatterPlotGraph";
    static Name = "Scatter Plot"

    static InputFormat = {
        x: {
            type: "number[]",
        },
        y: {
            type: "number[]"
        }
    }
    static MinDimensions = {
        height: 15 * 8
    }


    static OutputFormat = undefined;

    static Construct = (args: any) => {
        return new ScatterPlotNode(args);
    }
    static LocalResolve = (node: any, input: any) => {
        return input;
    }
}