// npm package for interacting with neo4j databases
const neo4j = require('neo4j-driver');

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
const getGraphStructure = async (dbAddress, user, pass) => {
  // create a connection to your neo4j database
  // handles basic authentication and connects to a local host
  const driver = neo4j.driver(
    dbAddress,
    neo4j.auth.basic(user, pass),
  );

  // initialize a query session
  const session = driver.session();
  // begin a transaction in order to send multiple queries
  // in a single session.
  const txc = session.beginTransaction();

  const queries = {
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
      RETURN DISTINCT labels(a), type(r), labels(b)`,
  };

  try {
    //get graph outline of labels and properties
    const graphOutlineRaw = await txc.run(queries.getOutline);
    const graphOutlineFormat = graphOutlineRaw.records.map((el) => ({
      label: el._fields[0],
      properties: el._fields[1],
    }));
    
    //get uni-directional relationships
    const uniDirectionalRaw = await txc.run(queries.getUniDirectionalRelationships);
    const uniDirectionalFormat = uniDirectionalRaw.records.map((el) => ({
      originNode: el._fields[0],
      relationship: el._fields[1],
      dependentNode: el._fields[2],
    }));

    //get bi-directional relationships
    const biDirectionalRaw = await txc.run(queries.getBiDirectionalRelationships);
    const biDirectionalFormat = biDirectionalRaw.records.map((el) => ({
      originNode: el._fields[0],
      relationship: el._fields[1],
      dependentNode: el._fields[2],
    }));
    
    // Return quieried data in a single object
    return {
      graphOutline: graphOutlineFormat,
      uniDirectionalRelationship: uniDirectionalFormat,
      biDirectionalRelationship: biDirectionalFormat,
    };
  }
  catch (error) {
    console.log(error);
    await txc.rollback();
    console.log('rolled back');
  } finally {
    // to end exucution we must close the driver and session
    // otherwise execution context will be left hanging 
    session.close();
    driver.close();
  }
};

const dbAddress = 'bolt://localhost';
const username = 'neo4j';
const password = 'test';

getGraphStructure(dbAddress, username, password)
  .then((result) => {
    console.log(JSON.stringify(result, null, 2));
  });