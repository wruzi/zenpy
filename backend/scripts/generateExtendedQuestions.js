const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', '..', 'database', 'data');
const questionsPath = path.join(dataDir, 'questions.json');
const outputListPath = path.join(__dirname, '..', '..', 'database', 'added_questions_101_250.txt');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function gcd(a, b) {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x;
}

function lcm(a, b) {
  return Math.abs(a * b) / gcd(a, b);
}

function isPrime(n) {
  if (n < 2) return false;
  if (n === 2) return true;
  if (n % 2 === 0) return false;
  for (let i = 3; i * i <= n; i += 2) {
    if (n % i === 0) return false;
  }
  return true;
}

function fib(n) {
  if (n <= 1) return n;
  let a = 0;
  let b = 1;
  for (let i = 2; i <= n; i++) {
    const c = a + b;
    a = b;
    b = c;
  }
  return b;
}

function median(arr) {
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  if (s.length % 2 === 0) return (s[m - 1] + s[m]) / 2;
  return s[m];
}

function variance(arr) {
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  const v = arr.reduce((acc, x) => acc + (x - mean) ** 2, 0) / arr.length;
  return Number(v.toFixed(4));
}

function makeQuestion({ id, title, description, difficulty, category, concepts, hints, optimalTime, xpBase, testCases }) {
  return {
    id,
    title,
    description,
    difficulty,
    category,
    concepts,
    initialCode: '',
    hints,
    optimalTime,
    xpBase,
    subjective: false,
    testCases,
  };
}

function mathQuestion(id) {
  const idx = id - 101;
  const variant = idx % 6;
  const n1 = 6 + (idx % 9);
  const n2 = 10 + (idx % 11);

  if (variant === 0) {
    const title = `Math Sum Drill ${id}`;
    return makeQuestion({
      id,
      title,
      description: 'Read an integer n and print the sum of numbers from 1 to n.',
      difficulty: id <= 115 ? 'beginner' : 'intermediate',
      category: 'Phase 10: Math Foundations',
      concepts: ['loops', 'arithmetic progression'],
      hints: ['Use a loop or formula n*(n+1)//2.', 'Print only the numeric result.'],
      optimalTime: 70,
      xpBase: id * 10,
      testCases: [
        { input: `${n1}`, expectedOutput: `${(n1 * (n1 + 1)) / 2}`, hidden: false },
        { input: `${n2}`, expectedOutput: `${(n2 * (n2 + 1)) / 2}`, hidden: true },
      ],
    });
  }

  if (variant === 1) {
    const a = 2 + (idx % 7);
    const d = 1 + (idx % 5);
    const n = 5 + (idx % 6);
    const answer = a + (n - 1) * d;
    return makeQuestion({
      id,
      title: `AP nth Term ${id}`,
      description: 'Input a, d, n and print the nth term of an arithmetic progression.',
      difficulty: id <= 115 ? 'beginner' : 'intermediate',
      category: 'Phase 10: Math Foundations',
      concepts: ['formula', 'input parsing'],
      hints: ['Use a + (n-1)*d.', 'Inputs are space-separated.'],
      optimalTime: 75,
      xpBase: id * 10,
      testCases: [
        { input: `${a} ${d} ${n}`, expectedOutput: `${answer}`, hidden: false },
        { input: `4 3 8`, expectedOutput: `25`, hidden: true },
      ],
    });
  }

  if (variant === 2) {
    const a = 18 + (idx % 12);
    const b = 24 + (idx % 15);
    return makeQuestion({
      id,
      title: `GCD Pair ${id}`,
      description: 'Read two integers and print their greatest common divisor (GCD).',
      difficulty: 'intermediate',
      category: 'Phase 10: Math Foundations',
      concepts: ['euclidean algorithm', 'while loop'],
      hints: ['Use repeated modulo until remainder is 0.', 'Handle any order of inputs.'],
      optimalTime: 85,
      xpBase: id * 10,
      testCases: [
        { input: `${a} ${b}`, expectedOutput: `${gcd(a, b)}`, hidden: false },
        { input: `84 30`, expectedOutput: `6`, hidden: true },
      ],
    });
  }

  if (variant === 3) {
    const a = 6 + (idx % 12);
    const b = 8 + (idx % 10);
    return makeQuestion({
      id,
      title: `LCM Pair ${id}`,
      description: 'Read two integers and print their least common multiple (LCM).',
      difficulty: 'intermediate',
      category: 'Phase 10: Math Foundations',
      concepts: ['gcd', 'lcm'],
      hints: ['LCM(a,b)=abs(a*b)/GCD(a,b).', 'Use integer output.'],
      optimalTime: 90,
      xpBase: id * 10,
      testCases: [
        { input: `${a} ${b}`, expectedOutput: `${lcm(a, b)}`, hidden: false },
        { input: `21 6`, expectedOutput: `42`, hidden: true },
      ],
    });
  }

  if (variant === 4) {
    const n = 29 + (idx % 20);
    return makeQuestion({
      id,
      title: `Prime Check ${id}`,
      description: 'Read integer n and print True if n is prime else False.',
      difficulty: 'intermediate',
      category: 'Phase 10: Math Foundations',
      concepts: ['primality', 'sqrt optimization'],
      hints: ['Check divisors only up to sqrt(n).', 'Return exact Python boolean style output.'],
      optimalTime: 95,
      xpBase: id * 10,
      testCases: [
        { input: `${n}`, expectedOutput: `${isPrime(n) ? 'True' : 'False'}`, hidden: false },
        { input: `49`, expectedOutput: `False`, hidden: true },
      ],
    });
  }

  const n = 8 + (idx % 10);
  return makeQuestion({
    id,
    title: `Fibonacci N ${id}`,
    description: 'Read n and print nth Fibonacci number (0-indexed).',
    difficulty: 'intermediate',
    category: 'Phase 10: Math Foundations',
    concepts: ['sequence', 'dynamic update'],
    hints: ['Use iterative update of two variables.', 'F(0)=0, F(1)=1.'],
    optimalTime: 95,
    xpBase: id * 10,
    testCases: [
      { input: `${n}`, expectedOutput: `${fib(n)}`, hidden: false },
      { input: `12`, expectedOutput: `144`, hidden: true },
    ],
  });
}

