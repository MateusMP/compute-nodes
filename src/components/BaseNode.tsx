import React, { ReactNode } from 'react'
import { Container, Row, Col } from 'react-bootstrap'

import { CanvasNode } from '../core/CanvasNode'
import { InputFormat } from '../core/NodeRegistry'
import { NodeResolver } from '../core/NodeResolver'
import { snapped, shouldAllowInputEvent } from '../core/utils'

import { drag as d3drag } from 'd3-drag'
import { select as d3select, event as d3event } from 'd3-selection'

//import * as d3 from 'd3'

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
  inputPinChangeHandler: any
  coords: any;

  constructor(props: BaseNodeProps) {
    super(props)
    this.state = {}

    this.dragArea = React.createRef()
    this.inputPinChangeHandler = {}

    this.destroyNode = this.destroyNode.bind(this);
  }

  destroyNode() {
    this.props.resolver?.destroyNode(this.props.id);
  }

  pinChangedAndIsValid(pin: string, before: any, after: any) {
    const afterPin = after.inputPins[pin]
    return before.inputPins[pin] !== afterPin && afterPin
  }

  componentDidUpdate() {
    const { x, y } = this.props
    d3select(this.dragArea.current).data([{ x, y }])
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
      d3select(that.dragArea.current.parentNode).attr('x', snapped(d.x)).attr('y', snapped(d.y))
      that.props.resolver!.updateNode(that.props.id, { x: snapped(d.x), y: snapped(d.y) }, { nohistory: true })
    }

    function dragended(this: any, d: any) {
      d.x = d3event.x
      d.y = d3event.y
      d3select(that.dragArea.current.parentNode).attr('x', snapped(d.x)).attr('y', snapped(d.y))
      if (that.props.x !== d.x || that.props.y !== d.y) {
        that.props.resolver!.updateNode(that.props.id, { x: snapped(d.x), y: snapped(d.y) })
      }
    }

    const dragCall = d3drag<SVGForeignObjectElement, any>()
      .filter(() => shouldAllowInputEvent(d3event.target))
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended)

    const { x, y } = this.props
    d3select(element).data([{ x, y }]).call(dragCall)
  }

  componentDidMount() {
    this.registerForDragging(this.dragArea.current)
  }

  render() {
    const { x, y } = this.props
    const hasError = this.props.error

    return (
      <foreignObject
        x={x}
        y={y}
        width={this.props.minWidth || 160}
        height={this.props.minHeight || 160}
        className='embedded-node'
      >
        <div
          ref={this.dragArea}
          title={this.props.title}
          className={`node ${hasError ? 'error' : ''}`}
        >
          <Container className='main-node node-drag'>
            <div className='node-remove'>
              <span role='img' aria-label='delete' onClick={this.destroyNode}>
                🗑️
              </span>
            </div>
            <Row className='header'>
              <Col md={12} className='node-drag'>
                <span>{this.props.title}</span>
                <hr />
              </Col>
            </Row>
            {this.props.children}
          </Container>
        </div>
      </foreignObject>
    )
  }
}
