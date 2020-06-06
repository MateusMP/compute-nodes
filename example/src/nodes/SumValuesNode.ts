import { CanvasNode } from "compute-nodes";

export default class SumValuesNode extends CanvasNode {
    static Type = "SumNumbers";
    static Name = "Sum"

    static MinDimensions = {
        height: 17 * 8,
        width: 35 * 8
    }

    static readonly inA: string = 'a';
    static readonly inB: string = 'b';
    static InputFormat = {
        [SumValuesNode.inA]: {
            type: ['number', 'number[]'],
            visualName: "A",
        },
        [SumValuesNode.inB]: {
            type: ['number', 'number[]'],
            visualName: "B",
        }
    }

    static readonly outSum: string = 'sum';
    static OutputFormat = {
        [SumValuesNode.outSum]: {
            type: ['number', 'number[]'],
        },
    }

    static Construct = (args: any): CanvasNode => {
        return new SumValuesNode(args);
    }

    static LocalResolve = (node: SumValuesNode, { a, b }: any) => {
        const operation = fetchOperator(node.data?.op || "+")

        if (Array.isArray(a)) {
            if (Array.isArray(b)) {
                if (a.length !== b.length) {
                    return {
                        error: "Input size do not match!"
                    }
                }
                return sumArrays(a, b, operation);
            }
            else {
                return sumNumberToArray(a, b, operation);
            }
        } else if (Array.isArray(b)) {
            return sumNumberToArray(b, a, operation);
        } else {
            return {
                [SumValuesNode.outSum]: operation!(+a, +b),
            };
        }
    }

    data = {
        op: "+",
    }
}

function operatorPlus(a: number, b: number) {
    return a + b;
}
function operatorSubtract(a: number, b: number) {
    return a - b;
}
function operatorMultiply(a: number, b: number) {
    return a * b;
}
function operatorDivide(a: number, b: number) {
    return a / b;
}
function operatorPow(a: number, b: number) {
    return a ** b;
}

function fetchOperator(op: string) {
    switch (op) {
        case '+':
            return operatorPlus;
        case '-':
            return operatorSubtract;
        case '*':
            return operatorMultiply;
        case '/':
            return operatorDivide;
        case 'pow':
            return operatorPow;
    }
}

function sumArrays(a: number[], b: number[], operator: any) {
    const sum: number[] = []
    a.forEach((x, i) => sum.push(operator(+x, +b[i])))
    return {
        [SumValuesNode.outSum]: sum
    }
}

function sumNumberToArray(a: number[], b: number, operator: any) {
    const sum: number[] = []
    a.forEach((x, i) => sum.push(operator(+x, +b)))
    return {
        [SumValuesNode.outSum]: sum
    }
}