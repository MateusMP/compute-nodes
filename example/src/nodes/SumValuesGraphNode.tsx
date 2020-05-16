import React, { Component } from 'react';
import SumValuesNode, { DataFormat } from './SumValuesNode';
import { AutoBaseNode } from 'node-machine';

interface OwnProps extends SumValuesNode {
    output: {
        sum: string
    }
}

interface StateProps {
    data: DataFormat
}
interface DispatchProps {
}

type Props = OwnProps & StateProps & DispatchProps;

export default class SumValuesGraphNode extends Component<Props> {
    render() {
        return (<AutoBaseNode title={"Sum Values"} {...this.props} minWidth="200px"
            input={SumValuesNode.InputFormat} output={SumValuesNode.OutputFormat}>
            <span className="node-nodrag">{'' + this.props.output.sum}</span>
        </AutoBaseNode>);
    }
}