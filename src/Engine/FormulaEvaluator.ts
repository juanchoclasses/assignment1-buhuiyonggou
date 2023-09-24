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

  private evaluator(): number {
    // check for empty formula
    if (this._currentFormula.length === 0) {
        this._errorOccured = true;
        this._errorMessage = ErrorMessages.partial;
    }
    let result: number = 0;
    // Get the next token
    const token = this._currentFormula.shift();

    // get result inside parentheses
    if (this.isNumber(token)) {
        result = parseFloat(token);
        this._lastResult = result;
    } else if (token === "(") {
      // recusivley call the evaluator to get the result inside the parentheses
        result = this.evaluator();
        if (this._currentFormula.length === 0 || this._currentFormula.shift() !== ")") {
            this._errorOccured = true;
            this._errorMessage = ErrorMessages.missingParentheses;
            this._lastResult = result;
        }
    } else if (this.isCellReference(token)) {
        [result, this._errorMessage] = this.getCellValue(token);
        if (this._errorMessage) {
            this._errorOccured = true;
            this._lastResult = result;
        }
    } else {
        this._errorOccured = true;
        this._errorMessage = ErrorMessages.invalidFormula;
    }

    // calculate multiplication and division
    while (this._currentFormula.length > 0 && (this._currentFormula[0] === "*" || this._currentFormula[0] === "/")) {
        const op = this._currentFormula.shift();
        // recursivley call the evaluator to get the result of the next block
        let nextBlock: number = this.evaluator();
        if (op === "*") {
            result *= nextBlock;
        } else {
            if (nextBlock === 0) {
                this._errorOccured = true;
                this._errorMessage = ErrorMessages.divideByZero;
            }
            result /= nextBlock;
        }
    }

    // calculate addition and subtraction
    while (this._currentFormula.length > 0 && (this._currentFormula[0] === "+" || this._currentFormula[0] === "-")) {
        const operator = this._currentFormula.shift();
        // recursivley call the evaluator to get the result of the next term
        let nextRes: number = this.evaluator();
        if (operator === "+") {
            result += nextRes;
        } else {
            result -= nextRes;
        }
    }
    
    return result;
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
    // check for empty formula
    if (formula.length === 0) {
      this._errorMessage = ErrorMessages.emptyFormula;
      this._result = 0;
      return;
    }
    // Clone the formula to modify it
    this._currentFormula = [...formula];
    this._lastResult = 0;

    // reset the error flags and messages
    this._errorOccured = false;
    this._errorMessage = "";

    this._result = this.evaluator();
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