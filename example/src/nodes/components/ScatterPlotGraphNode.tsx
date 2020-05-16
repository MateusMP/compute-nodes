import React, { Component } from 'react';

import { Row } from 'react-bootstrap';

import { AutoBaseNode, InputFormat, BaseNodeProps } from 'node-machine';
import ScatterPlotNode from '../ScatterPlotNode';

import * as d3 from 'd3';


interface DataEntry {
    x: number;
    y: number;
}
interface OwnProps {
    resolvedData: { x: number[], y: number[] }
}

type Props = OwnProps & ScatterPlotNode;

export class ScatterPlotGraphNode extends Component<Props> {

    svg: React.RefObject<SVGSVGElement>;
    graph: any;

    constructor(props: Props) {
        super(props);

        this.svg = React.createRef();
        this.state = {

        };
    }

    buildgraph(x: number[] | undefined, y: number[] | undefined) {
        if (!!!this.svg.current) { // !!!this.props.instance.data ||
            return null;
        }
        const svg: SVGSVGElement = this.svg.current;

        if (!!!x || !!!y) {
            return null;
        }

        console.assert(x.length === y.length);

        const useData: DataEntry[] = x.map((value: any, i: number) => {
            return { x: value, y: y[i] }
        });

        const area = { width: 100, height: 70 };//svg.getBoundingClientRect();

        const elemSize = 5;
        const scaleX = d3.scaleLinear().range([0 + elemSize, area.width - elemSize]).domain(d3.extent(useData, (d: DataEntry) => d.x) as [number, number]);
        const scaleY = d3.scaleLinear().range([area.height - elemSize, 0 + elemSize]).domain(d3.extent(useData, (d: DataEntry) => d.y) as [number, number]);

        return useData.map((xy: DataEntry) => {
            return <circle cx={scaleX(xy.x)} cy={scaleY(xy.y)} radius={3} fill={"red"}></circle>
        });
    }

    render() {
        return (<AutoBaseNode title="Scatter Plot" minWidth="400px" {...this.props}
            input={ScatterPlotNode.InputFormat} output={ScatterPlotNode.OutputFormat}>
            <Row>
                <svg ref={this.svg} width="95%" height="100%" viewBox="0,0,100, 70" className="node-nodrag">
                    {this.buildgraph(this.props.resolvedData.x, this.props.resolvedData.y)}
                </svg>
            </Row>
        </AutoBaseNode>);
    }
}