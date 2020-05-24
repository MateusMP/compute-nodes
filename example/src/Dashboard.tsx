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
        this.resolver.restoreNodes({"wauhumvtystyqxiueahna1age":{"id":"wauhumvtystyqxiueahna1age","type":"SumNumbers","x":304,"y":224,"width":160,"height":96,"inputPins":{"a":"djnqvixdjmbsngbieahna1ecl-value","b":"djnqvixdjmbsngbieahna1ecl-value"}},"djnqvixdjmbsngbieahna1ecl":{"id":"djnqvixdjmbsngbieahna1ecl","type":"InputVariable","x":48,"y":272,"width":160,"height":96,"inputPins":{},"data":{"value":"5","name":""}},"idgbhdxfmjishsdleahna2cad":{"id":"idgbhdxfmjishsdleahna2cad","type":"RandomDataGraphNode","x":64,"y":432,"width":160,"height":96,"inputPins":{},"data":[31.282189925582372,46.99434219410386,94.58315855046233,33.02015792920737,79.77739779327935,57.635284080052216,83.41473565069857,17.92231213873081,28.13342761487998,59.561880695072745,23.76663753351156,45.410917004277806,14.811784417861018,50.10356596638913,82.67726938699712,56.385279045157446,81.30064546055607,22.046422021768997,45.811501131691834,32.430542232417714,61.17682186180193,32.396368872220414,97.7127769497109,28.66944306277597,89.00150013110391,42.92725261751901,50.464348913584935,12.421436967230793,20.77629929518048,24.69548892021367,73.09294854626516,21.259119702203677,4.212106685632156,99.2654328584125,82.98016864480475,62.17438761090671,97.92497908653658,70.37667902658355,85.33277703182283,88.37131910560873,93.77428504023719,50.22260763667769,38.293675048678274,43.90742701202287,75.37905781514954,25.20078999283659,16.15293691318309,38.600850630572644,64.87195638337802,27.47300909310916,50.74617436047599,18.510643692361896,56.1846166539526,67.76984372613838,38.359754895042386,16.665436289599022,25.254112630200186,97.00472603628536,21.491907374780627,54.87106850450382,37.493809323865314,23.7429330868737,66.97084830771574,50.11287932575467,89.78921648577423,38.82723951166427,88.18349130162322,56.29246363894873,14.897376572049325,24.09984280324111,62.36629435076897,72.6425204667753,9.50190935306967,15.416524521934239,45.65284793197868,10.655792993061475,31.947511972461086,14.744408760898864,37.34750898624471,82.08590968733239,57.75456723891925,43.79698740032134,61.197508784377064,82.38972289332433,9.123467006194751,37.31861744444163,64.60260398645013,82.78478238116621,32.44647236944333,36.490295729673406,42.830794586341504,94.29772139862771,4.476792987810896,81.28987890668955,40.08146503161101,37.659378616139186,73.83081161446496,19.211193525637228,8.277408222656568,10.552725262475416]},"oeyyyrfcurccpwpheahna2gbm":{"id":"oeyyyrfcurccpwpheahna2gbm","type":"ScatterPlotGraph","x":464,"y":368,"width":384,"height":288,"inputPins":{"x":"idgbhdxfmjishsdleahna2cad-data","y":"idgbhdxfmjishsdleahna2cad-data"}},"vmakunxfoiksawoweahna31ll":{"id":"vmakunxfoiksawoweahna31ll","type":"DataPreview","x":176,"y":608,"width":256,"height":240,"inputPins":{"a":"idgbhdxfmjishsdleahna2cad-data"}},"fhdcppzpelrkxocgeahna3n05":{"id":"fhdcppzpelrkxocgeahna3n05","type":"SumNumbers","x":592,"y":192,"width":160,"height":96,"inputPins":{"a":"wauhumvtystyqxiueahna1age-sum","b":"wauhumvtystyqxiueahna1age-sum"}}})
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