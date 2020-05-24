import React, { Component } from 'react';
import SumValuesNode, { DataFormat } from '../SumValuesNode';
import { BaseNode } from 'compute-nodes';

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
        return (<BaseNode title={"Sum Values"} {...this.props} 
            minHeight={SumValuesNode.MinDimensions.height}
            input={SumValuesNode.InputFormat} output={SumValuesNode.OutputFormat}>
            <span className="node-noglobals">{'' + this.props.resolvedData.sum}</span>
        </BaseNode>);
    }
}