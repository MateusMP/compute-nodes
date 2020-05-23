import React from 'react'

import { InputPin, OutputPin } from './Pin'
import { BaseNode, BaseNodeProps } from './BaseNode'

interface OwnProps extends BaseNodeProps {
  mdOut?: number
}

/**
 * An automatic base node that includes layout generation for input and output pins
 */
export class AutoBaseNode extends React.Component<OwnProps, any> {
  render() {
    const hasError = this.props.error || false
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
      <BaseNode {...this.props} error={hasError}>
        <div className="node-body">
          {this.props.input ? (
            <div className='ignore-mouse inputs'>
              {inputPins}
            </div>
          ) : null}

          <div className="contents">{this.props.children}</div>

          {this.props.output ? <div className="outputs">{outputPins}</div> : null}
        </div>
      </BaseNode>
    )
  }
}
