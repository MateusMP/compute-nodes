import { CanvasNode, Connection, connToPinId } from './CanvasNode'
import { NodeRegistry, InputFormat } from './NodeRegistry'
import { destructPinId, buildPinId } from './utils'

export interface ConnectionMap {
  [key: string]: Connection
}

export interface ConnectionMapFrom {
  [key: string]: Connection[]
}

export interface NodeMap {
  [key: string]: CanvasNode
}

export const NewNodeEvent = 'node-new'
export const UpdateNodeEvent = 'node-update'
export const DeleteNodeEvent = 'node-delete'
export const NewConnectionEvent = 'connection-new'

/**
 * Keeps state of nodes and connections
 */
export abstract class NodeResolver<T extends NodeRegistry = NodeRegistry> {
  registry: T
  nodes: NodeMap
  handlers: { [key: string]: Function[] }
  linksByTo: ConnectionMap
  linksByFrom: ConnectionMapFrom

  constructor(registry: T, nodes?: any) {
    this.registry = registry
    this.nodes = nodes
    this.handlers = {}
    this.linksByTo = {}
    this.linksByFrom = {}
    this.setupNodes(nodes)
  }

  restoreNodes(nodes: NodeMap) {
    this.setupNodes(nodes)
    return this.linksByTo
  }

  abstract resolvePinData(pinId: string): any

  abstract resolveNodeInputs(
    node: CanvasNode,
    inputFormat: InputFormat | undefined
  ): any

  abstract resolveNodeOutputs(node: CanvasNode, inputData: any): any

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
   * Get current nodes
   */
  getNodes(): NodeMap {
    return this.nodes
  }

  getConnections(): ConnectionMap {
    return this.linksByTo
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
    this.issueEvent(NewNodeEvent, node)
    return node
  }

  /**
   * @param nodeId
   * @returns true if the node is destroyed
   */
  destroyNode(nodeId: string) {
    const node = this.nodes[nodeId]
    if (node) {
      // Delete incoming connections
      if (node.inputPins) {
        Object.keys(node.inputPins).forEach((pinName) =>
          this.destroyConnection(buildPinId(nodeId, pinName))
        )
      }

      // Delete outgoing connections
      const outputFormat = this.registry.getNodeTypeInfo(node.type).OutputFormat
      if (outputFormat) {
        Object.keys(outputFormat).forEach((pinName) => {
          this.destroyConnection(buildPinId(nodeId, pinName))
        })
      }

      delete this.nodes[nodeId]

      this.issueEvent(DeleteNodeEvent, node)
      return true
    }
    return false
  }

  /**
   * Updates a node, triggers {@link UpdateNodeEvent}
   * @param id the node id that is changing
   * @param changes object with patch information
   */
  updateNode(id: string, changes: any) {
    const updatedNode: CanvasNode = { ...this.nodes[id], ...changes }
    this.nodes = { ...this.nodes, [id]: updatedNode }
    this.issueEvent(UpdateNodeEvent, updatedNode)
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

    this.destroyConnection(to)

    const receiveing = destructPinId(to)
    const connection = this.buildNewConnection(
      from,
      receiveing.nodeId,
      receiveing.pin
    )

    this.nodes[receiveing.nodeId].inputPins[receiveing.pin] = from
    const linkFrom = this.linksByFrom[from]
    if (linkFrom) {
      linkFrom.push(connection)
    } else {
      this.linksByFrom[from] = [connection]
    }
    this.linksByTo[to] = connection
    this.issueEvent(NewConnectionEvent, connection)
    return connection
  }

  destroyConnection(pinId: string) {
    if (pinId in this.linksByTo) {
      const prev = this.linksByTo[pinId]
      delete this.linksByFrom[connToPinId(prev.from)]
      delete this.linksByTo[connToPinId(prev.to)]
      delete this.nodes[prev.to.node].inputPins[prev.to.pin]
    } else if (pinId in this.linksByFrom) {
      const { nodeId, pin } = destructPinId(pinId)
      const links = this.linksByFrom[pinId]
      for (let i = 0; i < links.length; ++i) {
        const conn = links[i]
        if (conn.from.node === nodeId && conn.from.pin === pin) {
          delete this.nodes[conn.to.node].inputPins[conn.to.pin]
          delete this.linksByTo[connToPinId(conn.to)]
          this.linksByFrom[pinId] = links.filter((_, j) => j !== i)
        }
      }
    }

    return false
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

  private setupNodes(nodes: any) {
    this.nodes = nodes
    this.bakeConnections(nodes)
  }

  private bakeConnections(nodes: any) {
    this.linksByTo = {}
    this.linksByFrom = {}
    if (!nodes) {
      return false
    }

    Object.keys(nodes).forEach((nodeId) => {
      const node = nodes[nodeId]
      if (node.inputPins) {
        Object.keys(node.inputPins).forEach((toPinName) => {
          if (!(toPinName in this.linksByTo)) {
            const toPinId = buildPinId(nodeId, toPinName)
            const fromPinId = node.inputPins[toPinName]
            const conn = this.buildNewConnection(fromPinId, nodeId, toPinName)
            this.linksByTo[toPinId] = conn
            const fromList = this.linksByFrom[fromPinId]
            if (fromList) {
              this.linksByFrom[fromPinId].push(conn)
            } else {
              this.linksByFrom[fromPinId] = [conn]
            }
          }
        })
      }
    })
    return true
  }

  /**
   * Find node ids that connect to the received node
   * @param node the node to find others connected to it
   * @returns a set of unique node ids that are connected to the outputs of node
   */
  private findOutputConnectedNodes(node: CanvasNode): Set<string> {
    const uniqueOutputs = new Set<string>()

    const nodeOutputs = this.registry.getNodeTypeInfo(node.type).OutputFormat
    if (nodeOutputs) {
      Object.keys(nodeOutputs).forEach((pinName) => {
        const checkPin = this.linksByFrom[buildPinId(node.id, pinName)]
        if (checkPin) {
          checkPin.forEach((link) => {
            uniqueOutputs.add(link.to.node)
          })
        }
      })
    }
    return uniqueOutputs
  }

  private issueEvent(event: string, ...data: any) {
    const handlers = this.handlers[event]
    if (handlers) {
      handlers.forEach((handler: any) => {
        handler(this.nodes, this.linksByTo, data)
      })
    }
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

  private createsCycle(from: string, to: string) {
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

      const otherNodes = this.findOutputConnectedNodes(this.nodes[next!])
      tocheck.push(...Array.from(otherNodes))
    } while (tocheck.length > 0)

    return false
  }
}
