import { CanvasNode, Connection } from './CanvasNode'
import { NodeRegistry, InputFormat } from './NodeRegistry'
import { destructPinId, buildPinId } from './utils'

export interface ConnectionMap {
  [key: string]: Connection
}

export interface NodeMap {
  [key: string]: CanvasNode
}

export const NewNodeEvent = 'node-new'
export const UpdateNodeEvent = 'node-update'
export const NewConnectionEvent = 'connection-new'

/**
 * Keeps state of nodes and connections
 */
export abstract class NodeResolver<T extends NodeRegistry = NodeRegistry> {
  registry: T
  nodes: NodeMap
  connections: ConnectionMap
  handlers: { [key: string]: Function[] }

  constructor(registry: T, nodes?: any, connections?: ConnectionMap) {
    this.registry = registry
    this.handlers = {}
    this.nodes = nodes || {}
    if (!connections) {
      this.connections = this.bakeConnections(nodes)
    } else {
      this.connections = connections
    }
  }

  abstract resolvePinData(pinId: string): any

  abstract resolveNodeInputs(
    node: CanvasNode,
    inputFormat: InputFormat | undefined
  ): any

  abstract resolveNodeOutputs(node: CanvasNode, inputData: any): any

  bakeConnections(nodes: any) {
    if (!nodes) {
      return {}
    }

    const connections: any = {}
    Object.keys(nodes).forEach((nodeId) => {
      const node = nodes[nodeId]
      if (node.inputPins) {
        Object.keys(node.inputPins).forEach((toPinName) => {
          if (!(toPinName in connections!)) {
            const toPinId = buildPinId(nodeId, toPinName)
            const fromPinId = node.inputPins[toPinName]
            connections[toPinId] = this.buildNewConnection(
              fromPinId,
              nodeId,
              toPinName
            )
          }
        })
      }
    })
    return connections
  }

  /**
   * Register event listener
   * @param event one of {@link NewNodeEvent}, {@link UpdateNodeEvent}, {@link NewConnectionEvent}
   * @param handler function to be called
   */
  on(event: string, handler: Function) {
    if (!this.handlers[event]) {
      this.handlers[event] = []
    }
    this.handlers[event].push(handler)
  }

  /**
   * Unregister event listener
   * @param event one of {@link NewNodeEvent}, {@link UpdateNodeEvent}, {@link NewConnectionEvent}
   * @param handler the function
   */
  unbind(event: string, handler: Function) {
    if (!this.handlers[event]) {
      this.handlers[event] = []
    }
    this.handlers[event] = this.handlers[event].filter((e) => e !== handler)
  }

  /**
   * Render a node, also embeds some properties such as a reference to the resolver.
   * @param node the node to be rendered
   */
  render(node: CanvasNode) {
    return this.registry.renderNode({
      ...node,
      resolver: this,
      resolvedData: this.resolveNode(node)
    })
  }

  /**
   * Create a new node
   * @param type One of the registered types
   * @param props Properties passed to the construction of the node
   */
  createNode(type: string, { ...args }: any) {
    const node = this.registry.instantiateNewNode(type, args)
    this.nodes = { ...this.nodes, [node.id]: node }
    this.handlers[NewNodeEvent].forEach((e) =>
      e(this.nodes, this.connections, node)
    )
    return node
  }

  /**
   * Updates a node, triggers {@link UpdateNodeEvent}
   * @param id the node id that is changing
   * @param changes object with patch information
   */
  updateNode(id: string, changes: any) {
    const updatedNode: CanvasNode = { ...this.nodes[id], ...changes }
    this.nodes = { ...this.nodes, [id]: updatedNode }
    this.handlers[UpdateNodeEvent].forEach((e) =>
      e(this.nodes, this.connections, updatedNode)
    )
  }

  /**
   * Creates a connection between two pins
   * @param from providing pin
   * @param to receiving pin
   */
  createPinConnection(from: string, to: string) {
    if (this.createsCycle(from, to)) {
      return false
    }

    const receiveing = destructPinId(to)
    const connection = this.buildNewConnection(
      from,
      receiveing.nodeId,
      receiveing.pin
    )

    const receivingNode = this.nodes[receiveing.nodeId]

    this.nodes = {
      ...this.nodes,
      [receiveing.nodeId]: {
        ...receivingNode,
        inputPins: { ...receivingNode.inputPins, [receiveing.pin]: from }
      }
    }
    this.connections = { ...this.connections, [to]: connection }
    this.handlers[NewConnectionEvent].forEach((e) =>
      e(this.nodes, this.connections, connection)
    )
    return connection
  }

  /**
   * Resolves a specific node.
   * Will call {@link NodeResolver#resolveNodeInputs} followed by {@link NodeResolver#resolveNodeOutputs}
   * @param node the node to be resolved
   * @returns an object containing relevant information to display the node
   *          calculated by user provided function. Must be handled accordingly.
   */
  resolveNode(node: CanvasNode) {
    const typeDef = this.registry.getNodeTypeInfo(node.type)

    const inputData = this.resolveNodeInputs(node, typeDef.InputFormat)
    const outputs = this.resolveNodeOutputs(node, inputData)

    return outputs
  }

  //

  private findOutNodes(node: CanvasNode): Set<string> {
    const uniqueOutputs = new Set<string>()
    // TODO make this more efficient by having
    // a output to node index
    Object.entries(this.connections).forEach(([_id, conn]) => {
      if (conn.to) {
        if (conn.from.node === node.id) {
          uniqueOutputs.add(conn.to.node)
        }
      }
    })

    return uniqueOutputs
  }

  private buildNewConnection(
    fromPinId: string,
    toNodeId: string,
    toPinName: string
  ) {
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
        pinId: buildPinId(toNodeId, toPinName)
      }
    }
  }

  createsCycle(from: string, to: string) {
    const visited = new Set()
    const tocheck: string[] = []

    const { nodeId } = destructPinId(from)
    visited.add(nodeId)

    {
      const { nodeId } = destructPinId(to)
      tocheck.push(nodeId)
    }

    do {
      const next = tocheck.pop()
      if (visited.has(next)) {
        return true
      }
      visited.add(next)

      const otherNodes = this.findOutNodes(this.nodes[next!])
      tocheck.push(...Array.from(otherNodes))
    } while (tocheck.length > 0)

    return false
  }
}
