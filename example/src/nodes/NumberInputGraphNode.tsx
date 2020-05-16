import React, { Component } from 'react';

import { Form } from 'react-bootstrap';


import InputVariableNode from '../nodes/InputVariableNode';
import { generatePinId, AutoBaseNode } from 'node-machine';


interface OwnProps extends InputVariableNode {
    name: string;
}

interface DispatchProps {
    setPinData(pinId: string, data: any): void;
    updateNode(nodeId: string, ...changes: any): void;
}

type Props = DispatchProps & OwnProps;


class NumberInputGraphNode extends Component<Props> {

    inputRef: any;

    constructor(props: Props) {
        super(props);

        this.inputRef = React.createRef();
        this.onBlur = this.onBlur.bind(this);
        this.onChange = this.onChange.bind(this);
    }

    onBlur(event: any) {
        const pinId = generatePinId(this.props.id, InputVariableNode.outValue);
        this.props.setPinData(pinId, +this.inputRef.current.value);
        this.props.updateNode(this.props.id, { value: this.props.data.value });
    }

    onChange(ev: any) {
        this.props.updateNode(this.props.id, { value: ev.target.value })
    }

    render() {
        return (<AutoBaseNode title="Number Input" {...this.props} output={InputVariableNode.OutputFormat} mdOut={3}>
            <Form.Group>
                <Form.Control size="lg" type="text" onBlur={this.onBlur}
                    placeholder={"" + this.props.data.value} ref={this.inputRef}
                    value={this.props.data.value} onChange={this.onChange}
                    onKeyPress={(event: any) => {
                        if (event.key === "Enter") {
                            this.onBlur({});
                        }
                    }} />
            </Form.Group>
        </AutoBaseNode>);
    }
}

export default connect(null, mapDispatchToProps)(NumberInputGraphNode);