function logicQuestion(id) {
  const idx = id - 131;
  const variant = idx % 6;

  if (variant === 0) {
    return makeQuestion({
      id,
      title: `Balanced Parentheses ${id}`,
      description: 'Input a string containing only ()[]{} and print True if balanced else False.',
      difficulty: 'intermediate',
      category: 'Phase 11: Logic Building',
      concepts: ['stack', 'mapping'],
      hints: ['Push opening brackets on stack.', 'Closing bracket must match stack top.'],
      optimalTime: 120,
      xpBase: id * 10,
      testCases: [
        { input: `([{}])`, expectedOutput: `True`, hidden: false },
        { input: `([)]`, expectedOutput: `False`, hidden: true },
      ],
    });
  }

  if (variant === 1) {
    return makeQuestion({
      id,
      title: `Two Sum Indexes ${id}`,
      description: 'Read target then list of integers. Print indices i j (i<j) for first pair summing to target.',
      difficulty: 'intermediate',
      category: 'Phase 11: Logic Building',
      concepts: ['hash map', 'iteration'],
      hints: ['Track seen values and indices.', 'Print indices separated by a space.'],
      optimalTime: 130,
      xpBase: id * 10,
      testCases: [
        { input: `9\n2 7 11 15`, expectedOutput: `0 1`, hidden: false },
        { input: `10\n1 3 6 4 9`, expectedOutput: `2 3`, hidden: true },
      ],
    });
  }

  if (variant === 2) {
    return makeQuestion({
      id,
      title: `Anagram Check ${id}`,
      description: 'Read two lowercase strings and print True if they are anagrams else False.',
      difficulty: 'intermediate',
      category: 'Phase 11: Logic Building',
      concepts: ['frequency counting', 'sorting'],
      hints: ['Lengths must match first.', 'Compare sorted strings or frequency dicts.'],
      optimalTime: 100,
      xpBase: id * 10,
      testCases: [
        { input: `listen\nsilent`, expectedOutput: `True`, hidden: false },
        { input: `apple\npapelx`, expectedOutput: `False`, hidden: true },
      ],
    });
  }

  if (variant === 3) {
    return makeQuestion({
      id,
      title: `Longest Unique Substring ${id}`,
      description: 'Read a string and print length of longest substring without repeating characters.',
      difficulty: 'advanced',
      category: 'Phase 11: Logic Building',
      concepts: ['sliding window', 'set'],
      hints: ['Use two pointers and a map of last seen index.', 'Update best length each step.'],
      optimalTime: 150,
      xpBase: id * 10,
      testCases: [
        { input: `abcabcbb`, expectedOutput: `3`, hidden: false },
        { input: `pwwkew`, expectedOutput: `3`, hidden: true },
      ],
    });
  }

  if (variant === 4) {
    return makeQuestion({
      id,
      title: `Matrix Spiral ${id}`,
      description: 'Print spiral order of fixed 3x3 matrix [[1,2,3],[4,5,6],[7,8,9]] as space-separated values.',
      difficulty: 'advanced',
      category: 'Phase 11: Logic Building',
      concepts: ['matrix traversal', 'boundaries'],
      hints: ['Track top, bottom, left, right boundaries.', 'Move inward after each side.'],
      optimalTime: 160,
      xpBase: id * 10,
      testCases: [
        { input: ``, expectedOutput: `1 2 3 6 9 8 7 4 5`, hidden: false },
        { input: ``, expectedOutput: `1 2 3 6 9 8 7 4 5`, hidden: true },
      ],
    });
  }

  return makeQuestion({
    id,
    title: `Top K Frequent ${id}`,
    description: 'Given list 1 1 1 2 2 3 and k=2, print top k frequent elements in descending frequency.',
    difficulty: 'advanced',
    category: 'Phase 11: Logic Building',
    concepts: ['frequency map', 'sorting'],
    hints: ['Count each number first.', 'Sort by count descending and print first k.'],
    optimalTime: 145,
    xpBase: id * 10,
    testCases: [
      { input: ``, expectedOutput: `1 2`, hidden: false },
      { input: ``, expectedOutput: `1 2`, hidden: true },
    ],
  });
}

