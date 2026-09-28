// Bank each team's remaining round points exactly once by clearing roundScore.
// winnerPoints includes the final letter's points or the full-answer bonus.
export function settleRound(teams, winnerIndex = null, winnerPoints = 0) {
  return teams.map((team, index) => ({
    ...team,
    score: team.score + (index === winnerIndex ? winnerPoints : team.roundScore),
    roundScore: 0,
  }))
}

// Only banked totals change hands; each team keeps its current round earnings.
export function swapTeamScores(teams, sourceIndex, targetIndex) {
  if (sourceIndex === targetIndex || !teams[sourceIndex] || !teams[targetIndex]) return teams
  return teams.map((team, index) => {
    if (index === sourceIndex) return { ...team, score: teams[targetIndex].score }
    if (index === targetIndex) return { ...team, score: teams[sourceIndex].score }
    return team
  })
}
