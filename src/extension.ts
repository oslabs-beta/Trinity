import * as vscode from "vscode";
import { QueryRunner } from "./modules/queryRunner";
const { OutlineProvider } = require("./modules/OutlineProvider.js");
import { TrinityConfig } from "./modules/readConfig";

// this required method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {
  vscode.commands.registerCommand("extension.runTrinity", () => {
    vscode.window.showInformationMessage(
      "Trinity is now running! Add your workspace at the search bar at top of window."
    );
  });

  // Load configuration and event watcher
  const trinityConfig = new TrinityConfig();
  // Trigger event watcher
  trinityConfig.getActiveWorkspace().then(() => {
    // Loading outline provider with active settings
    const OP = new OutlineProvider(context, trinityConfig);
    // displaying view
    OP.show();
    vscode.window.registerTreeDataProvider("trinityOutline", OP);
    vscode.commands.registerCommand("trinityOutline.refresh", () =>
      OP.createGraphStructure()
    );
    vscode.commands.registerCommand("trinityOutline.show", () => {
      OP.show();
    });
    // Create a new setup Extension to handle live querying and
    // create a Trinity Channel
    const queryRunner = new QueryRunner(trinityConfig);
    // functionality executed every time the active document is saved
    vscode.workspace.onDidSaveTextDocument(event =>
      queryRunner.handleSave(event)
    );

    // deactivate functionality
    vscode.commands.registerCommand("extension.deactivateTrinity", () => {
      // this command will restart window automatically and Trinity extension will not be running
      vscode.commands.executeCommand("workbench.action.reloadWindow");
    });
  });
}

export function deactivate() {}
