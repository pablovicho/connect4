  //diagonal check!!
  function reverseDiagonal(matrix) {
    if(!matrix) return;
    let xWin = false;
    let yWin = false;

    for (let h = 0; h < 6; h++) { //the horizontal axis    
      for (let v = 0; v < 7; v++) { //the vertical axis
        if ((v + 2) < 6 && (h-3)>=0) {
          if(matrix[h][v] === 1 && matrix[h - 1][v + 1] === 1
            && matrix[h - 2][v + 2] === 1 && matrix[h - 3][v + 3] === 1) {xWin = true}
          
          if(matrix[h][v] === 2 && matrix[h - 1][v + 1] === 2
            && matrix[h - 2][v + 2] === 2 && matrix[h - 3][v + 3] === 2) {yWin = true}
        }
      }
  }
  if(xWin) return 1
  if(yWin) return 2
  return 0
  }
  
  export default reverseDiagonal
 