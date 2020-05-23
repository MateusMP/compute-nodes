import {
  NodeResolver,
  UpdateNodeEvent,
  ResolverEvent,
  DeleteNodeEvent
} from '../../core/NodeResolver'
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
    return null
  }
}

class In3Out3 extends CanvasNode {
  static Type = 'In3Out3'
  static InputFormat = ['in1', 'in2', 'in3'].reduce(
    (map: any, pinName: string) => {
      map[pinName] = { type: 'any' }
      return map
    },
    {}
  )

  static OutputFormat = ['out1', 'out2', 'out3'].reduce(
    (map: any, pinName: string) => {
      map[pinName] = { type: 'any' }
      return map
    },
    {}
  )

  static Construct(args: any) {
    return new CanvasNode(args)
  }

  static Render(args: any) {
    return null
  }
}

const nodeRegistry = new NodeRegistry<any>()
nodeRegistry.registerType(In1Out1)
nodeRegistry.registerType(In3Out3)

let resolver: TestNodeResolver | null = null
beforeEach(() => {
  resolver = new TestNodeResolver(nodeRegistry)
})

afterEach(() => {})

it('Check cyclic connections', () => {
  const n1 = resolver!.createNode('In1Out1', {})
  const n2 = resolver!.createNode('In1Out1', {})
  expect(n1.id in resolver!.nodes).toBe(true)
  expect(n2.id in resolver!.nodes).toBe(true)
  expect(
    resolver!.createPinConnection(
      buildPinId(n1.id, 'out'),
      buildPinId(n2.id, 'in')
    )
  ).toBeTruthy()
  expect(
    resolver!.createPinConnection(
      buildPinId(n1.id, 'out'),
      buildPinId(n1.id, 'in')
    )
  ).toBeFalsy()
})

it('Create invalid connection', () => {
  const n1 = resolver!.createNode('In1Out1', {})
  const n2 = resolver!.createNode('In1Out1', {})
  expect(
    resolver!.createPinConnection(
      buildPinId(n1.id, 'out-bad'),
      buildPinId(n2.id, 'out-bad')
    )
  ).toBeFalsy()
  expect(
    resolver!.createPinConnection(
      buildPinId(n1.id, 'out-bad'),
      buildPinId(n1.id, 'out')
    )
  ).toBeFalsy()
  expect(
    resolver!.createPinConnection(
      buildPinId(n1.id, 'out'),
      buildPinId(n1.id, 'out-bad')
    )
  ).toBeFalsy()
})

it('Destroying node should destroy all outgoing connections', () => {
  const n1 = resolver!.createNode('In3Out3', {})
  const n2 = resolver!.createNode('In3Out3', {})
  expect(
    resolver!.createPinConnection(
      buildPinId(n1.id, 'out1'),
      buildPinId(n2.id, 'in1')
    )
  ).toBeTruthy()
  expect(
    resolver!.createPinConnection(
      buildPinId(n1.id, 'out2'),
      buildPinId(n2.id, 'in2')
    )
  ).toBeTruthy()
  expect(
    resolver!.createPinConnection(
      buildPinId(n1.id, 'out3'),
      buildPinId(n2.id, 'in3')
    )
  ).toBeTruthy()
  expect(n1.id in resolver!.nodes).toBe(true)
  expect(n2.id in resolver!.nodes).toBe(true)
  expect(resolver!.getNodes()[n2.id].inputPins.in1).toBe(
    buildPinId(n1.id, 'out1')
  )
  expect(resolver!.getNodes()[n2.id].inputPins.in2).toBe(
    buildPinId(n1.id, 'out2')
  )
  expect(resolver!.getNodes()[n2.id].inputPins.in3).toBe(
    buildPinId(n1.id, 'out3')
  )
  expect(resolver!.destroyNode(n1.id)).toBeTruthy() // node 1 destroyed!!
  expect(resolver!.getNodes()[n2.id].inputPins.in1).toBeUndefined()
  expect(resolver!.getNodes()[n2.id].inputPins.in2).toBeUndefined()
  expect(resolver!.getNodes()[n2.id].inputPins.in3).toBeUndefined()
})

