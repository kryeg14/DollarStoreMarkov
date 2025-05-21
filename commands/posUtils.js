// posUtils.js
const posCombinations = [
  ['Noun', 'Verb'],
  ['Noun', 'Verb', 'Noun'],
  ['Adjective', 'Noun', 'Verb'],
  ['Adjective', 'Noun', 'Verb', 'Noun'],
  ['Pronoun', 'Verb'],
  ['Pronoun', 'Verb', 'Adjective'],
  ['Verb', 'Adverb'],
  ['Noun', 'Verb', 'Adverb'],
  ['Adverb', 'Verb', 'Noun'],
  ['Determiner', 'Noun', 'Verb'],
  ['Conjunction', 'Noun', 'Verb'],
  ['Noun', 'Auxiliary', 'Verb'],
  ['Modal', 'Verb', 'Noun'],
  ['Verb', 'Noun', 'Adjective'],
  ['Adjective', 'Adjective', 'Noun'],
  ['Noun', 'Verb', 'Preposition', 'Noun'],
  ['Pronoun', 'Modal', 'Verb'],
  // Add more as you find needed...
];

// Checks if two POS arrays have any matching pattern from posCombinations
function matchesPOSPattern(prevPosArray, nextPosArray) {
  // Convert to sets for easier checking
  const prevSet = new Set(prevPosArray);
  const nextSet = new Set(nextPosArray);

  for (const pattern of posCombinations) {
    // Check if prevSet includes the first pos in pattern and nextSet includes the next pos
    const prevPos = pattern[pattern.length - 2];
    const nextPos = pattern[pattern.length - 1];

    if (prevSet.has(prevPos) && nextSet.has(nextPos)) {
      return true;
    }
  }
  return false;
}

module.exports = {
  posCombinations,
  matchesPOSPattern,
};
