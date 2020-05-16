import { act } from "react-dom/test-utils";
import { LocalNodeResolver, LocalNodeRegistry } from "../resolver/LocalNodeResolver";
import { buildPinId } from "node-machine";
import SumValuesNode from "../nodes/SumValuesNode";
import InputVariableNode from "../nodes/InputVariableNode";


let resolver: LocalNodeResolver | null = null;
beforeEach(() => { });

afterEach(() => { });

const testData: any = {
    sumNode: {
        type: "SumNumbers",
        inputPins: {
            a: "inA-value",
            b: "inB-value"
        }
    },
    inA: {
        type: "InputVariable",
        data: { value: 2 }
    },
    inB: {
        type: "InputVariable",
        data: { value: 5 }
    },
    sumNode2: {
        type: "SumNumbers",
        inputPins: {
            a: "sumNode-sum",
            b: "sumNode-sum"
        }
    },
}
Object.keys(testData).forEach(id => testData[id].id = id); // embed ids

const registry = new LocalNodeRegistry();
registry.registerType(SumValuesNode);
registry.registerType(InputVariableNode);

it("sum node resolves", () => {
    act(() => { resolver = new LocalNodeResolver(registry, testData); });
    expect(resolver!.resolveNode(testData.sumNode).sum).toBe(7);
    expect(resolver!.pinData[buildPinId(testData.sumNode.id, SumValuesNode.outSum)]).toBe(7);
    expect(resolver!.resolveNode(testData.sumNode2).sum).toBe(14);
});