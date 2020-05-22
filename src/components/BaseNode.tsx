import React, { ReactNode } from 'react'
import { Container, Row, Col } from 'react-bootstrap'

import { CanvasNode } from '../core/CanvasNode'
import { InputFormat } from '../core/NodeRegistry'
import { NodeResolver } from '../core/NodeResolver'
import { screenToSvg, snapped } from '../core/utils'

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
  coords: any;

  constructor(props: BaseNodeProps) {
    super(props)
    this.state = {}

    this.dragArea = React.createRef()
    this.minWidth = props.minWidth || '150px'
    this.inputPinChangeHandler = {}

    this.destroyNode = this.destroyNode.bind(this);

    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.moveElement = this.moveElement.bind(this);
  }

  destroyNode() {
    this.props.resolver?.destroyNode(this.props.id);
  }

  pinChangedAndIsValid(pin: string, before: any, after: any) {
    const afterPin = after.inputPins[pin]
    return before.inputPins[pin] !== afterPin && afterPin
  }

  handleMouseDown(e: any) {
    let el = e.target
    let i = 0
    while (i < 20 && el) {
      if (el instanceof HTMLInputElement) {
        return;
      }
      if (el.classList && el.classList.contains('node-nodrag')) {
        return
      }
      el = el.parentNode
      i++
    }

    const g = e.target.closest("g");
    const svg = g.closest("svg")
    if (svg) {
      const p = screenToSvg(svg, g, e.pageX, e.pageY);
      this.coords = {
        x: snapped(p[0]),
        y: snapped(p[1]),
        g: g,
        svg: svg
      }
      e.preventDefault()
      e.stopPropagation()
      document.addEventListener('mousemove', this.handleMouseMove);
      document.addEventListener('mouseup', this.handleMouseUp)
    }
  };

  handleMouseUp(e: any) {
    if (this.coords) {
      document.removeEventListener('mousemove', this.handleMouseMove);
      document.removeEventListener('mouseup', this.handleMouseUp);
      this.handleMouseMove(e)
      this.coords = null;
    }
  };

  handleMouseMove(e: any) {
    if (this.coords) {
      e.preventDefault()
      e.stopPropagation()
      this.moveElement(e.pageX, e.pageY)
    }
  }

  moveElement(x: number, y: number) {
    const p = screenToSvg(this.coords.svg, this.coords.g, x, y);

    const xDiff = snapped(this.coords.x - p[0]);
    const yDiff = snapped(this.coords.y - p[1]);

    this.coords.x = snapped(p[0]);
    this.coords.y = snapped(p[1]);

    this.props.resolver!.updateNode(this.props.id, { x: snapped(this.props.x - xDiff), y: snapped(this.props.y - yDiff) })
  };

  getContent(): React.ReactNode {
    return null
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
          onMouseDown={this.handleMouseDown}
          onMouseUp={this.handleMouseUp}
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
