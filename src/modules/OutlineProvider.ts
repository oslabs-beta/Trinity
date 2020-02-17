
import * as vscode from 'vscode';

const { getGraphStructure }=require('../server/neo4j/graphdb-outline-ts');

export class OutlineProvider implements vscode.TreeDataProvider<TreeTask> {

  onDidChangeTreeData?: vscode.Event<TreeTask|null|undefined>|undefined;

  data: TreeTask[];

  constructor(private context: vscode.ExtensionContext) {

    //must push property keys into array
    //Labels
    //Movie
    //title
    //tagline
    //releaseDate

    //Relationships
    //Person
    //ActedIn
    //Movie
    //Directed
    //nothaMovie  

    // new TreeTask('label', Labelsdata)

    // labelsdata = [ new Treetask()]

    // new tree('relationship', relationshipdata)

    // this.data=[new TreeTask('cars', [
    //   new TreeTask(
    //     'Ford', [new TreeTask('Fiesta'), new TreeTask('Focus'), new TreeTask('Mustang')]),
    //   new TreeTask(
    //     'BMW', [new TreeTask('320'), new TreeTask('X3'), new TreeTask('X5')])
    // ])];

    const dbAddress: string="bolt://localhost";
    const username: string="neo4j";
    const password: string="test";

    getGraphStructure(dbAddress, username, password).then(result => {

      // grab the specific categories
      // and push them ontop tree tas
      const resultData=result;

      let labels=[];
      resultData.graphOutline.forEach(element => {

        let propertyData=[];

        element.properties.forEach(element => {
          propertyData.push(new TreeTask(element));
        });

        let newTask=new TreeTask(element.label, propertyData);

        labels.push(newTask);
      });

      let labelTask=new TreeTask("Label", labels);

      this.data=[];

      this.data.push(labelTask);


      //unidirectional relationships

      // resultData.uniDirectionalRelationships.forEach(element => {

      //   let uniData=[];

      //   element.originNode;

      // });





      //bidirectional relationships




    });

  }

  getChildren(element?: TreeTask|undefined): vscode.ProviderResult<TreeTask[]> {

    if (element===undefined) {
      return this.data;
    }
    return element.children;
  }

  getTreeItem(element: TreeTask): vscode.TreeItem|Thenable<vscode.TreeItem> {
    return element;
  }

}


class TreeTask extends vscode.TreeItem {
  children: TreeTask[]|undefined;

  constructor(label: string, children?: TreeTask[]) {
    super(
      label,
      children===undefined? vscode.TreeItemCollapsibleState.None:
        vscode.TreeItemCollapsibleState.Expanded);
    this.children=children;
  }
}