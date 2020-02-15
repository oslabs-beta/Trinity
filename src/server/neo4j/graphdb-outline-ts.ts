// npm package for interacting with neo4j databases

// ! Had to update Record TS Class to include "_fields?: object" in:
// ! node_modules/neo4j-driver/types/record.d.ts
import neo4j from "neo4j-driver";
import { QueryResult } from "neo4j-driver/types/index";
import { Driver } from "neo4j-driver/types/driver";
import Session from "neo4j-driver/types/session";
import Transaction from "neo4j-driver/types/transaction";

interface GraphOutline {
  label: string;
  properties: string[];
}

interface Relationships {
  originNode: string[];
  relationship: string;
  dependentNode: string[];
}

interface GraphStructure {
  graphOutline: Array<GraphOutline>;
  uniDirectionalRelationship: Array<Relationships>;
  biDirectionalRelationship: Array<Relationships>;
}

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
export const getGraphStructure = async (
  dbAddress: string,
  user: string,
  pass: string
): Promise<GraphStructure | undefined> => {
  // create a connection to your neo4j database
  // handles basic authentication and connects to a local host
  const driver: Driver = neo4j.driver(dbAddress, neo4j.auth.basic(user, pass));

  // initialize a query session
  const session: Session = driver.session();
  // begin a transaction in order to send multiple queries
  // in a single session.
  const txc: Transaction = session.beginTransaction();

  const queries: { [key: string]: string } = {
    getOutline: `
      MATCH(n)
      WITH LABELS(n) AS labels , KEYS(n) AS keys
      UNWIND labels AS label
      UNWIND keys AS key
      RETURN DISTINCT label, COLLECT(DISTINCT key) AS props
      ORDER BY label`,
    getUniDirectionalRelationships: `
      MATCH (a) -[r] -> (b)
      WHERE NOT (b) -[]-> (a)
      RETURN DISTINCT labels(a), type(r), labels(b)`,
    getBiDirectionalRelationships: `
      MATCH (a) -[r] -> (b)
      WHERE (b) -[]-> (a)
      RETURN DISTINCT labels(a), type(r), labels(b)`
  };

  try {
    //get graph outline of labels and properties
    const graphOutlineRaw: QueryResult = await txc.run(queries.getOutline);
    const graphOutlineFormat: Array<GraphOutline> = graphOutlineRaw.records.map(
      el => ({
        label: el._fields[0],
        properties: el._fields[1]
      })
    );

    //get uni-directional relationships
    const uniDirectionalRaw: QueryResult = await txc.run(
      queries.getUniDirectionalRelationships
    );
    const uniDirectionalFormat: Array<Relationships> = uniDirectionalRaw.records.map(
      el => ({
        originNode: el._fields[0],
        relationship: el._fields[1],
        dependentNode: el._fields[2]
      })
    );

    //get bi-directional relationships
    const biDirectionalRaw: QueryResult = await txc.run(
      queries.getBiDirectionalRelationships
    );
    const biDirectionalFormat: Array<Relationships> = biDirectionalRaw.records.map(
      el => ({
        originNode: el._fields[0],
        relationship: el._fields[1],
        dependentNode: el._fields[2]
      })
    );

    // Return quieried data in a single object
    return {
      graphOutline: graphOutlineFormat,
      uniDirectionalRelationship: uniDirectionalFormat,
      biDirectionalRelationship: biDirectionalFormat
    };
  } catch (error) {
    console.log(error);
    await txc.rollback();
    console.log("rolled back");
  } finally {
    // to end exucution we must close the driver and session
    // otherwise execution context will be left hanging
    session.close();
    driver.close();
  }
};

const dbAddress: string = "bolt://localhost";
const username: string = "neo4j";
const password: string = "test";

// getGraphStructure(dbAddress, username, password).then(result => {
//   console.log( "check this shit ", JSON.stringify(result, null, 2));
// });
