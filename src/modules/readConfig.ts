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
  JSONOutputAbsolutePath?: string; // -> relative to the config file
  outputFilename?: string; // -> default to the output.json
}

export class TrinityConfig {
  activeWorkspaceName?: string;
  activeWorkspacePath?: string;
  configFilePath?: string;
  configFilePathRoot?: string;
  configWatcher?: fs.FSWatcher;
  activeSettings?: TrinitySettings;

  constructor() {
    this.getSettings = this.getSettings.bind(this);
  }

  findFileInParentDirectory(
    startingDirectory: string,
    fileName: string
  ): string | undefined {
    let currPath: string = startingDirectory;
    const rootDir: string = path.parse(process.cwd()).root;
    // iterate through parent directory untill reach the root
    while (currPath !== rootDir) {
      // get all files and folders in current directory
      const files: string[] = fs.readdirSync(currPath, {
        encoding: "utf8",
        withFileTypes: false
      });
      // iterate through files, looking for the configuration file
      for (let file of files) {
        if (file === fileName) {
          return path.resolve(currPath, file);
        }
      }
      // if config file is not in the current directory,
      // then check current directory's parents
      currPath = path.resolve(currPath, "../");
    }
    // will return undefined if config file is not found
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
    //if config is not in sub directory recursively look in the parent directories
    return this.findFileInParentDirectory(directoryName, fileName);
  }

  getSettings(): void {
    const filePath = this.configFilePath;
    if (!filePath) return;
    const trinityConfigString: string = fs.readFileSync(filePath, "utf-8");
    const trinityConfig: TrinitySettings = JSON.parse(trinityConfigString);

    this.activeSettings = trinityConfig;
    // default settings
    if (!this.activeSettings.clearChannelOnSave) {
      this.activeSettings.clearChannelOnSave = false;
    }
    if (!this.activeSettings.writeOutputToJSON) {
      this.activeSettings.writeOutputToJSON = false;
    }
    if (!this.activeSettings.JSONOutputRelativePath) {
      this.activeSettings.JSONOutputRelativePath = "./";
    }
    if (!this.activeSettings.outputFilename) {
      this.activeSettings.outputFilename = "output.json";
    }
    if (
      this.configFilePathRoot &&
      this.activeSettings &&
      this.activeSettings.JSONOutputRelativePath
    ) {
      trinityConfig.JSONOutputAbsolutePath = path.resolve(
        this.configFilePathRoot,
        this.activeSettings.JSONOutputRelativePath
      );
    }
  }

  watchConfig(): void {
    // Kill current watch if already in progress
    if (this.configWatcher) this.configWatcher.close();

    // Initialize new watcher and store as this.configWatcher
    if (!this.configFilePath) return;
    this.configWatcher = fs.watch(this.configFilePath, () => {
      // each time config file save, refresh configuration settigs
      this.getSettings();
    });
  }

  async getActiveWorkspace(): Promise<void> {
    // find all the current active workspaces
    const activeWorkspaces: vscode.WorkspaceFolder[] | undefined =
      vscode.workspace.workspaceFolders;
    let quickPicks: string[] = [];

    // convert active workspaces to format for quickpick dropdown
    if (activeWorkspaces) {
      quickPicks = activeWorkspaces.map(
        (el, index) => `${index + 1}. ${el.name}`
      );
    }

    // prompt the user for the current active workspace
    vscode.window.showInformationMessage(
      "Trinity: Please select your Active Workspace"
    );
    return vscode.window
      .showQuickPick(quickPicks, {
        placeHolder: "Trinity: Please Select the Active Workspace"
      })
      .then(res => {
        if (!res || !activeWorkspaces) return;
        // stores user's selection and path on 'this'
        this.quickPickHandler(res, activeWorkspaces);
      });
  }

  quickPickHandler(res: string, activeWorkspaces: vscode.WorkspaceFolder[]) {
    // get index of user's selection
    const index: number = parseInt(res.split(".")[0]) - 1;

    // store workspace name and filepath
    this.activeWorkspaceName = res;
    this.activeWorkspacePath = activeWorkspaces[index]["uri"]["fsPath"];

    // find the closest config file
    this.configFilePath = this.getSettingsPath(
      this.activeWorkspacePath,
      ".trinity.json"
    );
    // get file path of the config file
    if (this.configFilePath) {
      this.configFilePathRoot = this.configFilePath.replace(
        ".trinity.json",
        ""
      );
    }
    // begin watching the config file
    this.watchConfig();
    this.getSettings();
  }
}
