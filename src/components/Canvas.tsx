import React from 'react'
import { ItemTypes } from '../core/Constants'
import { useDrop, XYCoord } from 'react-dnd'
import Connector from './Connector'

import * as d3 from 'd3'

import {
  ConnectionMap,
  NodeResolver,
  NodeMap,
  NewNodeEvent,
  UpdateNodeEvent,
  NewConnectionEvent,
  DeleteNodeEvent,
  ResolverEvent
} from '../core/NodeResolver'
import { connToPinId } from '../core/CanvasNode'
import { screenToSvg, snapped, shouldAllowInputEvent } from '../core'

interface SvgCanvasProps {
  children: React.ReactNode
  canvas: Canvas
}

interface CanvasDropItem {
  type: ItemTypes
  [key: string]: any
}

/**
 * SVG Canvas with drop event handling
 */
function SvgCanvas({ canvas, children }: SvgCanvasProps) {
  const [{ isOver }, ref] = useDrop({
    accept: [ItemTypes.VISUAL_NODE],
    drop: (e: CanvasDropItem, monitor: any) => {
      canvas.variableDropped(e, monitor.getClientOffset()!)
    },
    collect: (monitor: any) => ({
      isOver: !!monitor.isOver(),
      clientOffset: monitor.getClientOffset()
    })
  })

  return (
    <svg ref={ref} id='canvas' width='100%' height='100vh'>
      {isOver ? (
        <text x={20} y={20}>
          Drop do create node!
        </text>
      ) : null}
      {children}
    </svg>
  )
}

interface OwnProps {
  resolver: NodeResolver
}
interface State {
  nodes: NodeMap
  connections: ConnectionMap
}
interface Transform {
  x: number
  y: number
  zoom: number
}

interface UndoEntry {
  data: NodeMap
  description: string
}

/**
 * Canvas responsible to render the nodes and links
 * Will listen to events from {@link NodeResolver}
 */
export class Canvas extends React.Component<OwnProps, State> {
  transform: Transform
  mainGroup: React.RefObject<SVGGElement>
  dragG: React.RefObject<SVGGElement>
  shouldRenderConnections = false
  undo: UndoEntry[]
  undoIndex: number

  /**
   * @param props @see {@link OwnProps} for details
   */
  constructor(props: OwnProps) {
    super(props)

    this.state = {
      nodes: props.resolver.getNodes(),
      connections: props.resolver.getConnections(),
    }

    this.undo = [{ data: this.state.nodes, description: "Start" }]
    this.undoIndex = 0;
    this.variableDropped = this.variableDropped.bind(this)
    this.mainGroup = React.createRef<SVGGElement>()
    this.dragG = React.createRef<SVGGElement>()
    this.transform = { x: 0, y: 0, zoom: 1 }

    this.resolverStateChanged = this.resolverStateChanged.bind(this)
  }

  variableDropped(e: CanvasDropItem, offset: XYCoord) {
    const p = this.svgPoint(offset.x, offset.y)
    this.props.resolver.createNode(e.nodeType, { x: snapped(p[0]), y: snapped(p[1]), ...e })
  }

  svgPoint(x: number, y: number) {
    if (this.mainGroup.current !== null) {
      const svg: SVGSVGElement = this.mainGroup.current.closest("svg") as SVGSVGElement
      return screenToSvg(svg, this.mainGroup.current, x, y)
    }
    throw new Error('Invalid G group')
  }

  renderConnections() {
    const PIN_HSIZE = 20 / 2
    const VISUAL_OFFSET = PIN_HSIZE * this.transform.zoom

    const connections = Object.entries(this.state.connections)
    const list: any[] = []
    connections.forEach(([id, connection]) => {
      // TODO: Consider going through element id only once to avoid multiple getBoundingClientRect on same element?
      const bA = document
        .getElementById(connToPinId(connection.from))
        ?.getBoundingClientRect()
      const bB = document
        .getElementById(connToPinId(connection.to))
        ?.getBoundingClientRect()
      if (!bA) {
        console.warn(
          `Bad pin connection: From: ${connToPinId(connection.from)} missing`
        )
        return
      }
      if (!bB) {
        console.warn(
          `Bad pin connection: To: ${connToPinId(connection.to)} missing`
        )
        return
      }

      const posA = this.svgPoint(bA.x + VISUAL_OFFSET, bA.y + VISUAL_OFFSET)
      const posB = this.svgPoint(bB.x + VISUAL_OFFSET, bB.y + VISUAL_OFFSET)

      list.push(<Connector key={id} startPoint={posA} endPoint={posB} />)
    })
    return list
  }

