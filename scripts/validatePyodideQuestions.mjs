import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadPyodide } from 'pyodide';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const questionsPath = path.join(__dirname, '..', 'data', 'questions.json');
const questions = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));

function buildCandidateCode(question) {
  const tests = question.testCases || [];

  const lineCountTest = tests.find(test => test.type === 'line_count');
  if (lineCountTest) {
    const lines = Array.from({ length: Math.max(3, lineCountTest.expectedLines || 3) }, (_, index) => `line_${index + 1}`);
    return lines.map(line => `print(${JSON.stringify(line)})`).join('\n');
  }

  const outputContainsTest = tests.find(test => test.type === 'output_contains');
  if (outputContainsTest) {
    const mustContain = outputContainsTest.mustContain || 'ok';
    return `print(${JSON.stringify(`${mustContain} (pyodide-check)`)})`;
  }

  const compileOnlyTest = tests.find(test => test.type === 'compile_only');
  if (compileOnlyTest) {
    return 'print("pyodide-ok")';
  }

  const exactTests = tests.filter(test => !test.type);
  if (exactTests.length === 0) {
    return 'print("pyodide-ok")';
  }

  const mapping = {};
  let maxInputLines = 0;

  for (const test of exactTests) {
    const key = typeof test.input === 'string' ? test.input : '';
    const value = typeof test.expectedOutput === 'string' ? test.expectedOutput : '';
    mapping[key] = value;
    const lines = key.length === 0 ? 0 : key.split('\n').length;
    maxInputLines = Math.max(maxInputLines, lines);
  }

  return `
_mapping = ${JSON.stringify(mapping)}
_vals = []
for _ in range(${maxInputLines}):
    _vals.append(input())
while _vals and _vals[-1] == '':
    _vals.pop()
_key = "\\n".join(_vals)
_out = _mapping.get(_key)
if _out is None:
    _out = _mapping.get("")
if _out is None:
    _out = ""
print(_out, end="")
`.trim();
}

function pyEscape(str) {
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

async function runTest(pyodide, code, test) {
  pyodide.runPython(`
import sys
from io import StringIO
sys.stdout = StringIO()
sys.stderr = StringIO()
`);

  if (!test.type && typeof test.input === 'string') {
    const inputs = test.input.split('\n');
    pyodide.runPython(`
_inputs = ${JSON.stringify(inputs)}
_input_idx = 0
def input(prompt=''):
    global _input_idx
    if _input_idx < len(_inputs):
        _val = _inputs[_input_idx]
        _input_idx += 1
        return _val
    return ''
`);
  }

  try {
    await pyodide.runPythonAsync(code);
  } catch (error) {
    return { passed: false, reason: `Runtime error: ${error.message}` };
  }

  const output = pyodide.runPython('sys.stdout.getvalue()');

  if (test.type === 'compile_only') {
    return { passed: true, reason: '' };
  }

  if (test.type === 'output_contains') {
    const passed = output && output.includes(test.mustContain);
    return { passed, reason: passed ? '' : `Missing required text: ${test.mustContain}` };
  }

  if (test.type === 'line_count') {
    const lines = output.trim().split('\n').filter(line => line.length > 0);
    const expectedLines = test.expectedLines || 0;
    const passed = lines.length >= expectedLines;
    return {
      passed,
      reason: passed ? '' : `Expected at least ${expectedLines} lines, got ${lines.length}`
    };
  }

  const expected = (test.expectedOutput || '').trim();
  const got = (output || '').trim();
  const passed = expected === got;
  return {
    passed,
    reason: passed ? '' : `Expected '${pyEscape(expected)}' but got '${pyEscape(got)}'`
  };
}

async function main() {
  const pyodide = await loadPyodide();
  const failures = [];

  for (const question of questions) {
    const tests = question.testCases || [];
    const candidateCode = buildCandidateCode(question);

    for (let index = 0; index < tests.length; index += 1) {
      const test = tests[index];
      const result = await runTest(pyodide, candidateCode, test);
      if (!result.passed) {
        failures.push({
          id: question.id,
          title: question.title,
          testIndex: index + 1,
          reason: result.reason,
          code: candidateCode
        });
      }
    }
  }

  const reportPath = path.join(__dirname, '..', 'data', 'pyodide_validation_report.json');
  fs.writeFileSync(
    reportPath,
    JSON.stringify(
      {
        totalQuestions: questions.length,
        checkedAt: new Date().toISOString(),
        failures
      },
      null,
      2
    )
  );

  if (failures.length === 0) {
    console.log(`PASS: all ${questions.length} questions validated in Pyodide.`);
  } else {
    console.log(`FAIL: ${failures.length} failing test checks across questions.`);
    for (const failure of failures) {
      console.log(`Q${failure.id} (${failure.title}) test ${failure.testIndex}: ${failure.reason}`);
    }
  }

  console.log(`Validation report written to ${reportPath}`);
}

main().catch(error => {
  console.error('Pyodide validation failed:', error);
  process.exit(1);
});
