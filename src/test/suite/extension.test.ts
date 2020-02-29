import * as assert from "assert";
const { parseExtract } = require("../../modules/parseExtract");
const { extract } = require("../../modules/parseExtract");
const { OutlineProvier } = require("../../modules/OutlineProvier")
//import { expect } from "chai";

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from "vscode";
// import * as myExtension from '../extension';

suite("Extension Test Suite", () => {
  vscode.window.showInformationMessage("Start all tests.");

  test("Sample test", () => {
    assert.equal(-1, [1, 2, 3].indexOf(5));
    assert.equal(-1, [1, 2, 3].indexOf(0));
  });

  test("Extract functionality", () => {
    const extractObj = extract("Trinity('Test') stuff");
    assert.equal(extractObj.queryString, "Test");
    assert.equal(extractObj.currIndex, 14);
  });

  test("parseExtract functionality", () => {
    const queryArray = parseExtract(
      "Trinity('Test') stuff Trinity('anotherTest')"
    );
    assert.equal(queryArray[0], "Test");
    assert.equal(queryArray[1], "anotherTest");
  });
  //Testing OutlineProvier methods
});
