import { CardValue } from '../../../../shared/cards';
import { compareCardValues, compareVotes } from './compareVotes';

describe('The compareVotes function', () => {
  it.each<{ userAndVote1: [string, CardValue]; userAndVote2: [string, CardValue]; result: number }>(
    [
      { userAndVote1: ['user1', '100'], userAndVote2: ['user2', '5'], result: 1 },
      { userAndVote1: ['user1', '0.5'], userAndVote2: ['user2', '5'], result: -1 },
      { userAndVote1: ['user1', '5'], userAndVote2: ['user2', 'coffee'], result: -1 },
      { userAndVote1: ['user1', 'coffee'], userAndVote2: ['user2', '5'], result: 1 },
      { userAndVote1: ['user1', 'coffee'], userAndVote2: ['user2', 'coffee'], result: -1 },
      { userAndVote1: ['user1', 'coffee'], userAndVote2: ['user2', 'not-voted'], result: -1 },
    ]
  )(
    'returns $result when $userAndVote1 and $userAndVote2 are passed',
    ({ userAndVote1, userAndVote2, result }) => {
      const sortedResults = compareVotes(userAndVote1, userAndVote2);
      expect(sortedResults).toEqual(result);
    }
  );
});

describe('The compareCardValues function', () => {
  it.each<{ value1: CardValue; value2: CardValue; result: number }>([
    { value1: '∞', value2: '100', result: 1 },
    { value1: '100', value2: '5', result: 1 },
    { value1: '0.5', value2: '5', result: -1 },
    { value1: '5', value2: 'coffee', result: -1 },
    { value1: 'coffee', value2: '5', result: 1 },
    { value1: 'coffee', value2: 'coffee', result: 0 },
    { value1: 'coffee', value2: 'not-voted', result: -1 },
  ])('returns $result when $value1 and $value2 are passed', ({ value1, value2, result }) => {
    const sortedResults = compareCardValues(value1, value2);
    expect(sortedResults).toEqual(result);
  });
});
