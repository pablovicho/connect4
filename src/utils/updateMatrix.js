const matrixUpdated = (matrix, column, value, row) => {
  let flagged = false

  const updateCol = (element) => { //this changes only the first element that is a 0
    if(flagged === false) {
    if (element === 0) {
        flagged=true
        return value
    }
  }
  return element
  }

  const updated = column.map((element)=>{return updateCol(element)})

  const newMatrix = JSON.parse(JSON.stringify(matrix))
  
    for(let j = 0; j<matrix.length; j++){
      for(let k = 0; k<matrix.length+1; k++){
        if(k===row){
          newMatrix[j][k]=updated[j]
        }
      } 
    }
  return newMatrix
}

  export default matrixUpdated