/* eslint-disable curly */
import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import * as find from "find";

interface TrinitySettings {
  dbAddress: string;
  username: string;
  password: string;
  clearChannelOnSave?: boolean; // -> Default to false
  writeOutputToJSON?: boolean; // -> Default to false
  JSONOutputRelativePath?: string; // -> Default to './'
}

export class TrinityConfig {
  activeWorkspaceName?: string;
  activeWorkspacePath?: string;
  configFilePath?: string;
  configWatcher?: fs.FSWatcher;
  activeSettings?: TrinitySettings;

  constructor() {
    this.watchHandler = this.watchHandler.bind(this);
    // this.getActiveWorkspace();
  }

  findFileInParentDirectory(
    startingDirectory: string,
    fileName: string
  ): string | undefined {
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
    return undefined;
  }

  getSettingsPath(directoryName: string, fileName: string): string | undefined {
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

    // default settings
    if (!trinityConfig.clearChannelOnSave)
      trinityConfig.clearChannelOnSave = false;
    if (!trinityConfig.writeOutputToJSON)
      trinityConfig.writeOutputToJSON = false;
    if (!trinityConfig.JSONOutputRelativePath)
      trinityConfig.JSONOutputRelativePath = "./";

    return trinityConfig;
  }

  watchConfig(): void {
    // Kill current watch if alread in progress
    // https://stackoverflow.com/questions/53983342/how-to-close-fs-watch-listener-for-a-folder
    if (this.configWatcher) this.configWatcher.close();

    // Initialize new watcher and store as this.configWatcher
    if (!this.configFilePath) return;
    // const watcher = fs.watch.bind(this);
    this.configWatcher = fs.watch(this.configFilePath, () =>
      this.watchHandler()
    );
    console.log("watching config file");
  }

  watchHandler(): void {
    console.log("Watch Handler Fired: ", this.configFilePath);
    if (!this.configFilePath) return;

    const string: string = fs.readFileSync(this.configFilePath, "utf8");
    console.log(string);
    this.activeSettings = JSON.parse(string);
    console.log(this.activeSettings);
  }

  // ! Deal with type <any>
  async getActiveWorkspace(): Promise<any> {
    // find all the current active workspaces
    const activeWorkspaces: vscode.WorkspaceFolder[] | undefined =
      vscode.workspace.workspaceFolders;
    let quickPicks: string[] = [];

    console.log(activeWorkspaces);

    // convert active workspaces to format for quickpick dropdown
    if (activeWorkspaces) {
      quickPicks = activeWorkspaces.map(
        (el, index) => `${index + 1}. ${el.name}`
      );
    }

    // prompt the user for the current active workspace
    return vscode.window
      .showQuickPick(quickPicks, {
        placeHolder: "Please Select the Active Workspace"
      })
      .then(res => {
        console.log("in response");
        if (!res || !activeWorkspaces) return;
        // stores selection and path on this
        this.quickPickHandler(res, activeWorkspaces);
      });
    // .catch((err) => console.log(err));
  }

  quickPickHandler(res: string, activeWorkspaces: vscode.WorkspaceFolder[]) {
    console.log("res: ", res);
    // handle edges

    // get index of selection
    const index: number = parseInt(res.split(".")[0]) - 1;

    // store workspace name and filepath
    this.activeWorkspaceName = res;
    this.activeWorkspacePath = activeWorkspaces[index]["uri"]["fsPath"];

    // find the closest config file
    this.configFilePath = this.getSettingsPath(
      this.activeWorkspacePath,
      ".trinity.json"
    );

    console.log("configFilePath: ", this.configFilePath);
    console.log("THIS: ", this);
    // begin watching the config file
    this.watchConfig();
    this.watchHandler();
  }
}
