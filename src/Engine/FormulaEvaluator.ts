import Cell from "./Cell"
import SheetMemory from "./SheetMemory"
import { ErrorMessages } from "./GlobalDefinitions";



export class FormulaEvaluator {
  // Define a function called update that takes a string parameter and returns a number
  private _errorOccured: boolean = false;
  private _errorMessage: string = "";
  private _currentFormula: FormulaType = [];
  private _lastResult: number = 0;
  private _sheetMemory: SheetMemory;
  private _result: number = 0;


  constructor(memory: SheetMemory) {
    this._sheetMemory = memory;
  }

  private shuntingYard(tokens: TokenType[]): TokenType[] {
    const output: TokenType[] = [];
    const ops: TokenType[] = [];

    for (const token of tokens) {
        if (this.isNumber(token) || this.isCellReference(token)) {
            output.push(token);
        } else if ('+-*/'.includes(token)) {
            while (ops.length && this.precedence(token) <= this.precedence(ops[ops.length - 1])) {
                output.push(ops.pop()!);
            }
            ops.push(token);
        } else if (token === '(') {
            ops.push(token);
        } else if (token === ')') {
            while (ops.length && ops[ops.length - 1] !== '(') {
                output.push(ops.pop()!);
            }
            ops.pop(); // pop '('
        }
    }
    while (ops.length) {
        output.push(ops.pop()!);
    }
    return output;
}

private precedence(op: TokenType): number {
    if (op === '+' || op === '-') return 1;
    if (op === '*' || op === '/') return 2;
    return 0;
}

private evaluatePostfix(tokens: TokenType[]): number {
    const stack: number[] = [];
    for (const token of tokens) {
        if (this.isNumber(token)) {
            stack.push(Number(token));
        } else if (this.isCellReference(token)) {
            const [value, error] = this.getCellValue(token);
            if (error) {
                throw new Error(error);
            }
            stack.push(value);
        } else {
            const b = stack.pop()!;
            const a = stack.pop()!;
            if (token === '+') stack.push(a + b);
            else if (token === '-') stack.push(a - b);
            else if (token === '*') stack.push(a * b);
            else if (token === '/') {
                if (b === 0) throw new Error(ErrorMessages.divideByZero);
                stack.push(a / b);
            }
        }
    }
    return stack[0];
}

  /**
    * place holder for the evaluator.   I am not sure what the type of the formula is yet 
    * I do know that there will be a list of tokens so i will return the length of the array
    * 
    * I also need to test the error display in the front end so i will set the error message to
    * the error messages found In GlobalDefinitions.ts
    * 
    * according to this formula.
    * 
    7 tokens partial: "#ERR",
    8 tokens divideByZero: "#DIV/0!",
    9 tokens invalidCell: "#REF!",
  10 tokens invalidFormula: "#ERR",
  11 tokens invalidNumber: "#ERR",
  12 tokens invalidOperator: "#ERR",
  13 missingParentheses: "#ERR",
  0 tokens emptyFormula: "#EMPTY!",

                    When i get back from my quest to save the world from the evil thing i will fix.
                      (if you are in a hurry you can fix it yourself)
                               Sincerely 
                               Bilbo
    * 
   */

  evaluate(formula: FormulaType) {


    // set the this._result to the length of the formula

    this._result = formula.length;
    this._errorMessage = "";

    switch (formula.length) {
      case 0:
        this._errorMessage = ErrorMessages.emptyFormula;
        break;
      case 7:
        this._errorMessage = ErrorMessages.partial;
        break;
      case 8:
        this._errorMessage = ErrorMessages.divideByZero;
        break;
      case 9:
        this._errorMessage = ErrorMessages.invalidCell;
        break;
      case 10:
        this._errorMessage = ErrorMessages.invalidFormula;
        break;
      case 11:
        this._errorMessage = ErrorMessages.invalidNumber;
        break;
      case 12:
        this._errorMessage = ErrorMessages.invalidOperator;
        break;
      case 13:
        this._errorMessage = ErrorMessages.missingParentheses;
        break;
      default:
        this._errorMessage = "";
        break;
    }
  }

  public get error(): string {
    return this._errorMessage
  }

  public get result(): number {
    return this._result;
  }




  /**
   * 
   * @param token 
   * @returns true if the toke can be parsed to a number
   */
  isNumber(token: TokenType): boolean {
    return !isNaN(Number(token));
  }

  /**
   * 
   * @param token
   * @returns true if the token is a cell reference
   * 
   */
  isCellReference(token: TokenType): boolean {

    return Cell.isValidCellLabel(token);
  }

  /**
   * 
   * @param token
   * @returns [value, ""] if the cell formula is not empty and has no error
   * @returns [0, error] if the cell has an error
   * @returns [0, ErrorMessages.invalidCell] if the cell formula is empty
   * 
   */
  getCellValue(token: TokenType): [number, string] {

    let cell = this._sheetMemory.getCellByLabel(token);
    let formula = cell.getFormula();
    let error = cell.getError();

    // if the cell has an error return 0
    if (error !== "" && error !== ErrorMessages.emptyFormula) {
      return [0, error];
    }

    // if the cell formula is empty return 0
    if (formula.length === 0) {
      return [0, ErrorMessages.invalidCell];
    }


    let value = cell.getValue();
    return [value, ""];

  }


}

export default FormulaEvaluator;