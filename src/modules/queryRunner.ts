import * as vscode from "vscode";
const fs = require("fs");
const { parseExtract, extract } = require("./parseExtract.js");
import neo4j from "neo4j-driver";

export class QueryRunner {
  tChannel: any;

  constructor() {
    this.tChannel = vscode.window.createOutputChannel("Trinity");
  }

  handleSave(event: vscode.TextDocument) {
    // console logging and reading the file that we have saved and converting it to string
    const result = parseExtract(fs.readFileSync(event.fileName).toString());

    const resultText = JSON.stringify(result, null, 2);
    // tChannel.appendLine("RESULT ARRAY:\n" + result);
    const test = "test";

    const dbAddress: string = "bolt://localhost";
    const username: string = "neo4j";
    const password: string = "test";

    const driver = neo4j.driver(
      dbAddress,
      neo4j.auth.basic(username, password)
    );
    const session = driver.session();
    const txc = session.beginTransaction();

    // tChannel.appendLine((() => "test")());
    // tChannel.appendLine("Hello");
    for (let query of result) {
      this.tChannel.appendLine(query);
      if (!query) {
        this.tChannel.appendLine("Query skipped");
        continue;
      }
      txc.run(query).then(result => {
        this.tChannel.appendLine(
          `Result: ${JSON.stringify(result.records, null, 2)}`
        );
      });
    }
  }
}
