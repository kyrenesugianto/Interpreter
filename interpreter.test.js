"use strict";

const assert = require("assert");
const { parseExpression, parseProgram } = require("../include/parser.js");
const {
  interpExpression,
  interpProgram,
  interpStatement,
} = require("./interpreter.js");

test("interpExpression interprets multiplication with a variable", () => {
  const r = interpExpression({ x: 10 }, parseExpression("x * 2").value);

  assert(r === 20);
});

test("interpProgram interprets basic declaration then assignment", () => {
  const st = interpProgram(parseProgram("let x = 10; x = 20;").value);

  assert(st.x === 20);
});

function sqrt(n) {
  if (n < 0) {
    throw new error("Input must be positive or zero.");
  }
  // do some iterations of Newton's method
  let x = 1;
  for (let i = 0; i < 10; i++) {
    x = (x + n / x) / 2;
  }
  return x;
}

test("sqrt fails on invalid input", () => {
  expect(() => {
    sqrt(-1);
  }).toThrow();
});

test("sqrt works on valid input", () => {
  expect(sqrt(9)).toBe(3);
});

test("interpProgram works works on a simple program", () => {
  let test1 = interpProgram([
    {
      kind: "let",
      name: "x",
      expression: {
        kind: "number",
        value: 10,
      },
    },
    {
      kind: "if",
      test: {
        kind: "operator",
        op: ">",
        e1: {
          kind: "variable",
          name: "x",
        },
        e2: {
          kind: "number",
          value: 5,
        },
      },
      truePart: [
        {
          kind: "assignment",
          name: "x",
          expression: {
            kind: "number",
            value: 5,
          },
        },
        {
          kind: "let",
          name: "x",
          expression: {
            kind: "number",
            value: 2,
          },
        },
      ],
      falsePart: [],
    },
  ]);
  expect(test1).toEqual({ x: 5 });
});

test("interpProgram works on a program with variable assignment in while block", () => {
  let test2 = interpProgram([
    {
      kind: "let",
      name: "x",
      expression: {
        kind: "number",
        value: 10,
      },
    },
    {
      kind: "while",
      test: {
        kind: "operator",
        op: ">",
        e1: {
          kind: "variable",
          name: "x",
        },
        e2: {
          kind: "number",
          value: 0,
        },
      },
      body: [
        {
          kind: "assignment",
          name: "x",
          expression: {
            kind: "operator",
            op: "-",
            e1: {
              kind: "variable",
              name: "x",
            },
            e2: {
              kind: "number",
              value: 1,
            },
          },
        },
      ],
    },
  ]);
  expect(test2).toEqual({ x: 0 });
});

// test interpStatement throws error with undefined name
test("interpStatement throws error with undefined name", () => {
  expect(() => {
    interpStatement({}, { kind: "assignment", name: "x", expression: 10 });
  }).toThrow();
});

// test interpProgram with nested while loops
test("interpProgram works on a program with nested while loops", () => {
  let test3 = interpProgram([
    {
      kind: "let",
      name: "x",
      expression: {
        kind: "number",
        value: 10,
      },
    },
    {
      kind: "while",
      test: {
        kind: "operator",
        op: ">",
        e1: {
          kind: "variable",
          name: "x",
        },
        e2: {
          kind: "number",
          value: 0,
        },
      },
      body: [
        {
          kind: "while",
          test: {
            kind: "operator",
            op: ">",
            e1: {
              kind: "variable",
              name: "x",
            },
            e2: {
              kind: "number",
              value: 0,
            },
          },
          body: [
            {
              kind: "assignment",
              name: "x",
              expression: {
                kind: "operator",
                op: "-",
                e1: {
                  kind: "variable",
                  name: "x",
                },
                e2: {
                  kind: "number",
                  value: 1,
                },
              },
            },
          ],
        },
      ],
    },
  ]);
  expect(test3).toEqual({ x: 0 });
});

// test interpStatement throws an error with undefined name
test("interpStatement throws an error with undefined name", () => {
  expect(() => {
    interpStatement({}, { kind: "assignment", name: 1, expression: 10 });
  }).toThrow();
});

// test interpStatement throws an error when the statement kind is not let, assignment, if, while, print
test("interpStatement throws an error when the statement kind valid", () => {
  expect(() => {
    interpStatement({}, { kind: "test", name: "x", expression: 10 });
  }).toThrow();
});

// test interpExpression throws an error when the expression kind is not boolean, number, variable, operator
test("interpExpression throws an error when the expression kind is not valid", () => {
  expect(() => {
    interpExpression({}, { kind: "test", name: "x", expression: 10 });
  }).toThrow();
});

// test interpStatement throws an error when the statement name is undefined
test("interpStatement throws an error when the statement name is undefined", () => {
  expect(() => {
    interpStatement({}, { kind: "assignment", name: "x", expression: 10 });
  }).toThrow();
});

// test interpStatement throws an error with undefined name
test("interpStatement throws an error with undefined name", () => {
  expect(() => {
    interpStatement({}, { kind: "assignment", name: 1, expression: 10 });
  }).toThrow();
});
