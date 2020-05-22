import { LocalNodeResolver, LocalNodeRegistry } from "../resolver/LocalNodeResolver";
import { buildPinId, CanvasNode } from "compute-nodes";
import SumValuesNode from "../nodes/SumValuesNode";
import NumberInputNode from "../nodes/NumberInputNode";


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
registry.registerType({ ...SumValuesNode, Render: () => null });
registry.registerType({ ...NumberInputNode, Render: () => null });

it("sum node resolves", () => {
    resolver = new LocalNodeResolver(registry, testData);
    expect(resolver!.resolveNode(testData.sumNode).sum).toBe(7);
    expect(resolver!.pinData[buildPinId(testData.sumNode.id, SumValuesNode.outSum)]).toBe(7);
    expect(resolver!.resolveNode(testData.sumNode2).sum).toBe(14);
});