import * as vscode from "vscode";
const fs = require("fs");
const { parseExtract, extract } = require("./parseExtract.js");
import neo4j from "neo4j-driver";

export class QueryRunner {
  tChannel: any;

  // ? must change types when config interface is defined
  config: any;

  constructor(config: any) {
    this.config = config;
    this.tChannel = vscode.window.createOutputChannel("Trinity");
  }

  handleSave(event: vscode.TextDocument) {
    // console logging and reading the file that we have saved and converting it to string
    const result = parseExtract(fs.readFileSync(event.fileName).toString());

    const driver = neo4j.driver(
      this.config.dbAddress,
      neo4j.auth.basic(this.config.username, this.config.password)
    );

    for (let query of result) {
      const session = driver.session({ defaultAccessMode: neo4j.session.READ });
      if (!query) {
        this.tChannel.appendLine("Query skipped");
        continue;
      }
      session
        .readTransaction(tx => tx.run(query))
        .then(result => {
          this.tChannel.appendLine(query);
          this.tChannel.appendLine(
            `Result: ${JSON.stringify(result.records, null, 2)}`
          );
          // session.close();
          // driver.close();
        })
        .catch((err: Error): void => {
          vscode.window.showInformationMessage(
            "Trinity: Please check your query syntax."
          );
        });
    }
  }
}
