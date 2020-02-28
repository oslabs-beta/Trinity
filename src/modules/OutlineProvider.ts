import * as vscode from "vscode";
import { stringify } from "querystring";

import {
  getGraphStructure,
  GraphStructure
} from "../server/neo4j/graphdb-outline-ts";

interface Relation {
  [key: string]: string[];
}

interface ResultObject {
  [index: string]: {
    Properties: string[];
    "Uni-Directional": Relation;
    "Bi-Directional": Relation;
  };
}

interface TreeTypes {
  collapsibleState: Number;
  label: String;
  children?: any;
}

interface Props {
  label: string;
  properties: string[];
}
import * as path from "path";

export class OutlineProvider implements vscode.TreeDataProvider<TreeTask> {
  onDidChangeTreeData?: vscode.Event<TreeTask | null | undefined> | undefined;

  // Given Type from VSCode Extension
  data: TreeTask[];

  constructor(private context: vscode.ExtensionContext) {
    this.data = this.createGraphStructure();
  }

  createResultObj(resultData: GraphStructure) {
    // Create Result Obj
    const resultObj: ResultObject = {};

    for (let i = 0; i < resultData.uniDirectionalRelationship.length; i += 1) {
      // for each unique  item in origin array, create a key on result obj
      let originNodes: string[] =
        resultData.uniDirectionalRelationship[i].originNode;
      let uniRelation: string =
        resultData.uniDirectionalRelationship[i].relationship;
      let dependentNode: string[] =
        resultData.uniDirectionalRelationship[i].dependentNode;
      if (originNodes.length > 0) {
        for (let x = 0; x < originNodes.length; x += 1) {
          if (!resultObj[originNodes[x]]) {
            resultObj[originNodes[x]] = {
              "Uni-Directional": {},
              "Bi-Directional": {},
              Properties: []
            };
          }
          resultObj[originNodes[x]]["Uni-Directional"][
            uniRelation
          ] = dependentNode;
        }
      }
    }
    // For all the bidrectional relationships in the data
    for (let y = 0; y < resultData.biDirectionalRelationship.length; y += 1) {
      // Array of all the origin nodes in relationship object
      let originNodes = resultData.biDirectionalRelationship[y].originNode;
      // Relationship between origin nodes and depenent node
      let biRelation = resultData.biDirectionalRelationship[y].relationship;
      // Array of depend Nodes
      let dependentNode = resultData.biDirectionalRelationship[y].dependentNode;
      // for each origin node
      for (let z = 0; z < originNodes.length; z += 1) {
        // if the node is on the result obj, check if the bi relationship is on the node
        resultObj[originNodes[z]]["Bi-Directional"][biRelation] = dependentNode;
      }
    }

    for (let q = 0; q < resultData.graphOutline.length; q += 1) {
      let nameNode: string = resultData.graphOutline[q].label;
      let propsNode: string[] = resultData.graphOutline[q].properties;

      if (resultObj.nameNode) {
        resultObj.nameNode.Properties = propsNode;
      }
    }

    return resultObj;
  }

  createGraphStructure() {
    // Types for the passwords to the datbases
    const dbAddress: string = "bolt://localhost";
    const username: string = "neo4j";
    const password: string = "test";

    return getGraphStructure(dbAddress, username, password).then(
      (res: GraphStructure | undefined) => {
        if (res !== undefined) {
          //Saves the structure of ResultObject- Type is defined in Result Object
          let newData = [];
          const resultObject: ResultObject = this.createResultObj(res);
          newData = this.setUpData(resultObject);
          // console.log("inside promise", newData);
          // this.data = newData;
          return newData;
        }
      }
    );
  }

  setUpData(resultObj: ResultObject) {
    let array: TreeTypes[] = [];

    Object.keys(resultObj).forEach(element => {
      let elementArray: TreeTypes[] = [];

      Object.keys(resultObj[element]).forEach(innerEl => {
        let innerElArray: TreeTypes[] = [];

        // check if person.uni or properties etc is an array
        if (Array.isArray(resultObj[element][innerEl])) {
          resultObj[element][innerEl].forEach(innerMostEL => {
            innerElArray.push(new TreeTask(innerMostEL));
          });
        } else {
          Object.keys(resultObj[element][innerEl]).forEach(newInnerEl => {
            let dependents = [];

            resultObj[element][innerEl][newInnerEl].forEach(el => {
              dependents.push(new TreeTask(el));
            });

            innerElArray.push(new TreeTask(newInnerEl, dependents));
          });
        }
        let innerTreeTask = new TreeTask(innerEl, innerElArray);

        elementArray.push(innerTreeTask);
      });

      let elementTreeTask = new TreeTask(element, elementArray);
      array.push(elementTreeTask);
    });

    return array;
  }

  show() {
    console.log("show OP");
    vscode.commands.executeCommand("setContext", "trinityOutlineEnabled", true);
  }

