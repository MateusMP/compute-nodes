import React from 'react'
import { useDrop, useDrag, DragObjectWithType } from 'react-dnd'
import { buildPinId } from '../core/utils'
import { NodeResolver } from '../core/NodeResolver'
import { LinkDataType } from '../core/NodeRegistry'

enum ItemTypes {
  FROM_OUTPUT = "CN_FROM_OUTPUT",
  FROM_INPUT = "CN_FROM_INPUT",
}

export interface PinDropItem {
  type: ItemTypes
  [key: string]: any
}

interface OutputPinProps {
  nodeId: string
  name: string
  visualName?: string
  dataType: LinkDataType
  resolver: NodeResolver
}

export interface PinDropItem extends DragObjectWithType {
  dataType: LinkDataType
  pinId: string
}


function canDrop(type: LinkDataType, expected: LinkDataType,
  resolver: NodeResolver, fromPin: string, toPin: string): boolean {
  if (fromPin === toPin) {
    return false;
  }
  if (resolver.createsCycle(fromPin, toPin)) {
    return false;
  }

  if (expected === 'any') {
    return true;
  } else if (Array.isArray(expected)) {
    if (Array.isArray(type)) {
      for (let x = 0; x < expected.length; ++x) {
        if (type.indexOf(expected[x]) >= 0) {
          return true;
        }
      }
      return false;
    } else {
      return expected.includes(type)
    }
  } else if (Array.isArray(type)) {
    return type.includes(expected)
  } else {
    return expected === type
  }
}

export function OutputPin({
  nodeId,
  name,
  visualName,
  dataType,
  resolver
}: OutputPinProps) {
  const pinId = buildPinId(nodeId, name)

  const [{ dragging }, dragRef] = useDrag<PinDropItem, any, any>({
    item: { type: ItemTypes.FROM_OUTPUT, dataType: dataType, pinId: pinId },
    collect: (monitor: any) => ({
      dragging: monitor.isDragging()
    })
  })

  const [, drop] = useDrop<PinDropItem, any, any>({
    accept: ItemTypes.FROM_INPUT,
    canDrop: (e, _monitor) => canDrop(dataType, e.dataType, resolver, pinId, e.pinId),
    drop: (e: any) => { return { connection: resolver.createPinConnection(pinId, e.pinId) } },
    collect: (monitor: any) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
      clientOffset: monitor.getClientOffset()
    })
  })

  const activeClasses = dragging ? 'pin dragging node-noglobals' : 'pin node-noglobals'
  const hideName = !visualName || visualName === ''
  const pinElement = dragRef(drop(<div id={pinId} className={activeClasses} />))

  return (
    <div className='output-pin'>
      {hideName ? null : <span>{name}</span>}
      {pinElement}
    </div>
  )
}

interface InputPinProps {
  nodeId: string
  name: string
  visualName?: string
  dataType: LinkDataType
  error: boolean
  resolver: NodeResolver
}

/**
 * A generic input pin
 * @param param0
 */
export function InputPin({
  nodeId,
  name,
  visualName,
  dataType,
  error,
  resolver
}: InputPinProps) {
  const pinId = buildPinId(nodeId, name)
  const [, drop] = useDrop<PinDropItem, any, any>({
    accept: ItemTypes.FROM_OUTPUT,
    canDrop: (e, _monitor) => canDrop(e.dataType, dataType, resolver, e.pinId, pinId),
    drop: (e: any) => { return { connection: resolver.createPinConnection(e.pinId, pinId) } },
    collect: (monitor: any) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
      clientOffset: monitor.getClientOffset()
    })
  })

  const [{ }, dragRef] = useDrag<PinDropItem, any, any>({
    item: { type: ItemTypes.FROM_INPUT, dataType: dataType, pinId: pinId },
    collect: (monitor: any) => ({
      dragging: monitor.isDragging()
    })
  })

  const classes = `pin node-noglobals ${error ? 'error' : ''}`

  const displayName = visualName === undefined ? name : visualName
  const pinElement = dragRef(drop(<div id={pinId} className={classes} />))

  return (
    <div className='input-pin'>
      {pinElement}
      <span>{displayName}</span>
    </div>
  )
}