function statsQuestion(id) {
  const idx = id - 161;
  const variant = idx % 5;

  if (variant === 0) {
    const arr = [2 + (idx % 3), 5 + (idx % 4), 9, 12, 15];
    const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
    return makeQuestion({
      id,
      title: `Mean Calculation ${id}`,
      description: 'For fixed list, calculate and print mean with 2 decimal places.',
      difficulty: 'intermediate',
      category: 'Phase 12: Probability & Stats',
      concepts: ['mean', 'formatting'],
      hints: ['sum(list)/len(list).', 'Use format to 2 decimals.'],
      optimalTime: 90,
      xpBase: id * 10,
      testCases: [
        { input: `${arr.join(' ')}`, expectedOutput: `${mean.toFixed(2)}`, hidden: false },
        { input: `1 2 3 4 5`, expectedOutput: `3.00`, hidden: true },
      ],
    });
  }

  if (variant === 1) {
    return makeQuestion({
      id,
      title: `Median Calculation ${id}`,
      description: 'Read odd-length integer list and print median.',
      difficulty: 'intermediate',
      category: 'Phase 12: Probability & Stats',
      concepts: ['sorting', 'median'],
      hints: ['Sort list first.', 'Middle index is len//2.'],
      optimalTime: 95,
      xpBase: id * 10,
      testCases: [
        { input: `9 1 8 2 7`, expectedOutput: `7`, hidden: false },
        { input: `3 5 1 2 4`, expectedOutput: `3`, hidden: true },
      ],
    });
  }

  if (variant === 2) {
    return makeQuestion({
      id,
      title: `Population Variance ${id}`,
      description: 'Read a list of numbers and print population variance rounded to 4 decimals.',
      difficulty: 'advanced',
      category: 'Phase 12: Probability & Stats',
      concepts: ['variance', 'loops'],
      hints: ['Compute mean first.', 'Use sum((x-mean)^2)/n.'],
      optimalTime: 130,
      xpBase: id * 10,
      testCases: [
        { input: `1 2 3 4 5`, expectedOutput: `${variance([1,2,3,4,5]).toFixed(4)}`, hidden: false },
        { input: `2 2 2 2`, expectedOutput: `0.0000`, hidden: true },
      ],
    });
  }

  if (variant === 3) {
    return makeQuestion({
      id,
      title: `Bayes Basic ${id}`,
      description: 'Input P(B|A), P(A), P(B). Print P(A|B) with 4 decimals.',
      difficulty: 'advanced',
      category: 'Phase 12: Probability & Stats',
      concepts: ['bayes theorem', 'floating point'],
      hints: ['P(A|B)=P(B|A)*P(A)/P(B).', 'Use float parsing.'],
      optimalTime: 120,
      xpBase: id * 10,
      testCases: [
        { input: `0.9 0.2 0.3`, expectedOutput: `0.6000`, hidden: false },
        { input: `0.8 0.1 0.25`, expectedOutput: `0.3200`, hidden: true },
      ],
    });
  }

  return makeQuestion({
    id,
    title: `Softmax Vector ${id}`,
    description: 'Read three logits and print softmax probabilities rounded to 4 decimals separated by spaces.',
    difficulty: 'advanced',
    category: 'Phase 12: Probability & Stats',
    concepts: ['softmax', 'normalization'],
    hints: ['Compute exp for each logit.', 'Divide each exp by total sum.'],
    optimalTime: 150,
    xpBase: id * 10,
    testCases: [
      { input: `1 2 3`, expectedOutput: `0.0900 0.2447 0.6652`, hidden: false },
      { input: `0 0 0`, expectedOutput: `0.3333 0.3333 0.3333`, hidden: true },
    ],
  });
}

