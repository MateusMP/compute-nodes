import { CanvasNode, Connection } from "./CanvasNode";
import { NodeRegistry, InputFormat } from "./NodeRegistry";
import { destructPinId, buildPinId } from "./utils";

export interface ConnectionMap {
    [key: string]: Connection
}

export interface NodeMap {
    [key: string]: CanvasNode
}

export const NewNodeEvent = 'node-new';
export const UpdateNodeEvent = 'node-update'
export const NewConnectionEvent = 'connection-new'

export abstract class NodeResolver<T extends NodeRegistry = NodeRegistry> {
    registry: T;
    nodes: NodeMap;
    connections: ConnectionMap;
    handlers: { [key: string]: Function[] };

    constructor(registry: T, nodes?: any, connections?: ConnectionMap) {
        this.registry = registry;
        this.handlers = {};
        this.nodes = nodes || {};
        if (!connections) {
            this.connections = this.bakeConnections(nodes);
        } else {
            this.connections = connections;
        }
    }

    abstract resolvePinData(pinId: string): any;

    abstract resolveNodeInputs(node: CanvasNode, inputFormat: InputFormat | undefined): any;

    abstract resolveNodeOutputs(node: CanvasNode, inputData: any): any;

    bakeConnections(nodes: any) {
        if (!nodes) {
            return {};
        }

        const connections: any = {};
        Object.keys(nodes).forEach(nodeId => {
            const node = nodes[nodeId];
            if (node.inputPins) {
                Object.keys(node.inputPins).forEach(toPinName => {
                    if (!(toPinName in connections!)) {
                        const toPinId = buildPinId(nodeId, toPinName);
                        const fromPinId = node.inputPins[toPinName];
                        connections[toPinId] = this.buildNewConnection(fromPinId, nodeId, toPinName);
                    }
                });
            }
        });
        return connections;
    }

    on(event: string, handler: Function) {
        if (!this.handlers[event]) {
            this.handlers[event] = [];
        }
        this.handlers[event].push(handler);
    }

    unbind(event: string, handler: Function) {
        if (!this.handlers[event]) {
            this.handlers[event] = [];
        }
        this.handlers[event] = this.handlers[event].filter(e => e != handler);
    }

    render(node: CanvasNode) {
        return this.registry.renderNode({ ...node, resolver: this, resolvedData: this.resolveNode(node) });
    }

    createNode(type: string, { ...args }: any) {
        const node = this.registry.instantiateNewNode(type, args);
        this.nodes = { ...this.nodes, [node.id]: node };
        this.handlers[NewNodeEvent].forEach(e => e(this.nodes, this.connections, node));
        return node;
    }

    updateNode(id: string, changes: any) {
        const updatedNode: CanvasNode = { ...this.nodes[id], ...changes };
        this.nodes = { ...this.nodes, [id]: updatedNode };
        this.handlers[UpdateNodeEvent].forEach(e => e(this.nodes, this.connections, updatedNode));
    }

    createPinConnection(from: string, to: string) {
        if (this.createsCycle(from, to)) {
            return false;
        }

        const receiveing = destructPinId(to);
        const connection = this.buildNewConnection(from, receiveing.nodeId, receiveing.pin);

        const receivingNode = this.nodes[receiveing.nodeId];

        this.nodes = {
            ...this.nodes,
            [receiveing.nodeId]: {
                ...receivingNode,
                inputPins: { ...receivingNode.inputPins, [receiveing.pin]: from }
            }
        }
        this.connections = { ...this.connections, [to]: connection };
        this.handlers[NewConnectionEvent].forEach(e => e(this.nodes, this.connections, connection));
        return connection;
    }

    resolveNode(node: CanvasNode) {
        const typeDef = this.registry.getNodeTypeInfo(node.type);

        let inputData = this.resolveNodeInputs(node, typeDef.InputFormat);
        const outputs = this.resolveNodeOutputs(node, inputData);

        return outputs;
    }

    //

    findOutNodes(node: CanvasNode): Set<string> {
        const uniqueOutputs = new Set<string>();
        // TODO make this more efficient by having
        // a output to node index
        Object.entries(this.connections).forEach(([_id, conn]) => {
            if (conn.to) {
                if (conn.from.node == node.id) {
                    uniqueOutputs.add(conn.to.node);
                }
            }
        });

        return uniqueOutputs;
    }

    buildNewConnection(fromPinId: string, toNodeId: string, toPinName: string) {
        const { nodeId: fromNode, pin: fromPin } = destructPinId(fromPinId)

        return {
            from: {
                node: fromNode,
                pin: fromPin,
                pinId: fromPinId
            },
            to: {
                node: toNodeId,
                pin: toPinName,
                pinId: buildPinId(toNodeId, toPinName),
            }
        }
    }


    createsCycle(from: string, to: string) {

        const visited = new Set();
        const tocheck: string[] = [];

        let { nodeId } = destructPinId(from);
        visited.add(nodeId)

        {
            let { nodeId } = destructPinId(to);
            tocheck.push(nodeId);
        }

        do {
            let next = tocheck.pop();
            if (visited.has(next)) {
                return true;
            }
            visited.add(next);

            const otherNodes = this.findOutNodes(this.nodes[next!]);
            tocheck.push(...Array.from(otherNodes));
        } while (tocheck.length > 0);

        return false;
    }


}