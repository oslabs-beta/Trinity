import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import * as find from "find";

interface TrinitySettings {
  dbAddress: string;
  username: string;
  password: string;
}

// export interface TrinityConfig {
//   getFilePath: string;
//   getConfigSetup: TrinitySettings;
//   watchConfig: void;
// }

export class TrinityConfig {
  configFilePath?: string;
  activeWorkspaceName?: string;
  activeWorkspacePath?: string;
  // ! make an interface for config settings
  activeSettings?: object;

  constructor() {
    this.getActiveWorkspace();
  }
  findFileInParentDirectory(
    startingDirectory: string,
    fileName: string
  ): string {
    let currPath: string = startingDirectory;
    const rootDir: string = path.parse(process.cwd()).root;
    while (currPath !== rootDir) {
      const files: string[] = fs.readdirSync(currPath, {
        encoding: "utf8",
        withFileTypes: false
      });
      for (let file of files) {
        if (file === fileName) {
          return path.resolve(currPath, file);
        }
      }
      currPath = path.resolve(currPath, "../");
      // console.log(currPath);
    }
    return "";
  }
  getSettingsPath(directoryName: string, fileName: string): string {
    //recursively look for config file inside sub directories
    let configPathSubdirectory: string[] = find.fileSync(
      fileName,
      directoryName
    );
    if (configPathSubdirectory.length > 0) {
      return configPathSubdirectory[0];
    }
    //if config is not in sub directory recursively looking in parent directories
    return this.findFileInParentDirectory(directoryName, fileName);
  }

  getSettings(filePath: string): TrinitySettings {
    const trinityConfigString: string = fs.readFileSync(filePath, "utf-8");
    const trinityConfig: TrinitySettings = JSON.parse(trinityConfigString);
    return trinityConfig;
  }

  watchConfig(): void {
    const filePath: string = this.getSettingsPath(__dirname, ".trinity.json");
    // console.log(__dirname);
    // console.log(filePath);

    // ! Udate to kill watch
    // https://stackoverflow.com/questions/53983342/how-to-close-fs-watch-listener-for-a-folder
    fs.watch(filePath, () => {
      //curr, prev) => {
      // console.log("curr: ", curr);
      // console.log("prev: ", prev);
      const string: string = fs.readFileSync(filePath, "utf8");
      console.log(JSON.parse(string));
    });
  }

  getActiveWorkspace() {
    const activeWorkspaces: vscode.WorkspaceFolder[] | undefined =
      vscode.workspace.workspaceFolders;
    let quickPicks: string[] = [];
    console.log(activeWorkspaces);
    if (activeWorkspaces) {
      quickPicks = activeWorkspaces.map(
        (el, index) => `${index + 1}. ${el.name}`
      );
    }
    vscode.window.showQuickPick(quickPicks).then(res => {
      console.log("res: ", res);
      if (res && activeWorkspaces) {
        // get index of selection
        const index: number = parseInt(res.split(".")[0]) - 1;

        this.activeWorkspaceName = res;
        this.activeWorkspacePath = activeWorkspaces[index]["uri"]["fsPath"];

        // find the closest config file
        // ! Handle not in the same folder
        this.configFilePath = this.getSettingsPath(
          this.activeWorkspacePath,
          ".trinity.json"
        );

        console.log("configFilePath: ", this.configFilePath);
      }
    });
  }
}
