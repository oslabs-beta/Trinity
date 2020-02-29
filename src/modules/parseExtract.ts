function parseExtract(string: string): Array<string | boolean> {
  // Array for storing the Queries inside the string
  let array: Array<string | boolean> = [];

  // Find queries inside of string, push them on to array
  const findQuery = (string: string) => {
    // find the location of trinity in the string
    const tlocation: number = string.search("Trinity");
    // console.log(tlocation);

    // if 0, Trinity hasn't been typed into the string
    if (tlocation !== -1) {
      // Create new string, which will be result of slicing from 'T' in Trinity
      let newString: string = string.slice(tlocation, string.length);
      // console.log(newString);

      //Create new variable for the query and end location
      //extract(newString) returns an array
      let queryNLocation: {
        queryString: string | boolean;
        currIndex: number;
      } = extract(newString);

      // push the query onto the main array
      array.push(queryNLocation.queryString);

      // recursively call the function find Query on the new string based on the location
      let remainingString: string = newString.slice(
        queryNLocation.currIndex + 1
      );

      // recursively call the function on the new string
      findQuery(remainingString);
    }
  };

  //passing newString in to extract

  findQuery(string);

  return array;
}

const extract = (
  string: string
): { queryString: string | boolean; currIndex: number } => {
  const brackets: { [key: string]: string } = {
    "[": "PUSH TO STACK",
    "{": "PUSH TO STACK",
    "(": "PUSH TO STACK",
    "'": "'",
    '"': '"',
    "`": "`",
    "]": "[",
    "}": "{",
    ")": "("
  };

  // extract the query
  let stack: Array<string> = [string[8]];
  let currIndex: number = 9;
  let queryString: string | boolean = "";

  // iterate until empty the stack, or find incorrect brackets
  while (stack.length > 0) {
    // store current char
    const currChar: string = string[currIndex];
    // store the brack[curChar]
    const bracket: string | undefined = brackets[currChar];
    // If the variable in brackets obj
    // CASE: Not a bracket => Go to next loop
    if (!bracket) {
      queryString += currChar;
      currIndex += 1;
      continue;
    }
    // CASE: PUSH TO STACK => Push it to the stack
    else if (bracket === "PUSH TO STACK") {
      stack.push(currChar);
    }
    // CASE: Else => pop it
    // CASE: currChar is quote and top of stack is not the same quote -> push it to stack
    else if (currChar === '"' || currChar === "'" || currChar === "`") {
      // CASE: currChar is quote and top of stack is the same quote -> pop from stack
      if (stack[stack.length - 1] === currChar) {
        stack.pop();
      } else {
        stack.push(currChar);
      }
    }
    // CASE: Closing Bracket & compliments top of stack -> pop from stack
    else if (currChar === "]" || currChar === "}" || currChar === ")") {
      if (stack[stack.length - 1] === bracket) {
        stack.pop();
      } else {
        // CASE: Closing Bracket &  does not compliment top of stack -> return false and curr location
        queryString = false;
        break;
      }
    }
    // prepare for next iteration
    currIndex += 1;
    if (stack.length > 0) {
      queryString += currChar;
    }
  }

  return {
    queryString: queryString,
    currIndex: currIndex
  };
};

module.exports = { parseExtract, extract };
