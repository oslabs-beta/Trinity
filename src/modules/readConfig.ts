// const fs = require("fs");
import * as path from "path";
import * as fs from "fs";
// const path = require('path');
import * as find from "find";

const getFilePath = (directoryName: string, fileName: string): string => {
  let configPath: string[] = [];
  let directoryToCheck = directoryName;

  while (configPath.length < 1) {
    configPath = find.fileSync(fileName, directoryToCheck);

    if (configPath.length < 1) {
      directoryToCheck = path.resolve(directoryToCheck, "../");
    }
  }
  return configPath[0];
};

interface TrinityConfig {
  dbAddress: string;
  username: string;
  password: string;
}

export const getConfigSetup = (directoryName: string): TrinityConfig => {
  const configPath: string = getFilePath(directoryName, ".trinity.json");
  const trinityConfigString: string = fs.readFileSync(configPath, "utf-8");
  const trinityConfig: TrinityConfig = JSON.parse(trinityConfigString);
  return trinityConfig;
};

console.log(getConfigSetup(__dirname));
