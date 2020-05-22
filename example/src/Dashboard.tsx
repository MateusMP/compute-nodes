import React from 'react';
import { Row, Col, Container, Form, Button } from 'react-bootstrap';

import { Canvas, ItemTypes } from 'compute-nodes';

import { useDrag } from 'react-dnd'

import NumberInputNode from './nodes/NumberInputNode';
import SumValuesNode from './nodes/SumValuesNode';
import ScatterPlotNode from './nodes/ScatterPlotNode';
import SumValuesGraphNode from './nodes/components/SumValuesGraphNode';
import { LocalNodeRegistry, LocalNodeResolver } from './resolver/LocalNodeResolver';
import { DataPreviewNode } from './nodes/DataPreviewNode';
import { ScatterPlotGraphNode } from './nodes/components/ScatterPlotGraphNode';
import { DataPreviewGraphNode } from './nodes/components/DataPreviewGraphNode';
import { NumberInputGraphNode } from './nodes/components/NumberInputGraphNode';
import { RandomDataGraphNode } from './nodes/components/RandomDataGraphNode';

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
            Render: (args: any) => { return <SumValuesGraphNode {...args} /> }
        });

        this.nodeRegistry.registerType({
            ...NumberInputNode,
            Render: (args: any) => { return <NumberInputGraphNode {...args} /> }
        });
        this.nodeRegistry.registerType({
            ...DataPreviewNode,
            Render: (args: any) => { return <DataPreviewGraphNode {...args} /> }
        });
        this.nodeRegistry.registerType({
            ...ScatterPlotNode,
            Render: (args: any) => { return <ScatterPlotGraphNode {...args} /> }
        });
        this.nodeRegistry.registerType({
            ...RandomDataGraphNode,
        });

        this.resolver = new LocalNodeResolver(this.nodeRegistry);
        this.resolver.restoreNodes({"mcigvwtfxcshljkheagh0mbme":{"id":"mcigvwtfxcshljkheagh0mbme","type":"SumNumbers","x":672,"y":240,"inputPins":{"b":"ujgwntjulmnmnmofeagh0me75-value","a":"pzyqdeoqxhpymmdheagh1m3gn-sum"}},"ujgwntjulmnmnmofeagh0me75":{"id":"ujgwntjulmnmnmofeagh0me75","type":"InputVariable","x":160,"y":272,"inputPins":{},"data":{"value":"2","name":""}},"pzyqdeoqxhpymmdheagh1m3gn":{"id":"pzyqdeoqxhpymmdheagh1m3gn","type":"SumNumbers","x":400,"y":176,"inputPins":{"a":"ujgwntjulmnmnmofeagh0me75-value","b":"ujgwntjulmnmnmofeagh0me75-value"}}})
    }

    render() {

        return <Container fluid>
            <Row>
                <Col md={1.5} style={{ paddingTop: '10px', paddingLeft: '15px' }}>
                    <Button onClick={(e:any) => navigator.clipboard.writeText(JSON.stringify(this.resolver.getNodes()))}>Save</Button>
                    <Form.Group>
                        <Form.Control size="lg" type="text" placeholder="Input name">
                        </Form.Control>
                        <Form.Control size="lg" type="text" placeholder="Large text" />
                    </Form.Group>

                    {Object.entries(this.nodeRegistry.nodeTypes).map(([type, info]) => {
                        return <VisualNodeOption key={type} name={info.Name} details={{ nodeType: type }} />;
                    })}
                </Col>
                <Col md>
                    <Canvas resolver={this.resolver} />
                </Col>
            </Row>
        </Container>;
    }

}