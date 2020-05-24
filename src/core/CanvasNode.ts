import { buildPinId } from './utils'

export interface InputPins {
  [key: string]: string | undefined
}

export interface ConnectionInfo {
  node: string
  pin: string
}

export function connToPinId(c: ConnectionInfo) {
  return buildPinId(c.node, c.pin)
}

export interface Connection {
  to: ConnectionInfo
  from: ConnectionInfo
}

/**
 * Base of all nodes
 */
export class CanvasNode {
  type: string
  id: string
  x: number
  y: number
  width: number
  height: number

  /**
   * Incomming connections
   */
  inputPins: InputPins

  /**
   * Should hold any persistent data for this node.
   */
  data?: any

  constructor(d: any) {
    this.id = d.id
    this.type = d.type
    this.x = d.x
    this.y = d.y
    this.width = d.width
    this.height = d.height
    this.inputPins = d.inputPins || {}
  }
}
