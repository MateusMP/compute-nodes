import React from 'react';
import { Row, Col, Container, Form, Button } from 'react-bootstrap';

import { Canvas, ItemTypes } from 'node-machine';

import { useDrag } from 'react-dnd'

import InputVariableNode from './nodes/InputVariableNode';
import DataPreviewNode from './nodes/DataPreviewNode';
import SumValuesNode from './nodes/SumValuesNode';
import ScatterPlotNode from './nodes/ScatterPlotNode';
import SumValuesGraphNode from './nodes/SumValuesGraphNode';
import { LocalNodeRegistry, LocalNodeResolver } from './resolver/LocalNodeResolver';

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

        this.nodeRegistry.registerType(SumValuesNode, {
            name: 'Sum Values',
            userCreatable: true,
            render: (args: any) => { return <SumValuesGraphNode {...args} /> }
        });

        this.nodeRegistry.registerType(InputVariableNode);
        this.nodeRegistry.registerType(DataPreviewNode);
        this.nodeRegistry.registerType(ScatterPlotNode);
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

                    {Object.entries(this.nodeRegistry.nodeTypes).filter(([t, info]) => info.userCreatable).map(([type, info]) => {
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