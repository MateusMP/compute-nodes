import { CanvasNode } from "compute-nodes";

export interface DataFormat {
    A: any,
    B: any
}

export default class SumValuesNode extends CanvasNode {
    static Type = "SumNumbers";
    static Name = "Sum"

    static MinDimensions = {
        height: 16 * 8
    }

    static readonly inA: string = 'a';
    static readonly inB: string = 'b';
    static InputFormat = {
        [SumValuesNode.inA]: {
            type: 'any',
            visualName: "A",
        },
        [SumValuesNode.inB]: {
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