function gptBlockQuestion(id) {
  const idx = id - 191;
  const variant = idx % 6;

  if (variant === 0) {
    return makeQuestion({
      id,
      title: `Tokenize Sentence ${id}`,
      description: 'Read a sentence, lowercase it, split by spaces, and print tokens joined by |.',
      difficulty: 'intermediate',
      category: 'Phase 13: GPT Text Pipeline',
      concepts: ['tokenization', 'normalization'],
      hints: ['Use lower().', 'Use split() then join with |.'],
      optimalTime: 90,
      xpBase: id * 10,
      testCases: [
        { input: `Hello GPT Clone`, expectedOutput: `hello|gpt|clone`, hidden: false },
        { input: `Build Better Models`, expectedOutput: `build|better|models`, hidden: true },
      ],
    });
  }

  if (variant === 1) {
    return makeQuestion({
      id,
      title: `Word To ID Map ${id}`,
      description: 'For tokens ["i","love","ai","i"], build first-occurrence word->id map and print as key:id sorted by id.',
      difficulty: 'intermediate',
      category: 'Phase 13: GPT Text Pipeline',
      concepts: ['vocabulary', 'dictionary'],
      hints: ['Assign id only when word not seen.', 'Print in id order.'],
      optimalTime: 100,
      xpBase: id * 10,
      testCases: [
        { input: ``, expectedOutput: `i:0 love:1 ai:2`, hidden: false },
        { input: ``, expectedOutput: `i:0 love:1 ai:2`, hidden: true },
      ],
    });
  }

  if (variant === 2) {
    return makeQuestion({
      id,
      title: `Bigram Count ${id}`,
      description: 'For token ids [1,2,1,3], print count of each bigram as (a,b)=count sorted lexicographically.',
      difficulty: 'advanced',
      category: 'Phase 13: GPT Text Pipeline',
      concepts: ['bigram', 'counting'],
      hints: ['Pair consecutive ids.', 'Use dictionary for counts.'],
      optimalTime: 120,
      xpBase: id * 10,
      testCases: [
        { input: ``, expectedOutput: `(1,2)=1 (1,3)=1 (2,1)=1`, hidden: false },
        { input: ``, expectedOutput: `(1,2)=1 (1,3)=1 (2,1)=1`, hidden: true },
      ],
    });
  }

  if (variant === 3) {
    return makeQuestion({
      id,
      title: `Context Window ${id}`,
      description: 'Given ids 5 6 7 8 9 and window=3, print all training pairs context->target.',
      difficulty: 'advanced',
      category: 'Phase 14: GPT Training Prep',
      concepts: ['context window', 'sequence pairs'],
      hints: ['Context length is fixed to 3.', 'Slide by one position.'],
      optimalTime: 140,
      xpBase: id * 10,
      testCases: [
        { input: ``, expectedOutput: `5 6 7 -> 8\n6 7 8 -> 9`, hidden: false },
        { input: ``, expectedOutput: `5 6 7 -> 8\n6 7 8 -> 9`, hidden: true },
      ],
    });
  }

  if (variant === 4) {
    return makeQuestion({
      id,
      title: `Causal Mask ${id}`,
      description: 'For n=4 print 4x4 causal mask with 1 for allowed positions and 0 for blocked.',
      difficulty: 'advanced',
      category: 'Phase 14: GPT Training Prep',
      concepts: ['masking', 'nested loops'],
      hints: ['Position j is allowed if j<=i.', 'Print each row space-separated.'],
      optimalTime: 135,
      xpBase: id * 10,
      testCases: [
        { input: ``, expectedOutput: `1 0 0 0\n1 1 0 0\n1 1 1 0\n1 1 1 1`, hidden: false },
        { input: ``, expectedOutput: `1 0 0 0\n1 1 0 0\n1 1 1 0\n1 1 1 1`, hidden: true },
      ],
    });
  }

  return makeQuestion({
    id,
    title: `Greedy Decode ${id}`,
    description: 'Given logits rows [[1,3,2],[0,5,4],[9,8,7]], print greedy token ids (argmax per row).',
    difficulty: 'advanced',
    category: 'Phase 14: GPT Training Prep',
    concepts: ['argmax', 'decoding'],
    hints: ['Pick index of maximum in each row.', 'Print ids space-separated.'],
    optimalTime: 120,
    xpBase: id * 10,
    testCases: [
      { input: ``, expectedOutput: `1 1 0`, hidden: false },
      { input: ``, expectedOutput: `1 1 0`, hidden: true },
    ],
  });
}

