import React from 'react';
import { Row, Col, Container, Form, Button } from 'react-bootstrap';

import { Canvas, CanvasNode } from 'node-machine';

import { useDrag } from 'react-dnd'

import { LocalNodeRegistry, LocalNodeDefinition, LocalNodeResolver } from './LocalNodeResolver';
import InputVariableNode from './nodes/InputVariableNode';
import DataPreviewNode from './nodes/DataPreviewNode';
import SumValuesNode from './nodes/SumValuesNode';
import ScatterPlotNode from './nodes/ScatterPlotNode';
import SumValuesGraphNode from './nodes/SumValuesGraphNode';

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

class Dashboard extends React.Component<DashboardProps, DashboardState> {
    nodeRegistry: LocalNodeRegistry;
    resolver: LocalNodeResolver;

    constructor(props: any) {
        super(props);

        this.state = {
            filter: "",
        };

        this.nodeRegistry = new RenderableNodeRegistry();

        this.nodeRegistry.registerType(SumValuesNode, {
            name: 'Sum Values',
            userCreatable: true,
            render: (args: any) => { return <SumValuesGraphNode {...args} /> }
        });

        this.nodeRegistry.registerType(InputVariableNode);
        this.nodeRegistry.registerType(DataPreviewNode);
        this.nodeRegistry.registerType(ScatterPlotNode);
        this.resolver = new RenderableNodeResolver(this.nodeRegistry);
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

export default Dashboard;