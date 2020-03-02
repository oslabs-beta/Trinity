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
  // //<TreeTask> {
  // onDidChangeTreeData?: vscode.Event<TreeTask | null | undefined> | undefined;
  private _onDidChangeTreeData: vscode.EventEmitter<TreeTask | null> = new vscode.EventEmitter<TreeTask | null>();
  readonly onDidChangeTreeData: vscode.Event<TreeTask | null> = this
    ._onDidChangeTreeData.event;

  // Given Type from VSCode Extension
  data: TreeTask[] = [];

  //? must change types when config interface is defined
  config: any;
  constructor(private context: vscode.ExtensionContext, config: any) {
    // this.data =
    this.config = config;
    this.createGraphStructure();
  }

  createResultObj(resultData: GraphStructure) {
    // Create Result Obj
    const resultObj: ResultObject = {};

    // console.log("CRO, Input:", resultData);

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

      if (!resultObj[nameNode]) {
        resultObj[nameNode] = {
          "Uni-Directional": {},
          "Bi-Directional": {},
          Properties: []
        };
      }

      if (resultObj[nameNode]) {
        resultObj[nameNode].Properties = propsNode;
      }
    }

    return resultObj;
  }

  createGraphStructure() {

    const boundGetGraphStructure = getGraphStructure.bind(this);

    boundGetGraphStructure(
      this.config.dbAddress,
      this.config.username,
      this.config.password
    ).then((res: GraphStructure | undefined) => {
      if (res !== undefined) {
        //Saves the structure of ResultObject- Type is defined in Result Object
        // let newData = [];
        const resultObject: ResultObject = this.createResultObj(res);

        console.log(resultObject);

        this.data = this.setUpData(resultObject);
        this._onDidChangeTreeData.fire();
        // console.log("inside promise", newData);
        // this.data = newData;
        // return newData;
      }
    });
  }

  setUpData(resultObj: ResultObject) {
    let array: TreeTask[] = [];

    // For each Node in result Object
    Object.keys(resultObj).forEach(element => {
      let elementArray: TreeTask[] = [];

      // For each Item inside node of Result Objectresult Object
      Object.keys(resultObj[element]).forEach(innerEl => {
        let innerElArray: TreeTask[] = [];

        // check if person.uni or properties etc is an array
        if (innerEl === "Properties") {
          resultObj[element].Properties.forEach(innerMostEL => {
            innerElArray.push(new TreeTask(innerMostEL));
          });
        } else {
          if (innerEl === "Bi-Directional" || innerEl === "Uni-Directional") {
            if (resultObj[element][innerEl] !== undefined) {
              Object.keys(resultObj[element][innerEl]).forEach(newInnerEl => {
                let dependents: TreeTask[] = [];

                resultObj[element][innerEl][newInnerEl].forEach(el => {
                  dependents.push(new TreeTask(el));
                });

                innerElArray.push(new TreeTask(newInnerEl, dependents));
              });
            }
          }
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