  getChildren(
    element?: TreeTask | undefined
  ): vscode.ProviderResult<TreeTask[]> {
    if (element === undefined) {
      return this.data;
    }
    return element.children;
  }

  getTreeItem(element: TreeTask): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }

  // refresh(offset?: number): void {
  //   vscode.window.showInformationMessage("Refresh Triggered");
  //   console.log("refresh triggered");
  //   // this.parseTree();
  //   // if (offset) {
  //   // 	this._onDidChangeTreeData.fire(offset);
  //   // } else {
  //   // 	this._onDidChangeTreeData.fire();
  //   // }
  //   const dbAddress: string = "bolt://localhost";
  //   const username: string = "neo4j";
  //   const password: string = "test";

  //   getGraphStructure(dbAddress, username, password).then(result => {
  //     // all data
  //     const resultData = result;

  //     // interface
  //     interface LooseObject {
  //       [key: string]: any;
  //     }

  //     // Create Result Obj

  //     const resultObj: LooseObject = {};

  //     for (
  //       let i = 0;
  //       i < resultData.uniDirectionalRelationship.length;
  //       i += 1
  //     ) {
  //       // for each unique  item in origin array, create a key on result obj
  //       let originNodes = resultData.uniDirectionalRelationship[i].originNode;
  //       let uniRelation = resultData.uniDirectionalRelationship[i].relationship;
  //       let dependentNode =
  //         resultData.uniDirectionalRelationship[i].dependentNode;
  //       for (let x = 0; x < originNodes.length; x += 1) {
  //         if (!resultObj[originNodes[x]]) {
  //           resultObj[originNodes[x]] = {
  //             "Uni-Directional": {}
  //           };
  //         }
  //         resultObj[originNodes[x]]["Uni-Directional"][
  //           uniRelation
  //         ] = dependentNode;
  //       }
  //     }
  //     // For all the bidrectional relationships in the data
  //     for (let y = 0; y < resultData.biDirectionalRelationship.length; y += 1) {
  //       // Array of all the origin nodes in relationship object
  //       let originNodes = resultData.biDirectionalRelationship[y].originNode;
  //       // Relationship between origin nodes and depenent node
  //       let biRelation = resultData.biDirectionalRelationship[y].relationship;
  //       // Array of depend Nodes
  //       let dependentNode =
  //         resultData.biDirectionalRelationship[y].dependentNode;
  //       // for each origin node
  //       for (let z = 0; z < originNodes.length; z += 1) {
  //         // We check if the result obj has that origin node
  //         if (!resultObj[originNodes[z]]) {
  //           resultObj[originNodes[x]] = {
  //             "Bi-Directional": {}
  //           };
  //         }
  //         // if the node is on the result obj, check if the bi relationship is on the node
  //         if (!resultObj[originNodes[z]]["Bi-Directional"]) {
  //           resultObj[originNodes[z]]["Bi-Directional"] = {};
  //         }
  //         resultObj[originNodes[z]].bi[biRelation] = dependentNode;
  //       }
  //     }

  //     resultData.graphOutline.forEach((element: LooseObject) => {
  //       if (!resultObj[element.label]) {
  //         resultObj[element.label] = {};
  //       }

  //       resultObj[element.label]["Properties"] = element.properties;
  //     });

  //     this.data = [];

  //     Object.keys(resultObj).forEach(element => {
  //       let elementArray = [];

  //       Object.keys(resultObj[element]).forEach(innerEl => {
  //         let innerElArray = [];

  //         // check if person.uni or properties etc is an array
  //         if (Array.isArray(resultObj[element][innerEl])) {
  //           resultObj[element][innerEl].forEach(innerMostEL => {
  //             innerElArray.push(new TreeTask(innerMostEL));
  //           });
  //         } else {
  //           Object.keys(resultObj[element][innerEl]).forEach(newInnerEl => {
  //             let dependents = [];

  //             resultObj[element][innerEl][newInnerEl].forEach(el => {
  //               dependents.push(new TreeTask(el));
  //             });

  //             innerElArray.push(new TreeTask(newInnerEl, dependents));
  //           });
  //         }
  //         let innerTreeTask = new TreeTask(innerEl, innerElArray);

  //         elementArray.push(innerTreeTask);
  //       });

  //       let elementTreeTask = new TreeTask(element, elementArray);
  //       this.data.push(elementTreeTask);
  //     });
  //   });
  // }
}

class TreeTask extends vscode.TreeItem {
  children: TreeTask[] | undefined;

  constructor(label: string, children?: TreeTask[]) {
    const collapsed =
      children === undefined
        ? vscode.TreeItemCollapsibleState.None
        : vscode.TreeItemCollapsibleState.Collapsed;
    super(label, collapsed);
    this.children = children;
  }
}
