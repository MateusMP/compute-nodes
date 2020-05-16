
import { CanvasNode, NodeResolver, NodeRegistry, NodeTypeDefinition, pinParts, buildPinId, InputFormat, NodeResolver, NodeRegistry, NodeTypeDefinition } from "node-machine";

export interface LocalNodeDefinition extends NodeTypeDefinition {
    localResolve(node: CanvasNode, input: any): any;
}

export class LocalNodeRegistry<T extends LocalNodeDefinition> extends NodeRegistry<T> {
    localResolve(node: CanvasNode, input: any) {
        return this.getNodeTypeInfo(node.type).localResolve(node, input);
    }
}

export class LocalNodeResolver<D extends LocalNodeDefinition, T extends LocalNodeRegistry<D>> extends NodeResolver<D, T> {
    pinData: any;

    constructor(registry: T, nodes?: any) {
        super(registry, nodes);
        this.pinData = {};
    }

    resolvePinData(pinId: string) {
        if (pinId in this.pinData) {
            return this.pinData[pinId];
        } else {
            const { nodeId, pin } = pinParts(pinId);
            if (nodeId in this.nodes) {
                return this.resolveNode(this.nodes[nodeId])[pin];
            }
        }
        return undefined;
    }

    setPinData(pinId: string, data: any) {
        this.pinData[pinId] = data;
    }

    resolveNodeInputs(node: CanvasNode, inputFormat: InputFormat) {
        if (!inputFormat) {
            return undefined;
        }
        const data: any = {};
        Object.keys(inputFormat).forEach((key: string) => {
            const pinId = node.inputPins[key];
            if (pinId) {
                data[key] = this.resolvePinData(pinId);
            }
        });
        return data;
    }

    resolveNodeOutputs(node: CanvasNode, inputData: any) {
        const data = this.registry.localResolve(node, inputData);
        if (data) {
            Object.keys(data).forEach(key => {
                this.setPinData(buildPinId(node.id, key), data[key]);
            });
        }
        return data;
    }
}