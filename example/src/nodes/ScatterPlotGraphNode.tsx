import React, { Component } from 'react';

import { resolveInputPinsToData, InputFormat } from './BaseNode';
import { Row } from 'react-bootstrap';

import ScatterPlotNode from '../../nodes/ScatterPlotNode';
import ScatterPlot from '../../visualizations/ScatterPlot';
import { connect } from 'react-redux';
import AutoBaseNode from './AutoBaseNode';

interface OwnProps {

}
interface StateProps {
    data: any;
    inputFormat: InputFormat;
}

const mapStateToProps = (state: any, ownProps: ScatterPlotNode) => {
    return {
        inputFormat: ScatterPlotNode.InputFormat,
        data: resolveInputPinsToData(state, ownProps, ScatterPlotNode.InputFormat),
    }
};

type Props = OwnProps & StateProps & ScatterPlotNode;

class ScatterPlotGraphNode extends Component<Props> {

    svg: React.RefObject<SVGSVGElement>;
    graph: any;

    constructor(props: Props) {
        super(props);

        this.svg = React.createRef();
        this.state = {

        };
    }

    updateGraph(x: Number[] | undefined, y: Number[] | undefined) {
        if (!!!this.svg.current) { // !!!this.props.instance.data ||
            return null;
        }
        const svg: SVGSVGElement = this.svg.current;

        if (!!!x || !!!y) {
            return null;
        }

        console.assert(x.length === y.length);

        const useData = x.map((value: any, i: number) => {
            return { x: value, y: y[i] }
        });

        const rect = { width: 100, height: 70 };//svg.getBoundingClientRect();
        this.graph.update(svg, useData, rect);
    }

    componentDidMount() {
        // After mounting, we can play with D3 and SVG
        this.graph = ScatterPlot();
        this.updateGraph(this.props.data.X, this.props.data.Y);
    }

    componentDidUpdate(prevProps: any) {
        if (this.props.data.X !== prevProps.data.X || prevProps.data.Y !== this.props.data.Y) {
            this.updateGraph(this.props.data.X, this.props.data.Y);
        }
    }

    render() {
        return (<AutoBaseNode title="Scatter Plot" minWidth="400px" {...this.props}>
            <Row>
                <svg ref={this.svg} width="95%" height="100%" viewBox="0,0,100, 70" className="node-nodrag">
                </svg>
            </Row>
        </AutoBaseNode>);
    }
}

export default connect(mapStateToProps, null)(ScatterPlotGraphNode);