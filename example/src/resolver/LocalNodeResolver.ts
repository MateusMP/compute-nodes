
import { CanvasNode, NodeRegistry, NodeResolver, InputFormat, buildPinId, destructPinId } from 'node-machine';

export interface LocalNodeDefinition {
    LocalResolve(node: CanvasNode, input: any): any;
}

export class LocalNodeRegistry extends NodeRegistry<LocalNodeDefinition> {
    localResolve(node: CanvasNode, input: any) {
        return this.getNodeTypeInfo(node.type).LocalResolve(node, input);
    }
}

export class LocalNodeResolver extends NodeResolver<LocalNodeRegistry> {
    pinData: any;

    constructor(registry: LocalNodeRegistry, nodes?: any) {
        super(registry, nodes);
        this.pinData = {};
    }

    resolvePinData(pinId: string) {
        if (pinId in this.pinData) {
            return this.pinData[pinId];
        } else {
            const { nodeId, pin } = destructPinId(pinId);
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