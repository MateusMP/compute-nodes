import React, { Component } from 'react';
import SumValuesNode, { DataFormat } from '../SumValuesNode';
import { AutoBaseNode } from 'compute-nodes';

interface OwnProps extends SumValuesNode {
    resolvedData: {
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
        return (<AutoBaseNode title={"Sum Values"} {...this.props} minWidth={200}
            input={SumValuesNode.InputFormat} output={SumValuesNode.OutputFormat}>
            <span className="node-noglobals">{'' + this.props.resolvedData.sum}</span>
        </AutoBaseNode>);
    }
}