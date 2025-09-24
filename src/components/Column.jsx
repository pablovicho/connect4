import React from 'react'
import Circle from './Circle'

export default function Column(props) {
  const {playerCol} = props
      
      return playerCol.map((element, index)=>{
        return <div key={index}>  
                <Circle player={element} />
               </div>
          })}
