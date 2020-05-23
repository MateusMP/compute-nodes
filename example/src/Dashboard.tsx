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
        this.resolver.restoreNodes({ "mcigvwtfxcshljkheagh0mbme": { "id": "mcigvwtfxcshljkheagh0mbme", "type": "SumNumbers", "x": 720, "y": 640, "inputPins": { "b": "ujgwntjulmnmnmofeagh0me75-value", "a": "pzyqdeoqxhpymmdheagh1m3gn-sum" } }, "ujgwntjulmnmnmofeagh0me75": { "id": "ujgwntjulmnmnmofeagh0me75", "type": "InputVariable", "x": 64, "y": 672, "inputPins": {}, "data": { "value": "2", "name": "" } }, "pzyqdeoqxhpymmdheagh1m3gn": { "id": "pzyqdeoqxhpymmdheagh1m3gn", "type": "SumNumbers", "x": 352, "y": 560, "inputPins": { "a": "ujgwntjulmnmnmofeagh0me75-value", "b": "ujgwntjulmnmnmofeagh0me75-value" } }, "dtjuzyacjmwfqqoveagnm8n3n": { "id": "dtjuzyacjmwfqqoveagnm8n3n", "type": "RandomDataGraphNode", "x": 64, "y": 256, "inputPins": {}, "data": [86.88946219689568, 25.04436078576169, 50.879370852296255, 99.423073618451, 51.74650859976585, 56.10462584221266, 14.627442649956912, 20.002659316042337, 87.60569006840839, 24.732505781844505, 94.97472388403058, 71.57160181803151, 28.689400427348332, 75.41174471374299, 63.86297349129519, 49.138200929528374, 35.8526220494508, 79.48698099097471, 40.92965015436133, 81.9719189106291, 38.422650844444505, 61.48809128098204, 79.54769965050365, 74.8868801801337, 26.845397040680574, 82.91296371815127, 18.88965492076238, 84.73339742941934, 48.613306166798, 7.461679859884674, 40.64363446159389, 89.19881631168826, 27.876572367618135, 35.17030149126774, 19.94553629247503, 62.482695571054315, 31.784983804276777, 3.8516229244170086, 40.3598551871693, 68.72827527484529, 11.407818414055592, 2.085790412306965, 74.3879990350619, 44.50583288315946, 8.569839657191347, 45.686387659369935, 9.68807997515001, 66.70187521477449, 60.331234575212264, 83.75039605266016, 46.42525653117522, 13.688197042449723, 47.2719320314976, 12.497234277204427, 57.07324925054491, 44.82991314630432, 78.78535819542982, 14.569929475668342, 22.128458953192354, 38.590410431640564, 73.29777886999682, 59.06090794066411, 20.43843417099729, 92.41942979602072, 59.66085802675377, 73.06073072690921, 53.238560150879124, 12.298129243532541, 73.62072651169487, 47.8763867287545, 40.14208485656172, 33.379263382636815, 57.48298812346051, 81.20706629618459, 30.97465234863047, 90.89781087249106, 44.31273525306552, 56.536398415346255, 46.38772043670731, 68.09001317925434, 26.104065204936244, 29.140537796673716, 77.32757787380591, 97.98347675887807, 83.34345138690328, 61.740511830720465, 35.17240695433516, 49.94842629457729, 78.99173838507888, 97.83054348756632, 91.38949533383942, 18.89642239969015, 75.8155020258466, 25.20185020211153, 73.02718767312874, 11.986042815362474, 91.53408306815368, 83.57604824127068, 34.42714466476499, 49.36882111427799] }, "wtpzopjcdjhotdyheagnm93bm": { "id": "wtpzopjcdjhotdyheagnm93bm", "type": "DataPreview", "x": 368, "y": 336, "inputPins": { "a": "dtjuzyacjmwfqqoveagnm8n3n-data" } }, "occbnintzebtrupxeagnm9gmn": { "id": "occbnintzebtrupxeagnm9gmn", "type": "RandomDataGraphNode", "x": 192, "y": 80, "inputPins": {}, "data": [13.104615313663992, 25.124152149680768, 80.77802837212855, 17.15254029494392, 70.20397283960453, 15.391426460796042, 3.746514663826739, 57.571161372916926, 14.732041626101877, 54.62991166547181, 63.11444436668776, 22.14945296360451, 41.74861604189704, 96.78914590753178, 80.41330662875156, 93.6182378420011, 92.07560420947279, 97.50721165804275, 56.45126220015704, 82.7909430476138, 66.50841786805344, 13.675308943069997, 99.26707966433453, 78.87709836203497, 97.5632861314542, 58.77180036392807, 98.45797830712824, 82.6447460022283, 49.39783183904497, 88.3480252367344, 86.71997052492749, 47.03053923184067, 23.006900737744473, 12.283992570130653, 61.8465353668814, 48.01165040992681, 41.328659539910475, 9.57728328363685, 41.92051065337419, 56.63953846627611, 45.03985577763816, 97.36894615327994, 45.662990156286575, 25.33111433894747, 5.684353080069959, 94.43527180247455, 4.353709667098194, 24.826683425609165, 6.329102894789185, 53.33618069950413, 83.5419466517431, 42.43923875579828, 0.6955470043758294, 95.5736406901432, 24.02840864272934, 22.191192379348646, 2.6345615045770376, 63.58195109688756, 58.41176386912448, 58.831308517189115, 91.10197133702705, 18.836950531991036, 62.39891528196691, 48.20424340362122, 52.41929883338624, 5.0092055697536715, 3.134551436095101, 36.12234513020754, 12.91106461903988, 82.68463659975708, 10.046936855738819, 30.525906816083104, 68.25405320204428, 59.0751410977957, 87.01817926315759, 51.58821584673511, 65.65461843328896, 87.47071306199993, 89.43619851112543, 24.662622110476594, 76.9375069734115, 20.66574324606554, 4.451732010652654, 3.4851192048604984, 58.429221919817685, 52.91070250032319, 61.79034531489243, 67.76566276463608, 39.284460757234655, 39.66498794199923, 71.3504429311866, 90.05577493370318, 10.622236810268337, 26.657774595032503, 34.70151897142401, 30.612964891633787, 11.47171574154331, 44.06888598458987, 94.65733532773257, 41.948853034624136] }, "lgugpnpkcbbimonneagnm9jdn": { "id": "lgugpnpkcbbimonneagnm9jdn", "type": "ScatterPlotGraph", "x": 656, "y": 80, "inputPins": { "x": "occbnintzebtrupxeagnm9gmn-data", "y": "dtjuzyacjmwfqqoveagnm8n3n-data" } } })
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