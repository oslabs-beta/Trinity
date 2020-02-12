

function parseExtract (string) {

// Array for storing the Queries inside the string
let array = [];

  //passing newString in to extract
  const extract = (string) => {
 

    //variable for queryString
    let queryString = '';

    // extract the query
    let count = 9;
    const stack = [];
    stack.push(string[8]); 

    while(stack.length !== 0){
      
      switch(string[count]){
        case '[': 
        case '(':
        case '{':
        stack.push(string[count]);
        queryString += string[count];

        case ']':
          if (stack.pop() !== '['){
            console.log("error")
          }
          queryString += string[count];
        case ')':
          if(stack.pop() !== '('){
            console.log("error")

          };
          queryString += string[count];

        case '}':
          if(stack.pop() !== '{'){
            console.log("error")

          };
          queryString += string[count];

        case "\"" :
           console.log("here")
          let element = stack.pop()
          if( element !== '\"'){
            console.log("error")
          }        
        default:
          queryString += string[count];
      }

      count+=1;

    }
    // find the location of the end of the query
    console.log(queryString);
    // returns an array of the query and the location of the end of the query
    return [queryString, count+1];
  };

  // Find queries inside of string, push them on to array
  const findQuery = (string) => {

    // find the location of trinity in the string
    const tlocation = string.search('Trinity');

    // if 0, Trinity hasn't been typed into the string
    if (tlocation !== 0){
      // Create new string, which will be result of slicing from 'T' in Trinity
      let newString = string.slice(tlocation, string.length);


      //Create new variable for the query and end location
      //extract(newString) returns an array
      let queryNLocation = extract(newString);

      // push the query onto the main array
      array.push(queryNLocation[0]);


      // recursively call the function find Query on the new string based on the location 
      let remainingString = newString.slice(queryNLocation[1]+1);
      console.log(remainingString)
   
      // recursively call the function on the new string
      findQuery(remainingString);

    } else {
      return
    }
  };


  findQuery(string);

return array;

}

const stringer = `
// Implement an algorithm to determine if a string has all unique characters. What if you cannot use additional Data structures?
// brute force, loop through string checking each item against every item in the string 

function unique(string){
    let result = true;

    for ( let i = 0; i <string.length; i += 1){
        for ( let x = 0; x<string.length; x += 1){
            if (string[i] === string[x]){
                result = false
            }

        }
    }
    //returns a boolean. true if entire string is unique and false if not unique
    return result
}

console.log(unique('apples'))
console.log(unique("asdfgh"))

Trinity("This is the query")`;


console.log(parseExtract(stringer));







module.exports = parseExtract