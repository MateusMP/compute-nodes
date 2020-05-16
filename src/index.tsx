import * as React from 'react'
import styles from './styles.module.css'
import CanvasNode from './nodes/CanvasNode'
import Canvas from './components/Canvas'
import { NodeResolver } from './adapters/NodeResolver'
import { NodeRegistry, NodeTypeDefinition } from './adapters/NodeRegistry'
import BaseNode from './components/BaseNode'
import AutoBaseNode from './components/AutoBaseNode'


interface Props {
  text: string
}

export const ExampleComponent = ({ text }: Props) => {
  return <div className={styles.test}>Example Component: {text}</div>
}

export {
  Canvas, CanvasNode, NodeResolver, NodeRegistry, NodeTypeDefinition,
  BaseNode, AutoBaseNode
};