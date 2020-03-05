import * as vscode from "vscode";
import { TrinityConfig } from "./readConfig";
const fs=require("fs");
const { parseExtract, extract }=require("./parseExtract");
import neo4j from "neo4j-driver";
const path=require("path");

export class QueryRunner {
  tChannel: vscode.OutputChannel;
  trinityConfig: TrinityConfig;

  constructor(trinityConfig: TrinityConfig) {
    this.trinityConfig=trinityConfig;
    this.tChannel=vscode.window.createOutputChannel("Trinity");
  }
  // executes each the active file is saved
  handleSave(event: vscode.TextDocument) {
    // read in the active file
    const result=parseExtract(fs.readFileSync(event.fileName).toString());
    // destructure the active settings from the .trinity.json file
    const {
      dbAddress,
      username,
      password,
      clearChannelOnSave,
      JSONOutputAbsolutePath,
      outputFilename
    }=this.trinityConfig.activeSettings||{};
    // if required settings are not present, notify the user and end early
    if (!dbAddress||!username||!password) {
      vscode.window.showInformationMessage(
        "Trinity: Unable to run Trinity Queries. Please check your login credentials in the .trinity.json file."
      );
      return;
    }
    // initialize connection to Neo4j DB
    const driver=neo4j.driver(
      dbAddress,
      neo4j.auth.basic(username, password)
    );
    // clear tChanel based on active settigs
    if (clearChannelOnSave) {
      this.tChannel.clear();
    }
    // create array to store return values from queries
    const promises=[];
    // define output file location
    const outputPath=path.resolve(JSONOutputAbsolutePath, outputFilename);
    // iterate across the queries
    for (let query of result) {
      // create a Neo4j session to submit the query to
      const session=driver.session({ defaultAccessMode: neo4j.session.READ });
      // only run valid queries
      if (!query) {
        this.tChannel.appendLine("Query skipped");
        continue;
      }
      // push the query into promises array, once all queries are returned
      // the promises array will be written to a json file at the outputPath.
      promises.push(
        session
          .readTransaction(tx => tx.run(query))
          .then(result => {
            this.tChannel.appendLine(query);
            this.tChannel.appendLine(
              `Result: ${JSON.stringify(result.records, null, 2)}`
            );
            return result;
          })
          .catch((err: Error): void => {
            vscode.window.showInformationMessage(
              "Trinity: Please check your query syntax."
            );
          })
      );
    }

    Promise.all(promises).then(values => {
      const stringObj=JSON.stringify(values, null, 2);

      // only writes non empty objects to the outputPath.
      if (stringObj!=="[]") {
        fs.writeFile(outputPath, stringObj, "utf8", (err: Error) => {
          if (!err) {
            return;
          }
          vscode.window.showInformationMessage(
            "Trinity: Unable to save queries to output file"
          );
        });
      }
    });
  }
}
