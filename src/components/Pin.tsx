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
    canDrop: (item, _monitor) => item.dataType === dataType,
    drop: (e: any) => resolver.createPinConnection(pinId, e.pinId),
    collect: (monitor: any) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
      clientOffset: monitor.getClientOffset()
    })
  })

  const activeClasses = dragging ? 'pin dragging node-noglobals' : 'pin node-noglobals'
  const hideName = !visualName || visualName === ''
  const pinElement = dragRef(drop(<div id={pinId} className={activeClasses}/>))

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
    canDrop: (item, _monitor) => item.dataType === dataType,
    drop: (e: any) => resolver.createPinConnection(e.pinId, pinId),
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
