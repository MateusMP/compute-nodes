import React, { Component } from 'react';

import { Form, Button } from 'react-bootstrap';
import { BaseNode, NodeResolver, CanvasNode } from 'compute-nodes';


interface OwnProps extends CanvasNode {
    resolver: NodeResolver;
}

/**
 * Example single class definition
 */
export class RandomDataGraphNode extends Component<OwnProps> {

    static Type = "RandomDataGraphNode";
    static Name = "Random Data";
    static InputFormat = undefined;
    static MinDimensions = {
        height: 14 * 8,
    }
    static OutputFormat = {
        data: {
            "type": "number[]"
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
        this.props.resolver.updateNode(this.props.id, { data: randData }, { invalidateOutput: true })
    }

    generateRandomData() {
        let randData = [];
        for (let i = 0; i < 100; ++i) {
            randData.push(Math.floor(Math.random() * 100));
        }
        return randData;
    }

    render() {
        return (<BaseNode title="Random Data" {...this.props}
            output={RandomDataGraphNode.OutputFormat} >
            <Button onClick={this.onChange}>Generate</Button>
        </BaseNode>);
    }
}