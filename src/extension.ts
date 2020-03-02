import * as vscode from "vscode";
import { QueryRunner } from "./modules/queryRunner";
const { OutlineProvider } = require("./modules/OutlineProvider.js");
import { TrinityConfig } from "./modules/readConfig";

let config: object;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Load configuration
  const trinityConfig = new TrinityConfig();
  // trinityConfig.getActiveWorkspace();
  // trinityConfig.watchConfig();

  // extension.runTrinity has been defined in the package.json file
  vscode.commands.registerCommand("extension.runTrinity", () => {
    // vscode.window.showInformationMessage("Trinity is now running!");
  });

  // Setup the Trinity Outline in the Explorer view
  const OP = new OutlineProvider(context);
  OP.show();
  vscode.window.registerTreeDataProvider("trinityOutline", OP);
  vscode.commands.registerCommand("trinityOutline.refresh", () =>
    OP.createGraphStructure()
  );
  vscode.commands.registerCommand("trinityOutline.show", () => {
    console.log("show Triggered");
    OP.show();
  });

  // Create a new setup Extension to handle live querying and
  // create a Trinity Channel
  const queryRunner = new QueryRunner();
  // functionality executed every time the active document is saved
  vscode.workspace.onDidSaveTextDocument(event =>
    queryRunner.handleSave(event)
  );
}

export function deactivate() {}
