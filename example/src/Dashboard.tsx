import React from 'react';
import { Row, Col, Container, Button } from 'react-bootstrap';

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
    canvas: any;

    constructor(props: any) {
        super(props);

        this.state = {
            filter: "",
        };

        this.canvas = React.createRef()

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
        this.resolver.restoreNodes({"wauhumvtystyqxiueahna1age":{"id":"wauhumvtystyqxiueahna1age","type":"SumNumbers","x":288,"y":112,"width":288,"height":144,"inputPins":{"a":"djnqvixdjmbsngbieahna1ecl-value","b":"djnqvixdjmbsngbieahna1ecl-value"},"data":{"op":"+"}},"djnqvixdjmbsngbieahna1ecl":{"id":"djnqvixdjmbsngbieahna1ecl","type":"InputVariable","x":0,"y":256,"width":160,"height":112,"inputPins":{},"data":{"value":"10","name":""}},"idgbhdxfmjishsdleahna2cad":{"id":"idgbhdxfmjishsdleahna2cad","type":"RandomDataGraphNode","x":144,"y":752,"width":160,"height":112,"inputPins":{},"data":[12,89,82,7,13,14,6,9,58,3,30,73,44,26,94,78,39,32,97,94,47,57,50,95,88,94,94,80,33,0,59,7,91,96,89,26,68,5,16,51,46,2,86,81,89,91,20,73,57,73,37,80,9,28,79,72,49,54,0,39,27,17,17,68,51,0,2,42,57,1,63,91,84,94,62,88,72,44,1,71,50,3,13,0,58,11,22,69,92,12,48,28,68,62,64,38,86,96,21,88]},"oeyyyrfcurccpwpheahna2gbm":{"id":"oeyyyrfcurccpwpheahna2gbm","type":"ScatterPlotGraph","x":1136,"y":464,"width":384,"height":368,"inputPins":{"x":"cqdeflgstsexdqkveanak7404-sum","y":"yhofknaevtcoxethean9ji9de-sum"}},"vmakunxfoiksawoweahna31ll":{"id":"vmakunxfoiksawoweahna31ll","type":"DataPreview","x":432,"y":832,"width":192,"height":240,"inputPins":{"a":"idgbhdxfmjishsdleahna2cad-data"}},"fhdcppzpelrkxocgeahna3n05":{"id":"fhdcppzpelrkxocgeahna3n05","type":"SumNumbers","x":688,"y":96,"width":288,"height":144,"inputPins":{"a":"wauhumvtystyqxiueahna1age-sum","b":"wauhumvtystyqxiueahna1age-sum"},"data":{"op":"*"}},"yhofknaevtcoxethean9ji9de":{"id":"yhofknaevtcoxethean9ji9de","type":"SumNumbers","x":416,"y":576,"width":256,"height":224,"inputPins":{"a":"djnqvixdjmbsngbieahna1ecl-value","b":"idgbhdxfmjishsdleahna2cad-data"},"data":{"op":"-"}},"uguqlbyzpaiifdhrean9jmhem":{"id":"uguqlbyzpaiifdhrean9jmhem","type":"RandomDataGraphNode","x":528,"y":288,"width":160,"height":112,"inputPins":{},"data":[44,7,27,52,9,55,5,73,26,40,50,87,63,22,61,85,62,56,34,42,56,45,5,4,30,41,54,26,20,11,0,70,3,99,84,19,61,56,19,80,45,37,20,68,62,17,0,10,18,20,75,84,56,64,28,55,72,62,65,52,16,91,96,68,34,33,0,42,69,97,78,87,2,13,27,75,67,41,55,80,82,5,59,24,2,65,80,40,72,12,77,70,82,98,53,16,12,32,89,43]},"yqqexvbvxkggbsxceanak6lg5":{"id":"yqqexvbvxkggbsxceanak6lg5","type":"InputVariable","x":528,"y":416,"width":160,"height":112,"inputPins":{},"data":{"value":"4","name":""}},"cqdeflgstsexdqkveanak7404":{"id":"cqdeflgstsexdqkveanak7404","type":"SumNumbers","x":784,"y":288,"width":288,"height":144,"inputPins":{"b":"yqqexvbvxkggbsxceanak6lg5-value","a":"uguqlbyzpaiifdhrean9jmhem-data"},"data":{"op":"pow"}},"oqfmoleswjxeiamxeanaklk9b":{"id":"oqfmoleswjxeiamxeanaklk9b","type":"DataPreview","x":1168,"y":208,"width":208,"height":160,"inputPins":{"a":"cqdeflgstsexdqkveanak7404-sum"}}})
    }

    render() {

        return <Container fluid>
            <Row>
                <Col md={1.5} style={{ paddingTop: '10px', paddingLeft: '15px' }}>
                    <Row>
                        <Button style={{margin: "2px"}} onClick={(e: any) => navigator.clipboard.writeText(JSON.stringify(this.resolver.getNodes()))}>Save</Button>
                        <Button style={{margin: "2px"}} onClick={(e: any) => this.canvas.current.undoOnce()}>Undo</Button>
                        <Button style={{margin: "2px"}} onClick={(e: any) => this.canvas.current.redoOnce()}>Redo</Button>
                    </Row>

                    {Object.entries(this.nodeRegistry.nodeTypes).map(([type, info]) => {
                        return <VisualNodeOption key={type} name={info.Name} details={{ nodeType: type }} />;
                    })}
                </Col>
                <Col md>
                    <Canvas ref={this.canvas} resolver={this.resolver} />
                </Col>
            </Row>
        </Container>;
    }

}