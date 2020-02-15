
import * as vscode from 'vscode';

export class OutlineProvider implements vscode.TreeDataProvider<TreeTask> {
  
    constructor(private context: vscode.ExtensionContext) {
  
    }

   public async getChildren(task?: TreeTask): Promise<TreeTask[]> {

      let treeTasks: TreeTask[] = [];

      //fetching tasks here
      // let tasks = await vscode.tasks.

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