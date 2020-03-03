import * as assert from "assert";

const { parseExtract } = require("../../modules/parseExtract");
const { extract } = require("../../modules/parseExtract");
const { OutlineProvider } = require("../../modules/OutlineProvider");

//import { expect } from "chai";

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from "vscode";
// import * as myExtension from '../extension';

suite("Extension Test Suite", () => {
  vscode.window.showInformationMessage("Start all tests.");

  const exResultData = {
    graphOutline: [
      { label: "Movie", properties: ["title", "tagline", "released"] },
      { label: "Person", properties: ["born", "name"] }
    ],
    uniDirectionalRelationship: [
      {
        originNode: ["Person"],
        relationship: "ACTED_IN",
        dependentNode: ["Movie"]
      },
      {
        originNode: ["Person"],
        relationship: "ACTED_IN",
        dependentNode: ["Movie"]
      }
    ],
    biDirectionalRelationship: []
  };

  const testConfig = {
    dbAddress: "bolt://localhost",
    username: "neo4j",
    password: "test"
  };

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

  const outlineProvider = new OutlineProvider(undefined, testConfig);
  const exResultObj = outlineProvider.createResultObj(exResultData);

  test("OutlineProvider class", () => {
    assert.equal(exResultObj.Person.Properties[0], "born");
    assert.equal(exResultObj.Movie.Properties[1], "tagline");
    assert.equal(exResultObj.Person["Uni-Directional"].ACTED_IN[0], "Movie");
  });

  // testing setUpData method

  const treeData = outlineProvider.setUpData(exResultObj);

  test("setUpData method", () => {
    assert.equal(treeData[0].label, "Person");
    assert.equal(treeData[0].children[0].label, "Uni-Directional");
    assert.equal(treeData[0].children[0].children[0].label, "ACTED_IN");
    assert.equal(
      treeData[0].children[0].children[0].children[0].label,
      "Movie"
    );
  });
});
