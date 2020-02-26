// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import neo4j from "neo4j-driver";
import { stringify } from "querystring";
import { QueryResult } from "neo4j-driver/types/index";
import { Driver } from "neo4j-driver/types/driver";
import Session from "neo4j-driver/types/session";
import Transaction from "neo4j-driver/types/transaction";

let tChannel: any;
const fs = require("fs");
const parseExtract = require("./modules/parseExtract.js");
import { OutlineProvider } from "./modules/OutlineProvider";
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // vscode.commands.executeCommand('setContext', 'trinityOutlineEnabled', true);
  vscode.window.showInformationMessage("you are activated");
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "trinity" is now active!');
  tChannel = vscode.window.createOutputChannel("Trinity");

  // const OP = new OutlineProvider();
  // vscode.window.registerTreeDataProvider("trinityOutline", OP);

  let newThing = vscode.commands.registerCommand(
    "trinityOutline.executeTask",
    task => {
      vscode.tasks.executeTask(task).then(
        function(value) {
          return value;
        },
        function(e) {
          console.error("Error");
        }
      );
    }
  );

  context.subscriptions.push(newThing);

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    "extension.runTrinity",
    () => {
      // The code you place here will be executed every time your command is executed

      // Display a message box to the user
      vscode.window.showInformationMessage(
        "Trinity is now running!  Please make sure your database is connected."
      );

      const OP = new OutlineProvider(context);
      OP.show();
      vscode.window.registerTreeDataProvider("trinityOutline", OP);
      vscode.commands.registerCommand("trinityOutline.refresh", () =>
        OP.refresh()
      );
      vscode.commands.registerCommand("trinityOutline.show", () => {
        console.log("show Triggered");
        OP.show();
      });
    }
  );

  context.subscriptions.push(disposable);
  // In the context of this extension-
  // On a Save of a text document in a workspace (which is an event listener)
  // We pass the event into handle save
  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument(event => handleSave(event))
  );
}

// We recieve the event from the file that is being saved in the onDidSavetextDocument listener
function handleSave(event: vscode.TextDocument) {
  // console logging and reading the file that we have saved and converting it to string
  const result = parseExtract(fs.readFileSync(event.fileName).toString());

  const resultText = JSON.stringify(result, null, 2);
  // tChannel.appendLine("RESULT ARRAY:\n" + result);
  const test = "test";

  const dbAddress: string = "bolt://localhost";
  const username: string = "neo4j";
  const password: string = "test";

  const driver = neo4j.driver(dbAddress, neo4j.auth.basic(username, password));
  const session = driver.session();
  const txc = session.beginTransaction();

  // tChannel.appendLine((() => "test")());
  // tChannel.appendLine("Hello");
  for (let query of result) {
    tChannel.appendLine(query);
    if (!query) {
      tChannel.appendLine("Query skipped");
      continue;
    }
    txc.run(query).then(result => {
      tChannel.appendLine(`Result: ${JSON.stringify(result.records, null, 2)}`);
    });
  }

  // tChannel.appendLine(result);
  // tChannel.appendLine(test);
  // tChannel.appendLine([]);
  console.log(result);
}

// this method is called when your extension is deactivated
export function deactivate() {}
