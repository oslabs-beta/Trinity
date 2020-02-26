import * as vscode from "vscode";
import * as path from "path";

const { getGraphStructure } = require("../server/neo4j/graphdb-outline-ts");

export class OutlineProvider implements vscode.TreeDataProvider<TreeTask> {
  onDidChangeTreeData?: vscode.Event<TreeTask | null | undefined> | undefined;

  data: TreeTask[];

  constructor(private context: vscode.ExtensionContext) {
    const dbAddress: string = "bolt://localhost";
    const username: string = "neo4j";
    const password: string = "test";

    getGraphStructure(dbAddress, username, password).then(result => {
      // all data
      const resultData = result;

      // interface
      interface LooseObject {
        [key: string]: any;
      }

      // Create Result Obj

      const resultObj: LooseObject = {};

      for (
        let i = 0;
        i < resultData.uniDirectionalRelationship.length;
        i += 1
      ) {
        // for each unique  item in origin array, create a key on result obj
        let originNodes = resultData.uniDirectionalRelationship[i].originNode;
        let uniRelation = resultData.uniDirectionalRelationship[i].relationship;
        let dependentNode =
          resultData.uniDirectionalRelationship[i].dependentNode;
        for (let x = 0; x < originNodes.length; x += 1) {
          if (!resultObj[originNodes[x]]) {
            resultObj[originNodes[x]] = {
              "Uni-Directional": {}
            };
          }
          resultObj[originNodes[x]]["Uni-Directional"][
            uniRelation
          ] = dependentNode;
        }
      }
      // For all the bidrectional relationships in the data
      for (let y = 0; y < resultData.biDirectionalRelationship.length; y += 1) {
        // Array of all the origin nodes in relationship object
        let originNodes = resultData.biDirectionalRelationship[y].originNode;
        // Relationship between origin nodes and depenent node
        let biRelation = resultData.biDirectionalRelationship[y].relationship;
        // Array of depend Nodes
        let dependentNode =
          resultData.biDirectionalRelationship[y].dependentNode;
        // for each origin node
        for (let z = 0; z < originNodes.length; z += 1) {
          // We check if the result obj has that origin node
          if (!resultObj[originNodes[z]]) {
            resultObj[originNodes[x]] = {
              "Bi-Directional": {}
            };
          }
          // if the node is on the result obj, check if the bi relationship is on the node
          if (!resultObj[originNodes[z]]["Bi-Directional"]) {
            resultObj[originNodes[z]]["Bi-Directional"] = {};
          }
          resultObj[originNodes[z]].bi[biRelation] = dependentNode;
        }
      }

      resultData.graphOutline.forEach((element: LooseObject) => {
        if (!resultObj[element.label]) {
          resultObj[element.label] = {};
        }

        resultObj[element.label]["Properties"] = element.properties;
      });

      this.data = [];

      Object.keys(resultObj).forEach(element => {
        let elementArray = [];

        Object.keys(resultObj[element]).forEach(innerEl => {
          let innerElArray = [];

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
        this.data.push(elementTreeTask);
      });
    });
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

  refresh(offset?: number): void {
    vscode.window.showInformationMessage("Refresh Triggered");
    console.log("refresh triggered");
    // this.parseTree();
    // if (offset) {
    // 	this._onDidChangeTreeData.fire(offset);
    // } else {
    // 	this._onDidChangeTreeData.fire();
    // }
  }

  private getIcon(node: json.Node): any {
    let nodeType = node.type;
    if (nodeType === "boolean") {
      return {
        light: this.context.asAbsolutePath(
          path.join("resources", "light", "boolean.svg")
        ),
        dark: this.context.asAbsolutePath(
          path.join("resources", "dark", "boolean.svg")
        )
      };
    }
    if (nodeType === "string") {
      return {
        light: this.context.asAbsolutePath(
          path.join("resources", "light", "string.svg")
        ),
        dark: this.context.asAbsolutePath(
          path.join("resources", "dark", "string.svg")
        )
      };
    }
    if (nodeType === "number") {
      return {
        light: this.context.asAbsolutePath(
          path.join("resources", "light", "number.svg")
        ),
        dark: this.context.asAbsolutePath(
          path.join("resources", "dark", "number.svg")
        )
      };
    }
    return null;
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
