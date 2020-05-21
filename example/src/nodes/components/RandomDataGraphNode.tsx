import React, { Component } from 'react';

import { Form, Button } from 'react-bootstrap';
import { AutoBaseNode, NodeResolver, CanvasNode } from 'compute-nodes';


interface OwnProps extends CanvasNode {
    resolver: NodeResolver;
}

export class RandomDataGraphNode extends Component<OwnProps> {

    static Type = "RandomDataGraphNode";
    static InputFormat = undefined;
    static OutputFormat = {
        data: {
            "type": "any"
        }
    }
    static Construct = (props: any) => new CanvasNode(props)
    static LocalResolve = (node: any, input: any) => { return { data: node.data } }
    static Render = (props: any) => <RandomDataGraphNode {...props} />

    //

    constructor(props: OwnProps) {
        super(props);

        this.onChange = this.onChange.bind(this);
    }

    onChange(ev: any) {
        let randData = this.generateRandomData();
        this.props.resolver.updateNode(this.props.id, { data: randData })
    }

    generateRandomData() {
        let randData = [];
        for (let i = 0; i < 100; ++i) {
            randData.push(Math.random() * 100);
        }
        return randData;
    }

    render() {
        return (<AutoBaseNode title="Random Data" mdOut={3} {...this.props}
            output={RandomDataGraphNode.OutputFormat} >
            <Form.Group>
                <Button onClick={this.onChange}>Generate</Button>
            </Form.Group>
        </AutoBaseNode>);
    }
}