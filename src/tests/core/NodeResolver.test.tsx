import React from 'react'
import { act } from 'react-dom/test-utils'
import { NodeResolver } from '../../core/NodeResolver'
import { CanvasNode } from '../../core/CanvasNode'
import { InputFormat, NodeRegistry } from '../../core/NodeRegistry'
import { buildPinId } from '../../core/utils'

class TestNodeResolver extends NodeResolver {
  resolvePinData(pinId: string) {
    throw new Error('Method not implemented.')
  }

  resolveNodeInputs(node: CanvasNode, inputFormat: InputFormat | undefined) {
    throw new Error('Method not implemented.')
  }

  resolveNodeOutputs(node: CanvasNode, inputData: any) {
    throw new Error('Method not implemented.')
  }
}

class In1Out1 extends CanvasNode {
  static Type = 'In1Out1'
  static InputFormat = { in: { type: 'any' } }
  static OutputFormat = { out: { type: 'any' } }
  static construct(args: any) {
    return new CanvasNode(args)
  }

  static render(args: any) {
    return <div />
  }
}

const nodeRegistry = new NodeRegistry<any>()
nodeRegistry.registerType(In1Out1)

let resolver: TestNodeResolver | null = null
beforeEach(() => {
  resolver = new TestNodeResolver(nodeRegistry)
})

afterEach(() => {})

it('sum node resolves', () => {
  let n1: any
  let n2: any
  act(() => {
    n1 = resolver!.createNode('In1Out1', {})
  })
  act(() => {
    n2 = resolver!.createNode('In1Out1', {})
  })
  expect(n1.id in resolver!.nodes).toBe(true)
  expect(n2.id in resolver!.nodes).toBe(true)
  expect(
    resolver!.createPinConnection(
      buildPinId(n1.id, 'out'),
      buildPinId(n2.id, 'out')
    ) !== false
  )
  expect(
    resolver!.createPinConnection(
      buildPinId(n1.id, 'out'),
      buildPinId(n1.id, 'out')
    ) === false
  )
})
