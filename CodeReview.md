### Name of student that you code reviewed.
- Name:Yucheng Wang
- GitHub ID:BabaYaga-1999


### Things that you noticed
- Did the variable names make sense?
- A: Yes, the variable names are descriptive and make sense. Variables like _errorMessage, _sheetMemory, and _result are clear in their intent. 

- Is the code functional?
- A: The code is functional in terms of TypeScript syntax and logic flow. It passes all given tests. The algorithm to evaluate mathematical expressions adheres to the standard order of operations and uses a stack-based approach, which is a common method for such tasks. However, there are something needed to receive more concerns, for exmaple, the method checks the validity twice, once inside the method and once in isCellReference.

- Are the comments readable?
- A:Yes, the comments are readable and provide good context about the functionality and intent of different sections of the code. However, some parts are overly verbose, and there's a placeholder comment section at the top that doesn't seem relevant and might be confusing.

- Are the function names self-explanatory?
- A: Yes, the function names are mostly self-explanatory. Names like isNumber, isCellReference, and getCellValue clearly indicate their intent. The compute function is slightly ambiguous as it's a general term, but given the context, it's understandable that it's meant to execute mathematical operations.

