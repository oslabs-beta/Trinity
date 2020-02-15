
import * as vscode from 'vscode';

const { getGraphStructure } = require('../server/neo4j/graphdb-outline-ts');

export class OutlineProvider implements vscode.TreeDataProvider<TreeTask> {
  
    constructor(private context: vscode.ExtensionContext) {
  
    }

   public async getChildren(task?: TreeTask): Promise<TreeTask[]> {

      let treeTasks: TreeTask[] = [];

      const dbAddress: string = "bolt://localhost";
      const username: string = "neo4j";
      const password: string = "test";

      getGraphStructure(dbAddress, username, password).then(result => {
        console.log( "Here" ,JSON.stringify(result, null, 2));
      });


      //creating tree tasks

      treeTasks.push(new TreeTask('test1', "test2" ,vscode.TreeItemCollapsibleState.None));
      treeTasks.push(new TreeTask('Test1', "DOG" ,vscode.TreeItemCollapsibleState.None));



      return treeTasks;
    }
  
    getTreeItem(task: TreeTask): vscode.TreeItem {
      return task;
    }

}


class TreeTask extends vscode.TreeItem {

  type: string;
  
  constructor(
      type: string, 
      label: string, 
      collapsibleState: vscode.TreeItemCollapsibleState,
      command?: vscode.Command
  ) {
      super(label, collapsibleState);
      this.type = type;
      this.command = command;
  }
   
}