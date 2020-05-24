import React, { Component } from 'react';

import { BaseNode } from 'compute-nodes';
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

    graph: any;

    constructor(props: Props) {
        super(props);

        this.state = {

        };
    }

    buildgraph(x: number[] | undefined, y: number[] | undefined) {
        if (!!!x || !!!y) {
            return null;
        }

        console.assert(x.length === y.length);

        const useData: DataEntry[] = x.map((value: any, i: number) => {
            return { x: value, y: y[i] }
        });

        const area = { width: 100, height: 100 };//svg.getBoundingClientRect();

        const elemSize = 5;
        const scaleX = d3.scaleLinear().range([0 + elemSize, area.width - elemSize]).domain(d3.extent(useData, (d: DataEntry) => d.x) as [number, number]);
        const scaleY = d3.scaleLinear().range([area.height - elemSize, 0 + elemSize]).domain(d3.extent(useData, (d: DataEntry) => d.y) as [number, number]);

        return useData.map((xy: DataEntry, i) => {
            return <circle key={i} cx={scaleX(xy.x)} cy={scaleY(xy.y)} r={2} fill={"red"}></circle>
        });
    }

    render() {
        return (<BaseNode title="Scatter Plot" {...this.props}
            input={ScatterPlotNode.InputFormat} output={ScatterPlotNode.OutputFormat}>
            <div>
                <svg width={this.props.width-65} height={this.props.height-70} viewBox="0,0, 100,100" className="node-noglobals">
                    {this.buildgraph(this.props.resolvedData.x, this.props.resolvedData.y)}
                </svg>
            </div>
        </BaseNode>);
    }
}