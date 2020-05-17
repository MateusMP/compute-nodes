
import React from 'react';

import { Row, Col } from 'react-bootstrap';

import { InputPin, OutputPin } from './Pin';
import { BaseNode, BaseNodeProps } from './BaseNode';


interface OwnProps extends BaseNodeProps {
    mdOut?: number;
}

/**
 * An automatic base node that includes layout generation for input and output pins
 */
export class AutoBaseNode extends React.Component<OwnProps, any> {

    render() {
        let hasError = this.props.error || false;
        const inputPinComponents = this.props.input ? Object.entries(this.props.input).map(([key, value]) => {
            return <InputPin error={false} dataType={value.type} resolver={this.props.resolver!} key={key} nodeId={this.props.id} name={key} visualName={value.visualName} />;
        }) : null;

        const outputPinComponents = this.props.output ? Object.entries(this.props.output).map(([key, value]) => {
            return <OutputPin dataType={value.type} key={key} nodeId={this.props.id} name={key} visualName={value.visualName} />;
        }) : null;

        const mdIn = this.props.input ? 2 : 0;
        const mdOut = this.props.output ? (this.props.mdOut ? this.props.mdOut : 2) : 0;

        return (
            <BaseNode {...this.props} error={hasError}>
                <Row>
                    {mdIn ?
                        (<Col md={mdIn} className="ignore-mouse">
                            {inputPinComponents}
                        </Col>) : null}

                    <Col md={12 - mdIn - mdOut}>
                        {this.props.children}
                    </Col>

                    {mdOut ?
                        (<Col md={mdOut}>
                            {outputPinComponents}
                        </Col>) : null}

                </Row>
            </BaseNode>
        );
    }

}