  renderNodes() {
    const entries = Object.entries(this.state.nodes)
    const a = Array.from(entries, ([id, node]) => {
      return (
        <React.Fragment key={id}>
          {this.props.resolver.render(node)}
        </React.Fragment>
      )
    })
    return a
  }

  resolverStateChanged(event: ResolverEvent) {
    if (event.nodes && !event.nohistory) {
      this.saveNodeHistory(event.nodes)
    }

    this.setState({
      nodes: event.nodes ? event.nodes : this.state.nodes,
      connections: event.connections ? event.connections : this.state.connections
    })
  }

  saveNodeHistory(nodes: any) {
    // Clear future history
    this.undo = this.undo.slice(0, this.undoIndex + 1);

    // Save new history
    const undodata = { data: nodes, description: "state?" }
    this.undo.push(undodata)
    this.undoIndex++;
  }

  redoOnce() {
    if (this.undoIndex + 1 < this.undo.length) {
      this.undoIndex++;
      this.useFromHistory();
    }
  }

  useFromHistory() {
    const nodes = this.undo[this.undoIndex]
    this.props.resolver.restoreNodes(nodes.data)
    this.setState({
      nodes: this.props.resolver.getNodes(),
      connections: this.props.resolver.getConnections(),
    })
  }

  undoOnce() {
    if (this.undoIndex !== 0) {
      this.undoIndex--;
      this.useFromHistory();
    }
  }

  componentWillUnmount() {
    this.props.resolver.unbind(NewNodeEvent, this.resolverStateChanged)
    this.props.resolver.unbind(UpdateNodeEvent, this.resolverStateChanged)
    this.props.resolver.unbind(DeleteNodeEvent, this.resolverStateChanged)
    this.props.resolver.unbind(NewConnectionEvent, this.resolverStateChanged)
  }

  componentDidMount() {
    this.props.resolver.on(NewNodeEvent, this.resolverStateChanged)
    this.props.resolver.on(UpdateNodeEvent, this.resolverStateChanged)
    this.props.resolver.on(DeleteNodeEvent, this.resolverStateChanged)
    this.props.resolver.on(NewConnectionEvent, this.resolverStateChanged)

    if (this.mainGroup.current && this.dragG.current) {
      const that = this
      const g = d3.select(this.mainGroup.current)
      d3.select(this.dragG.current).call(
        d3.zoom<SVGGElement, any>()
        .filter(() => shouldAllowInputEvent(d3.event.target))
        .on('zoom', function () {
          that.transform = {
            x: d3.event.transform.x,
            y: d3.event.transform.y,
            zoom: d3.event.transform.k
          }
          g.attr('transform', d3.event.transform)
        })
      )

      // Force update because the links can only be rendered
      // after node pins are in the dom, thus we re-render
      // so that connections components are actually displayed
      setTimeout(() => {
        this.shouldRenderConnections = true
        this.forceUpdate()
      }, 50)
    }
  }

  componentDidUpdate(_prevProps: OwnProps, prevState: State) {
    if (this.state.connections !== prevState.connections) {
      this.shouldRenderConnections = false
      setTimeout(() => {
        this.shouldRenderConnections = true
        this.forceUpdate()
      }, 10)
    }
  }

  render() {
    return (
      <SvgCanvas canvas={this}>
        <g ref={this.dragG}>
          <rect
            x='0'
            y='0'
            width='100%'
            height='100%'
            fill='white'
            style={{ visibility: 'hidden', pointerEvents: 'all' }}
          />
          <g ref={this.mainGroup} transform='translate(0,0) scale(1)'>
              {this.shouldRenderConnections ? this.renderConnections() : null}
              <g>{this.renderNodes()}</g>
          </g>
        </g>
      </SvgCanvas>
    )
  }
}
