import { CanvasNode } from "node-machine";

export interface DataFormat {
    A: any,
    B: any
}

export default class SumValuesNode extends CanvasNode {
    static Type = "SumNumbers";

    static InputFormat = {
        a: {
            type: 'any',
            visualName: "A",
        },
        b: {
            type: 'any',
            visualName: "B",
        }
    }

    static readonly outSum: string = 'sum';
    static OutputFormat = {
        [SumValuesNode.outSum]: {
            type: 'any',
        },
    }

    static Construct = (args: any): CanvasNode => {
        return new SumValuesNode(args);
    }

    static LocalResolve = (node: SumValuesNode, { a, b }: any) => {
        return {
            [SumValuesNode.outSum]: +a + +b,
        };
    }
}