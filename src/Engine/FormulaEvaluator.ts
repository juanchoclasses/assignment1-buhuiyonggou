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

  /**
   * Handle base cases, including parentheses
   * @returns the result of the formula
   */
  private baseCase(): number {
    let result: number = 0;
    // Get the next token from the head of the formula
    let token = this._currentFormula.shift();
    // add numbers to the result and eliminate parentheses
    if (this.isNumber(token)) {
        result = Number(token);
    } else if (this.isCellReference(token)) {
      let [val, error] = this.getCellValue(token);
      // update result through the value of the cell
      result = val ? val : 0;
      if (error) {
        this._errorOccured = true;
        this._errorMessage = error;
      }
  } else if (token === "(") {
        // evaluate the formula inside the parentheses by recursively calling the evaluator
        result = this.evaluator();
        if (this._currentFormula.length === 0 || this._currentFormula.shift() !== ")") {
            this._errorOccured = true;
            this._errorMessage = ErrorMessages.missingParentheses;
        }
    } else {
        this._errorOccured = true;
        this._errorMessage = ErrorMessages.invalidFormula;
    }
    return result;
  }

  /**
   * Handle multiplication and division after basecases are settled
   * @returns the result of the formula
   */
  private multDiv(): number {
    // accumulate the result from basecases
    let result: number = this.baseCase();
    while (this._currentFormula.length > 0 && (this._currentFormula[0] === "*" || this._currentFormula[0] === "/")) {
        let operator = this._currentFormula.shift();
        // get the result of basecase as the current value
        let baseCase: number = this.baseCase();
        if (operator === "*") {
            result *= baseCase;
        } else {
            if (baseCase === 0) {
                this._errorOccured = true;
                this._errorMessage = ErrorMessages.divideByZero;
            }
            result /= baseCase;
        }
    }
    return result;
  }

  /**
   * Handle addition and subtraction after all other operations have been handled
   * @returns the result of the formula
   */
  private evaluator(): number {
    // accumulate the result
    let result: number = this.multDiv();

    while (this._currentFormula.length > 0 && (this._currentFormula[0] === "+" || this._currentFormula[0] === "-")) {
        const operator = this._currentFormula.shift();
        let multDivRes: number = this.multDiv();
        operator === "+" ? result += multDivRes : result -= multDivRes;
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

  evaluate(formula: FormulaType) : number{
    // check for empty formula
    if (formula.length === 0) {
      this._result = 0;
      this._errorMessage = ErrorMessages.emptyFormula;
      return 0;
    }

    // reset the error flags and messages
    this._errorOccured = false;
    this._errorMessage = "";
    // make a copy of the formula and take it as a queue
    this._currentFormula = [...formula];

    this._result = this.evaluator();

    // if there are still non-number tokens in the formula, return an error
    this._currentFormula.length > 0 ? this._errorMessage = ErrorMessages.partial: this._errorOccured = false;

    return this._result;
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