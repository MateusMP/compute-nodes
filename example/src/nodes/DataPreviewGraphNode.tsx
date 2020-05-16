import React, { Component } from 'react';

import { AutoBaseNode } from 'node-machine';

import DataPreviewNode from './nodes/DataPreviewNode';
import { Row, Col } from 'react-bootstrap';


interface OwnProps extends DataPreviewNode {
    data
}

export default class DataPreviewGraphNode extends Component<OwnProps> {

    mapArray(array: any[]) {
        const maxRows = 30;
        let more: any = null;

        if (array.length > maxRows) {
            more = <Row><Col>{array.length - maxRows} more rows...</Col></Row>
            array = array.slice(0, maxRows);
        }

        const entries = array.map((d, i) => {
            return (
                <Row key={i}>
                    {this.getView(d)}
                </Row>);
        });

        return <>
            {entries}
            {more}
        </>;
    }

    getView(data: any) {
        const datatype = typeof data;
        switch (datatype) {
            case 'object':
                if (Array.isArray(data)) {
                    return this.mapArray(data);
                } else {
                    Object.keys(data).map(key => {
                        return (
                            <Col>{data[key]}</Col>
                        );
                    });
                }
            case 'string':
            case 'number':
                return <Col>{data}</Col>
            case 'undefined':
                return "No data";
            default:
                console.warn("unhandled type: " + datatype);
                return <span>{'' + data}</span>
        }
    }

    componentDidUpdate(prevProps: OwnProps) {
        if (this.props.data.A !== prevProps.data.A) {

        }
    }

    render() {
        return (<AutoBaseNode {...this.props}
            title="Data Preview" minWidth="200px">
            <div className="node-nodrag gn-data-preview container"
                style={{
                    maxHeight: "100px"
                }}>
                {this.getView(this.props.data.A)}
            </div>
        </AutoBaseNode>);
    }
}