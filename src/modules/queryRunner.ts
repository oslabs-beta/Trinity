import * as vscode from "vscode";
const fs = require("fs");
const { parseExtract, extract } = require("./parseExtract.js");
import neo4j from "neo4j-driver";
const path = require("path");

export class QueryRunner {
  tChannel: any;

  // ? must change types when config interface is defined
  trinityConfig: any;

  constructor(trinityConfig: any) {
    this.trinityConfig = trinityConfig;
    this.tChannel = vscode.window.createOutputChannel("Trinity");
  }

  handleSave(event: vscode.TextDocument) {
    // console logging and reading the file that we have saved and converting it to string
    const result = parseExtract(fs.readFileSync(event.fileName).toString());

    const {
      dbAddress,
      username,
      password,
      clearChannelOnSave,
      JSONOutputAbsolutePath,
      outputFilename
    } = this.trinityConfig.activeSettings;

    const driver = neo4j.driver(
      dbAddress,
      neo4j.auth.basic(username, password)
    );

    if (clearChannelOnSave) {
      this.tChannel.clear();
    }

    const promises = [];
    const outputPath = path.resolve(JSONOutputAbsolutePath, outputFilename);

    for (let query of result) {
      const session = driver.session({ defaultAccessMode: neo4j.session.READ });
      if (!query) {
        this.tChannel.appendLine("Query skipped");
        continue;
      }
      promises.push(
        session
          .readTransaction(tx => tx.run(query))
          .then(result => {
            this.tChannel.appendLine(query);
            this.tChannel.appendLine(
              `Result: ${JSON.stringify(result.records, null, 2)}`
            );
            // session.close();
            // driver.close();
            return result;
          })
      );
      // .catch((err: Error): void => {
      //   vscode.window.showInformationMessage(
      //     "Trinity: Please check your query syntax."
      //   );
      // });
    }

    Promise.all(promises).then(values => {
      console.log("Values Obj: ", values);
      const stringObj = JSON.stringify(values, null, 2);
      console.log("values String: ", stringObj);
      console.log("Path: ", outputPath);
      if (stringObj !== "[]") {
        fs.writeFile(outputPath, stringObj, "utf8", (err: Error) =>
          console.log(err)
        );
      }
    });
  }
}
