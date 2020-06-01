
import { CanvasNode, NodeRegistry, NodeResolver, InputFormat, buildPinId, destructPinId } from 'compute-nodes';

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
    resolvedNodes: any;

    constructor(registry: LocalNodeRegistry, nodes?: any) {
        super(registry, nodes);
        this.pinData = {};
        this.resolvedNodes = {};
    }

    /**
     * Resolves a specific node.
     * @param node the node to be resolved
     * @returns an object containing relevant information to display the node
     *          calculated by user provided function. Must be handled accordingly.
     */
    resolveNode(node: CanvasNode) {
        if (node.id in this.resolvedNodes) {
            return this.resolvedNodes[node.id]
        } else {
            const typeDef = this.registry.getNodeTypeInfo(node.type)
            const inputData = this.resolveNodeInputs(node, typeDef.InputFormat)
            const outputs = this.resolveNodeOutputs(node, inputData)
            this.resolvedNodes[node.id] = outputs
            return outputs
        }
    }

    invalidateNodeOutput(nodeId: string): void {
        if (nodeId in this.resolvedNodes) {
            delete this.resolvedNodes[nodeId]
            this.forNodeOutputConnections(nodeId, (subNodeId: string, pinName: string, fromPin: string) => {
                this.invalidateNodeOutput(subNodeId);
                delete this.pinData[buildPinId(nodeId, fromPin)]
            })
        }
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

    resolveNodeInputs(node: CanvasNode, inputFormat?: InputFormat) {
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
        return data;
    }
}