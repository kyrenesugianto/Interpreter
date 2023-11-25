"use strict";

// type State = { [key: string]: State | number | boolean };

// interpExpression(state: State, e: Expr): number | boolean
function interpExpression(state, expr) {
  // TODO

  //validate the state
  if (typeof state !== "object") {
    throw new Error("Invalid state - interpExpression");
  }
  /*
    type Expr = { kind: "boolean"; value: boolean }
      | { kind: "number"; value: number }
      | { kind: "variable"; name: string }
      | { kind: "operator"; op: BinOp; e1: Expr; e2: Expr };
  */
  //validate the expr
  let kinds = ["boolean", "number", "variable", "operator"];
  if (
    expr.kind !== "boolean" &&
    expr.kind !== "number" &&
    expr.kind !== "variable" &&
    expr.kind !== "operator"
  ) {
    throw new Error("Invalid expression");
  }

  // if the expr is not of kind "boolean", "number", "variable", or "operator", throw error
  if (!kinds.includes(expr.kind)) {
    throw new Error("Invalid Expression");
  }
  if (kinds.includes(expr.kind)) {
    switch (expr.kind) {
      case "boolean":
        return expr.value;
      case "number":
        return expr.value;
      case "variable":
        //find and return value from state
        let found = findVariable(state, expr.name);
        if (found) {
          return getValue(state, expr.name);
        } else {
          throw new Error("Variable not found");
        }
        break;
      case "operator":
        let v1 = interpExpression(state, expr.e1);
        let v2 = interpExpression(state, expr.e2);
        //check to make sure v1 and v2 has the same type
        if (typeof v1 !== typeof v2) {
          throw new Error("Unmatched argument types");
        }

        if (expr.op === "===") {
          if (typeof v1 === typeof v2) {
            return v1 === v2;
          } else {
            throw new Error("Unmatched argument types");
          }
        } else if (["||", "&&"].includes(expr.op)) {
          //check to make sure v1 and v2 are boolean
          /*if (typeof v1 !== "boolean" || typeof v2 !== "boolean") {
            throw new Error("Invalid arguments for boolean operation");
          }*/
          if (typeof v1 === "boolean" && typeof v2 === "boolean") {
            switch (expr.op) {
              case "||":
                return v1 || v2;
              case "&&":
                return v1 && v2;
            }
          } else {
            throw new Error("Invalid arguments for boolean operation");
          }
        } else {
          //check to make sure v1 and v2 are number
          /*if (!(typeof v1 === "number" && typeof v2 === "number")) {
            throw new Error("Invalid arguments for number operation");
          }*/
          if (typeof v1 === "number" && typeof v2 === "number") {
            switch (expr.op) {
              case "*":
                return v1 * v2;
              case "/":
                return v1 / v2;
              case "+":
                return v1 + v2;
              case "-":
                return v1 - v2;
              case "<":
                return v1 < v2;
              case ">":
                return v1 > v2;
            }
          } else {
            throw new Error("Invalid arguments for number operation");
          }
        }
        break;
    }
  } else {
    throw new Error("Invalid Expression");
  }
}

// helper findVariable(state: State, name: string): boolean
function findVariable(state, name) {
  //validate the state
  if (typeof state !== "object") {
    throw new Error("Invalid state - findVariable");
  }
  // if name is not a string, throw error
  if (typeof name !== "string") {
    throw new Error("Invalid variable name");
  }
  // traverse the states to find the variable and return true if found
  if (state.hasOwnProperty(name)) {
    return true;
  }
  if (typeof state.o1 === "object") {
    return findVariable(state.o1, name);
  }
  return false;
}

//helper getValue(state: State, varName: string): number|boolean
function getValue(state, varName) {
  //validate the state
  if (typeof state !== "object") {
    throw new Error("Invalid state - getValue");
  }
  if (state.hasOwnProperty(varName)) {
    return state[varName];
  }
  // if varName is not a string, throw error
  if (typeof varName !== "string") {
    throw new Error("Invalid variable name");
  }
  //if we could not find the variable in the current scope, we go outward to outer state (o1)
  if (typeof state.o1 === "object") {
    return getValue(state.o1, varName);
  }
}

