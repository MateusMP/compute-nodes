import React from 'react';
import { Row, Col, Container, Form, Button } from 'react-bootstrap';

import { Canvas, ItemTypes } from 'node-machine';

import { useDrag } from 'react-dnd'

import NumberInputNode from './nodes/NumberInputNode';
import SumValuesNode from './nodes/SumValuesNode';
import ScatterPlotNode from './nodes/ScatterPlotNode';
import SumValuesGraphNode from './nodes/components/SumValuesGraphNode';
import { LocalNodeRegistry, LocalNodeResolver } from './resolver/LocalNodeResolver';
import { DataPreviewNode } from './nodes/DataPreviewNode';
import { ScatterPlotGraphNode } from './nodes/components/ScatterPlotGraphNode';
import DataPreviewGraphNode from './nodes/components/DataPreviewGraphNode';
import { NumberInputGraphNode } from './nodes/components/NumberInputGraphNode';

interface DashboardProps {
    columns: any[],
}

interface DashboardState {
    filter: string;
}

function VisualNodeOption({ name, details }: any) {
    const [, dragRef] = useDrag({
        item: { ...details, type: ItemTypes.VISUAL_NODE },
        collect: monitor => ({}),
    });

    return (
        <div ref={dragRef}>{name}</div>
    );
}

export class Dashboard extends React.Component<DashboardProps, DashboardState> {
    nodeRegistry: LocalNodeRegistry;
    resolver: LocalNodeResolver;

    constructor(props: any) {
        super(props);

        this.state = {
            filter: "",
        };

        this.nodeRegistry = new LocalNodeRegistry();

        this.nodeRegistry.registerType({
            ...SumValuesNode,
            name: 'Sum Values',
            Render: (args: any) => { return <SumValuesGraphNode {...args} /> }
        });

        this.nodeRegistry.registerType({
            ...NumberInputNode,
            name: 'Input Value',
            Render: (args: any) => { return <NumberInputGraphNode {...args} /> }
        });
        this.nodeRegistry.registerType({
            ...DataPreviewNode,
            name: 'Data Preview',
            Render: (args: any) => { return <DataPreviewGraphNode {...args} /> }
        });
        this.nodeRegistry.registerType({
            ...ScatterPlotNode,
            name: 'Scatter Plot',
            Render: (args: any) => { return <ScatterPlotGraphNode {...args} /> }
        });

        this.resolver = new LocalNodeResolver(this.nodeRegistry);
    }

    render() {

        return <Container fluid>
            <Row>
                <Col md={1.5} style={{ paddingTop: '10px', paddingLeft: '15px' }}>
                    <Form.Group>
                        <Form.Control size="lg" type="text" placeholder="Input name">
                        </Form.Control>
                        <Form.Control size="lg" type="text" placeholder="Large text" />
                    </Form.Group>

                    {Object.entries(this.nodeRegistry.nodeTypes).map(([type, info]) => {
                        return <VisualNodeOption key={type} name={info.name} details={{ nodeType: type }} />;
                    })}
                </Col>
                <Col md>
                    <Canvas resolver={this.resolver} />
                </Col>
            </Row>
        </Container>;
    }

}