"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var neo4j_driver_1 = require("neo4j-driver");
/**
 * * Graph DB Concepts:
 * https://neo4j.com/docs/getting-started/current/graphdb-concepts/
 *
 * * One Directional Relationships:
 * https://stackoverflow.com/questions/44481032/find-only-single-direction-relation-in-neo4j
 * MATCH (a) -[r] -> (b)
 * WHERE NOT (b) -[]-> (a)
 * RETURN DISTINCT labels(a), type(r), labels(b)
 *
 * * Two Directional Relationships:
 * MATCH (a) -[r] -> (b)
 * WHERE (b) -[]-> (a)
 * RETURN DISTINCT labels(a), type(r), labels(b)
 *
 * * Get all Properties and keys for an entire graph
 * https://stackoverflow.com/questions/48993061/how-can-i-get-all-property-keys-for-all-nodes-or-for-a-given-label-with-cypher
 * MATCH(n)
 * WITH LABELS(n) AS labels , KEYS(n) AS keys
 * UNWIND labels AS label
 * UNWIND keys AS key
 * RETURN DISTINCT label, COLLECT(DISTINCT key) AS props
 * ORDER BY label
 *
 * * High Level Inventory
 * https://neo4j.com/developer/kb/how-to-get-a-high-level-inventory-of-objects-in-your-graph/
 *
 * * Parameterized neo4j Queries in Node.js
 * * (not currently used.  will be for trinity function)
 * https://www.youtube.com/watch?v=snjnJCZhXUM&t=905s
 */
/**
 * connects to a neo4j database and return a promis that resolves to
 * an object containing the following:
 *    - labels & property keys
 *    - unidirectional relationships
 *    - bidrection relationship
 *
 * @param {String} dbAddress - location of the neo4j database
 * @param {String} user - username to access database
 * @param {String} pass - password to access database
 */
var getGraphStructure = function (dbAddress, user, pass) { return __awaiter(void 0, void 0, void 0, function () {
    var driver, session, txc, queries, graphOutlineRaw, graphOutlineFormat, uniDirectionalRaw, uniDirectionalFormat, biDirectionalRaw, biDirectionalFormat, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                driver = neo4j_driver_1["default"].driver(dbAddress, neo4j_driver_1["default"].auth.basic(user, pass));
                session = driver.session();
                txc = session.beginTransaction();
                queries = {
                    getOutline: "\n      MATCH(n)\n      WITH LABELS(n) AS labels , KEYS(n) AS keys\n      UNWIND labels AS label\n      UNWIND keys AS key\n      RETURN DISTINCT label, COLLECT(DISTINCT key) AS props\n      ORDER BY label",
                    getUniDirectionalRelationships: "\n      MATCH (a) -[r] -> (b)\n      WHERE NOT (b) -[]-> (a)\n      RETURN DISTINCT labels(a), type(r), labels(b)",
                    getBiDirectionalRelationships: "\n      MATCH (a) -[r] -> (b)\n      WHERE (b) -[]-> (a)\n      RETURN DISTINCT labels(a), type(r), labels(b)"
                };
                _a.label = 1;
            case 1:
                _a.trys.push([1, 5, 7, 8]);
                return [4 /*yield*/, txc.run(queries.getOutline)];
            case 2:
                graphOutlineRaw = _a.sent();
                graphOutlineFormat = graphOutlineRaw.records.map(function (el) { return ({
                    label: el._fields[0],
                    properties: el._fields[1]
                }); });
                return [4 /*yield*/, txc.run(queries.getUniDirectionalRelationships)];
            case 3:
                uniDirectionalRaw = _a.sent();
                uniDirectionalFormat = uniDirectionalRaw.records.map(function (el) { return ({
                    originNode: el._fields[0],
                    relationship: el._fields[1],
                    dependentNode: el._fields[2]
                }); });
                return [4 /*yield*/, txc.run(queries.getBiDirectionalRelationships)];
            case 4:
                biDirectionalRaw = _a.sent();
                biDirectionalFormat = biDirectionalRaw.records.map(function (el) { return ({
                    originNode: el._fields[0],
                    relationship: el._fields[1],
                    dependentNode: el._fields[2]
                }); });
                // Return quieried data in a single object
                return [2 /*return*/, {
                        graphOutline: graphOutlineFormat,
                        uniDirectionalRelationship: uniDirectionalFormat,
                        biDirectionalRelationship: biDirectionalFormat
                    }];
            case 5:
                error_1 = _a.sent();
                console.log(error_1);
                return [4 /*yield*/, txc.rollback()];
            case 6:
                _a.sent();
                console.log("rolled back");
                return [3 /*break*/, 8];
            case 7:
                // to end exucution we must close the driver and session
                // otherwise execution context will be left hanging
                session.close();
                driver.close();
                return [7 /*endfinally*/];
            case 8: return [2 /*return*/];
        }
    });
}); };
var dbAddress = "bolt://localhost";
var username = "neo4j";
var password = "test";
getGraphStructure(dbAddress, username, password).then(function (result) {
    console.log(JSON.stringify(result, null, 2));
});