//helper function setValue(state: State, varName: string, value: number|boolean)
//updates variable starting with current scope, searching outward
function setValue(state, varName, value) {
  //validate the state
  if (typeof state !== "object") {
    throw new Error("Invalid state - setValue");
  }
  // if variable name is undefined, throw error
  if (typeof varName === "undefined") {
    throw new Error("Variable name is undefined");
  }
  // if variable name is not a string, throw error
  if (typeof varName !== "string") {
    throw new Error("Invalid variable name");
  }
  //if we found the variable in the current state, then update it and return
  if (state.hasOwnProperty(varName)) {
    state[varName] = value;
    return;
  }
  if (typeof state.o1 === "object") {
    return setValue(state.o1, varName, value);
  }
}

//interpStatement(state: State, p: Stmt): State
function interpStatement(state, stmt) {
  /*
    type Stmt = { kind: "let"; name: string; expression: Expr }
      | { kind: "assignment"; name: string; expression: Expr }
      | { kind: "if"; test: Expr; truePart: Stmt[]; falsePart: Stmt[] }
      | { kind: "while"; test: Expr; body: Stmt[] }
      | { kind: "print"; expression: Expr };
  */
  //validate the state
  if (typeof state !== "object") {
    throw new Error("Invalid state - interpStatement");
  }

  // throw error if type of name is not string
  if (stmt.name && typeof stmt.name !== "string") {
    throw new Error("Invalid name");
  }

  //validate the stmt
  let kinds = ["let", "assignment", "if", "while", "print"];
  if (
    stmt.kind !== "if" &&
    stmt.kind !== "while" &&
    stmt.kind !== "print" &&
    stmt.kind !== "let" &&
    stmt.kind !== "assignment"
  ) {
    throw new Error("Invalid statement");
  }

  // Given a state object and an AST of a statement, interpStatement updates the State object and returns it
  switch (stmt.kind) {
    case "let":
      //check if the variable exists - throw error if true
      if (state.hasOwnProperty(stmt.name)) {
        throw new Error("Let error - variable is already defined");
      }
      //if the variable doesn't exist in the current scope, define a new one
      let val1 = interpExpression(state, stmt.expression);
      state[stmt.name] = val1;
      break;
    case "assignment":
      //check if the variable exists - throw error if false
      let val2 = interpExpression(state, stmt.expression);
      setValue(state, stmt.name, val2);
      break;
    //}
    case "if":
      let val3 = interpExpression(state, stmt.test);
      if (typeof val3 !== "boolean") {
        throw new Error("If error - test condition is not boolean");
      }
      if (val3) {
        return interpBlock(state, stmt.truePart);
      } else {
        return interpBlock(state, stmt.falsePart);
      }
    case "while":
      while (interpExpression(state, stmt.test)) {
        interpBlock(state, stmt.body);
      }
      break;
    case "print":
      let val4 = interpExpression(state, stmt.expression);
      console.log(val4);
      break;
    default:
      throw new Error("Invalid statement");
  }
  return state;
}

//interBlock(state: State, b: block ) : State
//NOTE: specifically called the outer state o1.  This will be reference when we call setValue() and getValue()
function interpBlock(state, p) {
  //validate the state
  if (typeof state !== "object") {
    throw new Error("Invalid state - interpBlock");
  }
  state = { o1: state };
  for (let i = 0; i < p.length; ++i) {
    interpStatement(state, p[i]);
  }
  state = state.o1;
  return state;
}

// interpProgram(p: Stmt[]): State
function interpProgram(p) {
  let st = {};
  for (let i = 0; i < p.length; ++i) {
    st = interpStatement(st, p[i]);
  }
  return st;
}

// DO NOT REMOVE
module.exports = {
  interpExpression,
  interpStatement,
  interpProgram,
};
