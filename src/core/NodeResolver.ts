import { CanvasNode, Connection, connToPinId } from './CanvasNode'
import { NodeRegistry } from './NodeRegistry'
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

export interface ResolverEvent {
  type: string
  nodes?: NodeMap
  connections?: ConnectionMap
  node?: CanvasNode
  connection?: Connection
  invalidateOutput?: boolean
  [key: string]: any
}

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
    this.nodes = nodes || {}
    this.handlers = {}
    this.linksByTo = {}
    this.linksByFrom = {}
    this.setupNodes(this.nodes)
  }

  /**
   * Recreates the entire node graph using the provided node map.
   * @param nodes the node map to use
   * @returns a map with all unique connections in the graph
   */
  restoreNodes(nodes: NodeMap): ConnectionMap {
    this.setupNodes(nodes)
    return this.linksByTo
  }

  /**
   * Called when an update event sets the invalidateOutput flag
   * @param nodeId the node that had the input validated
   */
  abstract invalidateNodeOutput(nodeId: string): void

  /**
   * Register event listener
   * @param event one of {@link NewNodeEvent}, {@link UpdateNodeEvent}, {@link NewConnectionEvent}
   * @param handler function to be called
   */
  on(event: string, handler: Function): void {
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
  unbind(event: string, handler: Function): void {
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

  /**
   * Get unique connections (by input pinId)
   */
  getConnections(): ConnectionMap {
    return this.linksByTo
  }

  /**
   * Render a node, also embeds some properties such as a reference to the resolver.
   * @param node the node to be rendered
   */
  render(node: CanvasNode): any {
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
    this.issueEvent({ type: NewNodeEvent, nodes: this.nodes, node })
    return node
  }

  /**
   * @param nodeId
   * @returns true if the node is destroyed, false otherwise
   */
  destroyNode(nodeId: string): boolean {
    const node = this.nodes[nodeId]
    if (node) {
      // Delete incoming connections
      if (node.inputPins) {
        Object.keys(node.inputPins).forEach((pinName) =>
          this.internalDestroyConnection(buildPinId(nodeId, pinName))
        )
      }

      // Delete outgoing connections
      const outputFormat = this.registry.getNodeTypeInfo(node.type).OutputFormat
      if (outputFormat) {
        Object.keys(outputFormat).forEach((pinName) => {
          this.internalDestroyConnection(buildPinId(nodeId, pinName))
        })
      }

      this.nodes = { ...this.nodes }
      delete this.nodes[nodeId]

      this.issueEvent({
        type: DeleteNodeEvent,
        nodes: this.nodes,
        connections: this.linksByTo,
        node
      })
      return true
    }
    return false
  }

  /**
   * Iterates over all output connections for a given nodeId
   * @param nodeId the node to go over outgoing connections
   * @param callback the function to call for each connection
   */
  forNodeOutputConnections(
    nodeId: string,
    callback: (nodeId: string, pinName: string, originPin: string) => void
  ) {
    const type = this.registry.getNodeTypeInfo(this.nodes[nodeId].type)
    if (type.OutputFormat) {
      Object.keys(type.OutputFormat).forEach((key) => {
        this.linksByFrom[buildPinId(nodeId, key)]?.forEach((c: Connection) => {
          callback(c.to.node, c.to.pin, c.from.pin)
        })
      })
    }
  }

  /**
   * Updates a node, triggers {@link UpdateNodeEvent}
   * @param id the node id that is changing
   * @param changes object with patch information
   */
  updateNode(id: string, changes: any, eventInfo?: any | ResolverEvent) {
    const updatedNode: CanvasNode = { ...this.nodes[id], ...changes }
    this.nodes = { ...this.nodes, [id]: updatedNode }
    if (eventInfo?.invalidateOutput) {
      this.invalidateNodeOutput(id)
    }
    this.issueEvent({
      type: UpdateNodeEvent,
      nodes: this.nodes,
      connections: this.linksByTo,
      node: updatedNode,
      ...eventInfo
    })
  }

  /**
   * Check if given input pin exists in node graph
   * @param pinId the pin id to check
   */
  isValidInputPin(pinId: string): boolean {
    const { nodeId, pin } = destructPinId(pinId)
    if (nodeId in this.nodes) {
      const input = this.registry.getNodeTypeInfo(this.nodes[nodeId].type)
        .InputFormat
      if (input && pin in input) {
        return true
      }
    }
    return false
  }

  /**
   * Check if given output pin id exists in node graph
   * @param pinId the pin id to check
   */
  isValidOutputPin(pinId: string): boolean {
    const { nodeId, pin } = destructPinId(pinId)
    if (nodeId in this.nodes) {
      const output = this.registry.getNodeTypeInfo(this.nodes[nodeId].type)
        .OutputFormat
      if (output && pin in output) {
        return true
      }
    }
    return false
  }

  /**
   * Creates a connection between two pins
   * @param from providing pin
   * @param to receiving pin
   * @returns the new connection or false
   */
  createPinConnection(from: string, to: string): Connection | false {
    if (this.createsCycle(from, to)) {
      return false
    }

    if (!this.isValidOutputPin(from) || !this.isValidInputPin(to)) {
      return false
    }

    this.nodes = { ...this.nodes }
    this.linksByTo = { ...this.linksByTo }
    this.linksByFrom = { ...this.linksByFrom }
    this.internalDestroyConnection(to)

    const receiveing = destructPinId(to)
    const connection = this.buildNewConnection(
      from,
      receiveing.nodeId,
      receiveing.pin
    )

    const node = this.nodes[receiveing.nodeId]
    const updatedNode = {
      ...node,
      inputPins: { ...node.inputPins, [receiveing.pin]: from }
    }
    this.nodes = { ...this.nodes, [node.id]: updatedNode }
    const linkFrom = this.linksByFrom[from]
    if (linkFrom) {
      linkFrom.push(connection)
    } else {
      this.linksByFrom[from] = [connection]
    }
    this.linksByTo[to] = connection
    this.issueEvent({
      type: NewConnectionEvent,
      nodes: this.nodes,
      connections: this.linksByTo,
      connection
    })
    return connection
  }

  /**
   * @param pinId
   */
  private internalDestroyConnection(pinId: string) {
    if (pinId in this.linksByTo) {
      const prev = this.linksByTo[pinId]
      const fromPinId = connToPinId(prev.from)
      const linksFrom = this.linksByFrom[fromPinId]
      this.linksByFrom[fromPinId] = linksFrom.filter(
        (link) => connToPinId(link.to) !== pinId
      )
      delete this.linksByTo[connToPinId(prev.to)]
      this.nodes[prev.to.node].inputPins = {
        ...this.nodes[prev.to.node].inputPins
      }
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
   * @param node the node to be resolved
   * @returns an object containing relevant information to display the node
   *          calculated by user provided function. Must be handled accordingly.
   */
  abstract resolveNode(node: CanvasNode): any

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

  private issueEvent(event: ResolverEvent) {
    const handlers = this.handlers[event.type]
    if (handlers) {
      handlers.forEach((handler: any) => {
        handler(event)
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