function transformerQuestion(id) {
  const idx = id - 221;
  const variant = idx % 5;

  if (variant === 0) {
    return makeQuestion({
      id,
      title: `Dot Attention Score ${id}`,
      description: 'Input two vectors of length 3 and print dot-product attention score.',
      difficulty: 'advanced',
      category: 'Phase 15: Mini GPT Integration',
      concepts: ['dot product', 'attention'],
      hints: ['Multiply pairwise and sum.', 'Use integer arithmetic for given tests.'],
      optimalTime: 120,
      xpBase: id * 10,
      testCases: [
        { input: `1 2 3\n4 5 6`, expectedOutput: `32`, hidden: false },
        { input: `2 0 1\n3 1 2`, expectedOutput: `8`, hidden: true },
      ],
    });
  }

  if (variant === 1) {
    return makeQuestion({
      id,
      title: `Scaled Attention ${id}`,
      description: 'Given dot score s and dimension d, print s/sqrt(d) rounded to 4 decimals.',
      difficulty: 'advanced',
      category: 'Phase 15: Mini GPT Integration',
      concepts: ['scaling', 'sqrt'],
      hints: ['Use math.sqrt(d).', 'Round to 4 decimals.'],
      optimalTime: 115,
      xpBase: id * 10,
      testCases: [
        { input: `32 4`, expectedOutput: `16.0000`, hidden: false },
        { input: `18 9`, expectedOutput: `6.0000`, hidden: true },
      ],
    });
  }

  if (variant === 2) {
    return makeQuestion({
      id,
      title: `LayerNorm 1D ${id}`,
      description: 'Normalize vector 2 4 6 8 to zero-mean unit-variance and print 4 decimals.',
      difficulty: 'advanced',
      category: 'Phase 15: Mini GPT Integration',
      concepts: ['layernorm', 'statistics'],
      hints: ['Compute mean and std.', 'Output values in same order.'],
      optimalTime: 150,
      xpBase: id * 10,
      testCases: [
        { input: ``, expectedOutput: `-1.3416 -0.4472 0.4472 1.3416`, hidden: false },
        { input: ``, expectedOutput: `-1.3416 -0.4472 0.4472 1.3416`, hidden: true },
      ],
    });
  }

  if (variant === 3) {
    return makeQuestion({
      id,
      title: `Residual Add ${id}`,
      description: 'Read two equal-length vectors and print element-wise sum (residual connection).',
      difficulty: 'advanced',
      category: 'Phase 15: Mini GPT Integration',
      concepts: ['residual', 'vector ops'],
      hints: ['Zip both vectors and add.', 'Print results space-separated.'],
      optimalTime: 105,
      xpBase: id * 10,
      testCases: [
        { input: `1 2 3\n4 5 6`, expectedOutput: `5 7 9`, hidden: false },
        { input: `0 1 0\n1 0 1`, expectedOutput: `1 1 1`, hidden: true },
      ],
    });
  }

  return makeQuestion({
    id,
    title: `Mini GPT Pipeline Step ${id}`,
    description: 'Given token ids, print shifted input ids and target ids for next-token training.',
    difficulty: 'advanced',
    category: 'Phase 15: Mini GPT Integration',
    concepts: ['teacher forcing', 'sequence shift'],
    hints: ['Input sequence excludes last token.', 'Target excludes first token.'],
    optimalTime: 120,
    xpBase: id * 10,
    testCases: [
      { input: `10 20 30 40 50`, expectedOutput: `inputs: 10 20 30 40\ntargets: 20 30 40 50`, hidden: false },
      { input: `1 2 3`, expectedOutput: `inputs: 1 2\ntargets: 2 3`, hidden: true },
    ],
  });
}

