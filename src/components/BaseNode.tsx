import React, { ReactNode } from 'react'
import { Container, Row, Col } from 'react-bootstrap'

import * as d3 from 'd3'
import { CanvasNode } from '../core/CanvasNode'
import { InputFormat } from '../core/NodeRegistry'
import { NodeResolver } from '../core/NodeResolver'

export interface PinData {
  [key: string]: any
}

export interface BaseNodeProps extends CanvasNode {
  minWidth?: string
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
  minWidth: string
  inputPinChangeHandler: any

  constructor(props: BaseNodeProps) {
    super(props)
    this.state = {}

    this.dragArea = React.createRef()
    this.minWidth = props.minWidth || '150px'
    this.inputPinChangeHandler = {}
  }

  pinChangedAndIsValid(pin: string, before: any, after: any) {
    const afterPin = after.inputPins[pin]
    return before.inputPins[pin] !== afterPin && afterPin
  }

  registerForDragging(element: SVGForeignObjectElement) {
    const that = this

    function dragstarted(d: any) {
      d.x = d3.event.x
      d.y = d3.event.y
      d3.select(that.dragArea.current).attr('x', d.x).attr('y', d.y)
      // that.props.canvas.updateNodePosition(that.props.instance.id, d.x,d.y);
    }

    function dragged(d: any) {
      d.x = d3.event.x
      d.y = d3.event.y
      // d3.select(that.dragArea.current).attr("x", d.x).attr("y", d.y);
      that.props.resolver!.updateNode(that.props.id, { x: d.x, y: d.y })
    }

    function dragended(this: any, d: any) {
      dragged(d)
      d3.select(this).style('border', null)
    }

    const dragCall = d3
      .drag<SVGForeignObjectElement, any>()
      .filter(() => {
        let el = d3.event.target
        let i = 0
        while (i < 20 && el) {
          if (el.classList && el.classList.contains('node-nodrag')) {
            return false
          }
          el = el.parentNode
          i++
        }
        return true
      })
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended)

    const { x, y } = this.props
    d3.select(element).data([{ x, y }]).call(dragCall)
  }

  getContent(): React.ReactNode {
    return null
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
        width={this.minWidth}
        height={5}
        className='embedded-node'
      >
        <div
          ref={this.dragArea}
          title={this.props.title}
          className={`node ${hasError ? 'error' : ''}`}
        >
          <Container className='main-node node-drag'>
            <div className='node-remove'>
              <span role='img' aria-label='delete'>
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
