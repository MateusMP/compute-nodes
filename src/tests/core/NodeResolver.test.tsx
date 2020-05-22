import React from 'react'
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
  static Construct(args: any) {
    return new CanvasNode(args)
  }
  static Render(args: any) {
    return <div />
  }
}


class In3Out3 extends CanvasNode {
  static Type = 'In3Out3'
  static InputFormat = ['in1', 'in2', 'in3'].reduce((map: any, pinName: string) => {
    map[pinName] = { 'type': 'any' }
    return map;
  }, {});
  static OutputFormat = ['out1', 'out2', 'out3'].reduce((map: any, pinName: string) => {
    map[pinName] = { 'type': 'any' }
    return map;
  }, {});

  static Construct(args: any) {
    return new CanvasNode(args)
  }
  static Render(args: any) {
    return <div />
  }
}

const nodeRegistry = new NodeRegistry<any>()
nodeRegistry.registerType(In1Out1)
nodeRegistry.registerType(In3Out3)

let resolver: TestNodeResolver | null = null
beforeEach(() => {
  resolver = new TestNodeResolver(nodeRegistry)
})

afterEach(() => { })

it('Check cyclic connections', () => {
  let n1: CanvasNode
  let n2: CanvasNode
  n1 = resolver!.createNode('In1Out1', {})
  n2 = resolver!.createNode('In1Out1', {})
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

it('Create invalid connection', () => {
  let n1: CanvasNode
  let n2: CanvasNode
  n1 = resolver!.createNode('In1Out1', {})
  n2 = resolver!.createNode('In1Out1', {})
  expect(resolver!.createPinConnection(
      buildPinId(n1.id, 'out-bad'),
      buildPinId(n2.id, 'out-bad')
    ) !== false
  )
  expect(resolver!.createPinConnection(
      buildPinId(n1.id, 'out-bad'),
      buildPinId(n1.id, 'out')
    ) === false
  )
  expect(resolver!.createPinConnection(
    buildPinId(n1.id, 'out'),
    buildPinId(n1.id, 'out-bad')
  ) === false
)
})

it('Destroying node should destroy all outgoing connections', () => {
  let n1: CanvasNode
  let n2: CanvasNode

  n1 = resolver!.createNode('In3Out3', {})
  n2 = resolver!.createNode('In3Out3', {})
  expect(resolver!.createPinConnection(buildPinId(n1.id, 'out1'), buildPinId(n2.id, 'in1'))).toBeTruthy()
  expect(resolver!.createPinConnection(buildPinId(n1.id, 'out2'), buildPinId(n2.id, 'in2'))).toBeTruthy()
  expect(resolver!.createPinConnection(buildPinId(n1.id, 'out3'), buildPinId(n2.id, 'in3'))).toBeTruthy()
  expect(n1.id in resolver!.nodes).toBe(true)
  expect(n2.id in resolver!.nodes).toBe(true)
  expect(n2.inputPins['in1']).toBe(buildPinId(n1.id, 'out1'))
  expect(n2.inputPins['in2']).toBe(buildPinId(n1.id, 'out2'))
  expect(n2.inputPins['in3']).toBe(buildPinId(n1.id, 'out3'))
  expect(resolver!.destroyNode(n1.id)).toBeTruthy() // node 1 destroyed!!
  expect(n2.inputPins['in1']).toBeUndefined()
  expect(n2.inputPins['in2']).toBeUndefined()
  expect(n2.inputPins['in3']).toBeUndefined()
})


it('Destroying node should destroy all incoming connections', () => {
  let n1: CanvasNode
  let n2: CanvasNode

  n1 = resolver!.createNode('In3Out3', {})
  n2 = resolver!.createNode('In3Out3', {})
  expect(resolver!.createPinConnection(buildPinId(n1.id, 'out1'), buildPinId(n2.id, 'in1'))).toBeTruthy()
  expect(resolver!.createPinConnection(buildPinId(n1.id, 'out2'), buildPinId(n2.id, 'in2'))).toBeTruthy()
  expect(resolver!.createPinConnection(buildPinId(n1.id, 'out3'), buildPinId(n2.id, 'in3'))).toBeTruthy()
  expect(n1.id in resolver!.nodes).toBe(true)
  expect(n2.id in resolver!.nodes).toBe(true)
  expect(n2.inputPins['in1']).toBe(buildPinId(n1.id, 'out1'))
  expect(n2.inputPins['in2']).toBe(buildPinId(n1.id, 'out2'))
  expect(n2.inputPins['in3']).toBe(buildPinId(n1.id, 'out3'))
  expect(resolver!.destroyNode(n2.id)).toBeTruthy() // node 2 destroyed!!
  expect(n2.inputPins['in1']).toBeUndefined()
  expect(n2.inputPins['in2']).toBeUndefined()
  expect(n2.inputPins['in3']).toBeUndefined()
})



it('Destroying node should destroy all outgoing connections from the same pin', () => {
  
  const n1 = resolver!.createNode('In1Out1', {})
  const n2 = resolver!.createNode('In3Out3', {})
  expect(resolver!.createPinConnection(buildPinId(n1.id, 'out'), buildPinId(n2.id, 'in1'))).toBeTruthy()
  expect(resolver!.createPinConnection(buildPinId(n1.id, 'out'), buildPinId(n2.id, 'in2'))).toBeTruthy()
  expect(resolver!.createPinConnection(buildPinId(n1.id, 'out'), buildPinId(n2.id, 'in3'))).toBeTruthy()
  expect(n2.inputPins['in1']).toBe(buildPinId(n1.id, 'out'))
  expect(n2.inputPins['in2']).toBe(buildPinId(n1.id, 'out'))
  expect(n2.inputPins['in3']).toBe(buildPinId(n1.id, 'out'))
  expect(resolver!.destroyNode(n1.id)).toBeTruthy()
  expect(n2.inputPins['in1']).toBeUndefined()
  expect(n2.inputPins['in2']).toBeUndefined()
  expect(n2.inputPins['in3']).toBeUndefined()
})