function buildExtendedQuestions() {
  const existing = readJson(questionsPath);
  if (!Array.isArray(existing) || existing.length < 100) {
    throw new Error('questions.json must contain at least first 100 questions before extension.');
  }

  const first100 = existing.filter((q) => q.id <= 100).sort((a, b) => a.id - b.id);
  const extended = [];

  for (let id = 101; id <= 130; id++) extended.push(mathQuestion(id));
  for (let id = 131; id <= 160; id++) extended.push(logicQuestion(id));
  for (let id = 161; id <= 190; id++) extended.push(statsQuestion(id));
  for (let id = 191; id <= 220; id++) extended.push(gptBlockQuestion(id));
  for (let id = 221; id <= 250; id++) extended.push(transformerQuestion(id));

  const merged = [...first100, ...extended];
  writeJson(questionsPath, merged);

  const lines = [
    'ZenPy Added Questions (101-250)',
    '================================',
    '',
    ...extended.map((q) => `${q.id}. [${q.difficulty}] ${q.title} — ${q.category}`),
    '',
    `Total questions now: ${merged.length}`,
  ];

  fs.writeFileSync(outputListPath, lines.join('\n'), 'utf8');

  console.log(`Generated ${extended.length} new questions. Total: ${merged.length}`);
  console.log(`Question list saved to: ${outputListPath}`);
}

buildExtendedQuestions();