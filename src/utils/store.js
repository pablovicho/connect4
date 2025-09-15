import { create } from 'zustand'
import matrixUpdated from './updateMatrix'
import whoWon from '../winCheck/win'

const useStore = create((set) => ({

  matrix: Array(6).fill().map(() => Array(7).fill(0)),
  player: 1,
  winner: 0,
  player1: 0,
  player2: 0,
  gameId: null,
  thisGamePlayer: null,
  updateMatrix: (col, value, row) => set((state) => ({matrix: matrixUpdated(state.matrix, col, value, row)})),
  resetMatrix: () => set({matrix: Array(6).fill().map(() => Array(7).fill(0))}),
  resetPlayer: () => set({player: 1}),
  resetScore: () => set({player1: 0, player2: 0}),
  changePlayer: () => set((state) => ({player: state.player === 1 ? 2 : 1})),
  checkWinner: () => set((state) => ({winner: whoWon(state.matrix)})),
  resetWinner: () => set({winner: 0}),
  player1Win: () => set((state) => ({player1: state.player1 + 1})),
  player2Win: () => set((state) => ({player2: state.player2 + 1})),
  setGameId: (id) => set({gameId: id}),
  setThisGamePlayer: (player) => set({thisGamePlayer: player})
}))

export default useStore