import assert from 'node:assert/strict'
import test from 'node:test'
import { settleRound, swapTeamScores } from './scoring.js'

const teams = [
  { name: 'A', score: 2000, roundScore: 500 },
  { name: 'B', score: 1000, roundScore: 300 },
  { name: 'C', score: 400, roundScore: 0 },
]

test('full answer banks all teams and awards the solver bonus only once', () => {
  const result = settleRound(teams, 1, 1300)
  assert.deepEqual(result.map(team => team.score), [2500, 2300, 400])
  assert.ok(result.every(team => team.roundScore === 0))
  assert.deepEqual(settleRound(result), result)
  assert.equal(teams[0].roundScore, 500)
})

test('last letter includes newly earned points without a full-answer bonus', () => {
  const result = settleRound(teams, 0, 900)
  assert.deepEqual(result.map(team => team.score), [2900, 1300, 400])
})

test('revealing or switching questions preserves points without a winner bonus', () => {
  assert.deepEqual(settleRound(teams).map(team => team.score), [2500, 1300, 400])
})

test('swap exchanges totals while preserving round points and other teams', () => {
  const result = swapTeamScores(teams, 0, 1)
  assert.deepEqual(result.map(team => team.score), [1000, 2000, 400])
  assert.deepEqual(result.map(team => team.roundScore), [500, 300, 0])
  assert.deepEqual(teams.map(team => team.score), [2000, 1000, 400])
  assert.equal(result[2], teams[2])
  assert.deepEqual(settleRound(result, 1, 1300).map(team => team.score), [1500, 3300, 400])
})

test('swap supports zero and equal totals without creating points', () => {
  const input = [{ score: 0, roundScore: 100 }, { score: 500, roundScore: 200 }]
  assert.deepEqual(swapTeamScores(input, 0, 1), [{ score: 500, roundScore: 100 }, { score: 0, roundScore: 200 }])
  const tied = [{ score: 0, roundScore: 100 }, { score: 0, roundScore: 200 }]
  assert.deepEqual(swapTeamScores(tied, 0, 1), tied)
})

test('self-selection and invalid teams do not alter scores', () => {
  assert.equal(swapTeamScores(teams, 0, 0), teams)
  assert.equal(swapTeamScores(teams, 0, -1), teams)
  assert.equal(swapTeamScores(teams, 99, 0), teams)
})
