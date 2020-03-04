import * as vscode from "vscode";
import {
  getGraphStructure,
  GraphStructure
} from "../server/neo4j/graphdb-outline-ts";

/**
 * Relation: Interface for all properties and dependent nodes
 *
 * ResultObject: Interface for all nodes and their properties and relationships
 *
 */

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

/**
 *
 * OutlineProvider Class: Models outline structure utlilizing both VSCode methods and our own methods. Within this object
 * an asyncronous call is made to database, after which we used the createResultObj method to format our data.
 * Finally, we use the TreeTask class to create the exact format for VSCode to provide an outline view.
 *
 * TreeTask Class: Extends vscode tree item and allows us to create types for the specific items that will make up our outline view
 *
 */
export class OutlineProvider implements vscode.TreeDataProvider<TreeTask> {
  // The following methods must be fired whenever tree data changes in order to see the change in our outline view
  // Private referring to the fact that it cannot be accessed outside the object
  private _onDidChangeTreeData: vscode.EventEmitter<TreeTask | null> = new vscode.EventEmitter<TreeTask | null>();
  // Readonly referring to the fact that it cannot be changed
  readonly onDidChangeTreeData: vscode.Event<TreeTask | null> = this
    ._onDidChangeTreeData.event;
  // Array of tree tasks used to populate outline view
  data: TreeTask[] = [];

  /**
   * Trinity config inherits the class that reads the user's login/database information
   * Constructor executes create graph structure which fills the OutlineProvider with data
   */
  trinityConfig: any;
  constructor(private context: vscode.ExtensionContext, trinityConfig: any) {
    this.trinityConfig = trinityConfig;
    this.createGraphStructure();
  }

  /**
   * createResultObj method accepts result data as arg from call to database and re-structures the returned data so that it can be easily
   * manipulated to create outline view
   * @param resultData
   */

  createResultObj(resultData: GraphStructure) {
    // Create Result Obj
    const resultObj: ResultObject = {};
    // UniDirectional
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
    // BiDirectional
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
    // Properties
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
  /**
   * createGraphStructure method is called in constructor and utilizes the boundGetGraphStructure and setUpData methods to populate
   * OutlineProvider with correct format for data
   */
  createGraphStructure() {
    const boundGetGraphStructure = getGraphStructure.bind(this);

    const { dbAddress, username, password } = this.trinityConfig.activeSettings;

    boundGetGraphStructure(dbAddress, username, password).then(
      (res: GraphStructure | undefined) => {
        if (res !== undefined) {
          const resultObject: ResultObject = this.createResultObj(res);
          this.data = this.setUpData(resultObject);
          this._onDidChangeTreeData.fire();
        }
      }
    );
  }
  /**
   *  setUpData method accepts resultObj from the createResultObj method and constructs an array of tree tasks that will be used
   *  to populate the outline view
   * @param resultObj
   */
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
    console.log(array);
    return array;
  }

  // Executes command showing outline provider
  show() {
    vscode.commands.executeCommand("setContext", "trinityOutlineEnabled", true);
  }
  /**
   * VSCode API uses getChildren AND getTreeItem methods to aid in construction of tree task outline view
   * @param element
   *
   */
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
