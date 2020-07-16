import React, { Component } from 'react';
import SumValuesNode from '../SumValuesNode';
import { BaseNode, NodeResolver } from 'compute-nodes';
import { DropdownButton, Dropdown } from 'react-bootstrap';

interface OwnProps extends SumValuesNode {
    resolvedData: {
        sum: string
    }
    resolver: NodeResolver
    data: any
}

interface DispatchProps {
}

type Props = OwnProps & DispatchProps;

export default class SumValuesGraphNode extends Component<Props> {
    render() {
        return (<BaseNode title={"Sum Values"} {...this.props}
            input={SumValuesNode.InputFormat} output={SumValuesNode.OutputFormat}>
            <div>
                <DropdownButton id="dropdown-basic-button" title={"Operation: " + this.props.data?.op} className="gn-node-dropdown">
                    <Dropdown.Item as="button" onClick={() => this.props.resolver.updateNode(this.props.id, { data: { op: "+" } }, { invalidateOutput: true })}>Sum</Dropdown.Item>
                    <Dropdown.Item as="button" onClick={() => this.props.resolver.updateNode(this.props.id, { data: { op: "-" } }, { invalidateOutput: true })}>Subtract</Dropdown.Item>
                    <Dropdown.Item as="button" onClick={() => this.props.resolver.updateNode(this.props.id, { data: { op: "*" } }, { invalidateOutput: true })}>Multiply</Dropdown.Item>
                    <Dropdown.Item as="button" onClick={() => this.props.resolver.updateNode(this.props.id, { data: { op: "/" } }, { invalidateOutput: true })}>Divide</Dropdown.Item>
                    <Dropdown.Item as="button" onClick={() => this.props.resolver.updateNode(this.props.id, { data: { op: "pow" } }, { invalidateOutput: true })}>Power</Dropdown.Item>
                </DropdownButton>
            </div>
            <div style={{ overflow: "auto" }}>
                <span className="node-noglobals">{'' + this.props.resolvedData.sum}</span>
            </div>
        </BaseNode>);
    }
}