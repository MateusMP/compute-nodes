import React, { Component } from 'react';

import { Form } from 'react-bootstrap';

import NumberInputNode from '../NumberInputNode';
import { BaseNode, NodeResolver } from 'compute-nodes';


interface OwnProps extends NumberInputNode {
    name: string;
    resolver: NodeResolver;
}

interface DispatchProps {
    setPinData(pinId: string, data: any): void;
    updateNode(nodeId: string, ...changes: any): void;
}

type Props = DispatchProps & OwnProps;


export class NumberInputGraphNode extends Component<Props> {

    inputRef: any;

    constructor(props: Props) {
        super(props);

        this.inputRef = React.createRef();
        this.onBlur = this.onBlur.bind(this);
        this.onChange = this.onChange.bind(this);
    }

    onBlur(event: any) {
        this.props.resolver.updateNode(this.props.id,
            { data: { ...this.props.data, value: this.props.data.value } },
            { invalidateOutput: true });
    }

    onChange(ev: any) {
        this.props.resolver.updateNode(this.props.id,
            { data: { ...this.props.data, value: ev.target.value } },
            { invalidateOutput: true })
    }

    render() {
        return (<BaseNode title="Number Input" {...this.props}
            output={NumberInputNode.OutputFormat} >
            <Form.Group>
                <Form.Control size="lg" type="text" onBlur={this.onBlur}
                    style={{
                        padding: "5px",
                        height: "2em",
                    }}
                    placeholder={"" + this.props.data.value} ref={this.inputRef}
                    value={this.props.data.value} onChange={this.onChange}
                    onKeyPress={(event: any) => {
                        if (event.key === "Enter") {
                            this.onBlur({});
                        }
                    }} />
            </Form.Group>
        </BaseNode>);
    }
}