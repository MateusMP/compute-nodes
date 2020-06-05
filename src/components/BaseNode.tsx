import React, { ReactNode } from 'react'

import { CanvasNode } from '../core/CanvasNode'
import { InputFormat } from '../core/NodeRegistry'
import { NodeResolver } from '../core/NodeResolver'
import { snapped, shouldAllowInputEvent } from '../core/utils'

import { drag as d3drag } from 'd3-drag'
import { select as d3select, event as d3event } from 'd3-selection'
import { InputPin, OutputPin } from './Pin'

export interface PinData {
  [key: string]: any
}

export interface BaseNodeProps extends CanvasNode {
  minWidth?: number
  minHeight?: number
  data?: PinData
  error?: boolean
  children: ReactNode
  title: string

  resolver?: NodeResolver
  input?: InputFormat
  output?: InputFormat
}

/**
 * A Base node.
 * Provides dragging functionallity and basic layout
 */
export class BaseNode extends React.Component<BaseNodeProps, any> {
  dragArea: any
  resize: any
  inputPinChangeHandler: any
  coords: any
  onResize?: { (width: number): void }

  static readonly MIN_WIDTH = 160
  static readonly MIN_HEIGHT = 96

  constructor(props: BaseNodeProps) {
    super(props)
    this.state = {}

    this.dragArea = React.createRef()
    this.resize = React.createRef()
    this.inputPinChangeHandler = {}

    this.destroyNode = this.destroyNode.bind(this)
  }

  destroyNode() {
    this.props.resolver?.destroyNode(this.props.id)
  }

  pinChangedAndIsValid(pin: string, before: any, after: any) {
    const afterPin = after.inputPins[pin]
    return before.inputPins[pin] !== afterPin && afterPin
  }

  componentDidUpdate() {
    const { x, y, width, height } = this.props
    d3select(this.dragArea.current).data([
      {
        x,
        y
      }
    ])
    d3select(this.resize.current).data([
      {
        x,
        y,
        width,
        height,
        minW: this.props.minWidth || BaseNode.MIN_WIDTH,
        minH: this.props.minHeight || BaseNode.MIN_HEIGHT
      }
    ])
  }

  registerForDragging(element: SVGForeignObjectElement) {
    const that = this

    function dragstarted(d: any) {
      d.x = d3event.x
      d.y = d3event.y
    }

    function dragged(d: any) {
      d.x = d3event.x
      d.y = d3event.y
      d3select(that.dragArea.current.parentNode)
        .attr('x', snapped(d.x))
        .attr('y', snapped(d.y))
      that.props.resolver!.updateNode(
        that.props.id,
        { x: snapped(d.x), y: snapped(d.y) },
        { nohistory: true }
      )
    }

    function dragended(this: any, d: any) {
      d.x = d3event.x
      d.y = d3event.y
      d3select(that.dragArea.current.parentNode)
        .attr('x', snapped(d.x))
        .attr('y', snapped(d.y))
      if (that.props.x !== d.x || that.props.y !== d.y) {
        that.props.resolver!.updateNode(that.props.id, {
          x: snapped(d.x),
          y: snapped(d.y)
        })
      }
    }

    const dragCall = d3drag<SVGForeignObjectElement, any>()
      .filter(() => shouldAllowInputEvent(d3event.target))
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended)

    const { x, y } = this.props
    d3select(element)
      .data([
        {
          x,
          y
        }
      ])
      .call(dragCall)
  }

  registerForResize(element: any) {
    const that = this

    function resizeStarted(d: any) {
      d.rx = d3event.x
      d.ry = d3event.y
      d.startW = d.width
      d.startH = d.height
    }

    function resized(d: any) {
      d.width = snapped(Math.max(d.startW + d3event.x - d.rx, d.minW))
      d.height = snapped(Math.max(d.startH + d3event.y - d.ry, d.minH))

      d3select(that.dragArea.current.parentNode)
        .attr('width', d.width)
        .attr('height', d.height)
      that.props.resolver!.updateNode(
        that.props.id,
        { width: d.width, height: d.height },
        { nohistory: true }
      )
    }

    function resizeEnded(this: any, d: any) {
      d.width = snapped(Math.max(d.startW + d3event.x - d.rx, d.minW))
      d.height = snapped(Math.max(d.startH + d3event.y - d.ry, d.minH))

      d3select(that.dragArea.current.parentNode)
        .attr('width', d.width)
        .attr('height', d.height)
      if (that.props.width !== d.width || that.props.height !== d.height) {
        that.props.resolver!.updateNode(that.props.id, {
          width: d.width,
          height: d.height
        })
      }
    }

    const dragResize = d3drag<SVGForeignObjectElement, any>()
      .filter(() => shouldAllowInputEvent(d3event.target))
      .on('start', resizeStarted)
      .on('drag', resized)
      .on('end', resizeEnded)

    const { x, y, width, height } = this.props
    d3select(element)
      .data([
        {
          x,
          y,
          width,
          height,
          minW: this.props.minWidth || BaseNode.MIN_WIDTH,
          minH: this.props.minHeight || BaseNode.MIN_HEIGHT
        }
      ])
      .call(dragResize)
  }

  componentDidMount() {
    this.registerForDragging(this.dragArea.current)
    this.registerForResize(this.resize.current)
  }

  render() {
    const { x, y } = this.props
    const hasError = this.props.error

    const inputPins = this.props.input
      ? Object.entries(this.props.input).map(([key, value]) => {
          return (
            <InputPin
              error={false}
              dataType={value.type}
              resolver={this.props.resolver!}
              key={key}
              nodeId={this.props.id}
              name={key}
              visualName={value.visualName}
            />
          )
        })
      : null

    const outputPins = this.props.output
      ? Object.entries(this.props.output).map(([key, value]) => {
          return (
            <OutputPin
              dataType={value.type}
              key={key}
              nodeId={this.props.id}
              name={key}
              visualName={value.visualName}
            />
          )
        })
      : null

    return (
      <foreignObject
        x={x}
        y={y}
        width={Math.max(
          this.props.minWidth || BaseNode.MIN_WIDTH,
          this.props.width
        )}
        height={Math.max(
          this.props.minHeight || BaseNode.MIN_HEIGHT,
          this.props.height
        )}
        className='embedded-node'
      >
        <div
          ref={this.dragArea}
          title={this.props.title}
          className={`node ${hasError ? 'error' : ''}`}
        >
          <div className='main-node node-drag'>
            <div className='node-remove'>
              <span role='img' aria-label='delete' onClick={this.destroyNode}>
                🗑️
              </span>
            </div>
            <div className='header'>
              <div className='node-drag'>
                <span>{this.props.title}</span>
                <hr />
              </div>
            </div>

            <div className='node-body'>
              {this.props.input ? (
                <div className='ignore-mouse inputs'>{inputPins}</div>
              ) : null}

              <div
                className='contents'
                style={{ maxHeight: this.props.height - 20 - 45 }}
              >
                {this.props.children}
              </div>

              {this.props.output ? (
                <div className='outputs'>{outputPins}</div>
              ) : null}
            </div>
          </div>
          <div className='resize' ref={this.resize}>
            ᒧ
          </div>
        </div>
      </foreignObject>
    )
  }
}