it('Destroying node should destroy all incoming connections', () => {
  const n1 = resolver!.createNode('In3Out3', {})
  const n2 = resolver!.createNode('In3Out3', {})
  expect(
    resolver!.createPinConnection(
      buildPinId(n1.id, 'out1'),
      buildPinId(n2.id, 'in1')
    )
  ).toBeTruthy()
  expect(
    resolver!.createPinConnection(
      buildPinId(n1.id, 'out2'),
      buildPinId(n2.id, 'in2')
    )
  ).toBeTruthy()
  expect(
    resolver!.createPinConnection(
      buildPinId(n1.id, 'out3'),
      buildPinId(n2.id, 'in3')
    )
  ).toBeTruthy()
  expect(n1.id in resolver!.nodes).toBe(true)
  expect(n2.id in resolver!.nodes).toBe(true)
  expect(resolver!.getNodes()[n2.id].inputPins.in1).toBe(
    buildPinId(n1.id, 'out1')
  )
  expect(resolver!.getNodes()[n2.id].inputPins.in2).toBe(
    buildPinId(n1.id, 'out2')
  )
  expect(resolver!.getNodes()[n2.id].inputPins.in3).toBe(
    buildPinId(n1.id, 'out3')
  )
  expect(resolver!.destroyNode(n2.id)).toBeTruthy() // node 2 destroyed!!
  expect(resolver!.getNodes()[n2.id]).toBeUndefined()
  expect(resolver!.getConnections()[buildPinId(n2.id, 'in1')]).toBeUndefined()
  expect(resolver!.getConnections()[buildPinId(n2.id, 'in2')]).toBeUndefined()
  expect(resolver!.getConnections()[buildPinId(n2.id, 'in3')]).toBeUndefined()
})

it('Destroying node should destroy all outgoing connections from the same pin', () => {
  const n1 = resolver!.createNode('In1Out1', {})
  const n2 = resolver!.createNode('In3Out3', {})
  expect(
    resolver!.createPinConnection(
      buildPinId(n1.id, 'out'),
      buildPinId(n2.id, 'in1')
    )
  ).toBeTruthy()
  expect(
    resolver!.createPinConnection(
      buildPinId(n1.id, 'out'),
      buildPinId(n2.id, 'in2')
    )
  ).toBeTruthy()
  expect(
    resolver!.createPinConnection(
      buildPinId(n1.id, 'out'),
      buildPinId(n2.id, 'in3')
    )
  ).toBeTruthy()
  expect(resolver?.getNodes()[n2.id].inputPins['in1']).toBe(
    buildPinId(n1.id, 'out')
  )
  expect(resolver?.getNodes()[n2.id].inputPins['in2']).toBe(
    buildPinId(n1.id, 'out')
  )
  expect(resolver?.getNodes()[n2.id].inputPins['in3']).toBe(
    buildPinId(n1.id, 'out')
  )
  expect(resolver!.destroyNode(n1.id)).toBeTruthy()
  expect(resolver?.getNodes()[n2.id].inputPins['in1']).toBeUndefined()
  expect(resolver?.getNodes()[n2.id].inputPins['in2']).toBeUndefined()
  expect(resolver?.getNodes()[n2.id].inputPins['in3']).toBeUndefined()
})

it('Destroying node should return new map in destroy event', () => {
  const n1 = resolver!.createNode('In1Out1', {})

  const onDestroyed = jest.fn((event: ResolverEvent) => {})
  resolver!.on(DeleteNodeEvent, onDestroyed)

  const nodeMap = resolver!.getNodes()
  resolver!.destroyNode(n1.id)
  expect(onDestroyed.mock.calls.length).toBe(1)
  expect(onDestroyed.mock.calls[0][0].nodes![n1.id]).toBeUndefined()
  expect(onDestroyed.mock.calls[0][0].nodes).not.toBe(nodeMap)
})

it('should issue event with new map with updated instance on node update', () => {
  const n1 = resolver!.createNode('In1Out1', {})
  const onUpdated = jest.fn((event: ResolverEvent) => {})
  resolver!.on(UpdateNodeEvent, onUpdated)
  resolver!.updateNode(n1.id, { x: 1 })
  expect(onUpdated.mock.calls.length).toBe(1)
  expect(onUpdated.mock.calls[0][0].nodes![n1.id]).not.toBe(n1)
  expect(onUpdated.mock.calls[0][0].nodes![n1.id]).toBe(
    onUpdated.mock.calls[0][0].node
  )
  expect(onUpdated.mock.calls[0][0].node).not.toBe(n1)
  expect(onUpdated.mock.calls[0][0].node!.x).toBe(1)
  resolver!.updateNode(n1.id, { x: 2 })
  expect(onUpdated.mock.calls.length).toBe(2)
  expect(onUpdated.mock.calls[1][0].nodes).not.toBe(
    onUpdated.mock.calls[0][0].nodes
  )
  expect(onUpdated.mock.calls[1][0].nodes![n1.id]).not.toBe(n1)
  expect(onUpdated.mock.calls[1][0].nodes![n1.id]).toBe(
    onUpdated.mock.calls[1][0].node
  )
  expect(onUpdated.mock.calls[1][0].node).not.toBe(n1)
  expect(onUpdated.mock.calls[1][0].node).not.toBe(
    onUpdated.mock.calls[0][0].node
  )
  expect(onUpdated.mock.calls[1][0].node!.x).toBe(2)
})
