const path = require('path');
const neo4j = require('neo4j-driver');

const driver = neo4j.driver(
  'bolt://localhost',
  neo4j.auth.basic('neo4j', 'test'),
);

const session = driver.session();


session
  .run(`MATCH(n)
  WITH LABELS(n) AS labels , KEYS(n) AS keys
  UNWIND labels AS label
  UNWIND keys AS key
  RETURN DISTINCT label, COLLECT(DISTINCT key) AS props
  ORDER BY label`)
  .then((result) => {
    const outline = result.records.map((el) => ({
      label: el._fields[0],
      properties: el._fields[1],
    }));
    console.log(JSON.stringify(outline, null, 2));
    // console.log(result);
  })
  .catch((error) => {
    console.log(error);
  })
  .then(() => session.close());


session
  .run(` MATCH (a) -[r] -> (b)
   WHERE NOT (b) -[]-> (a)
   RETURN DISTINCT labels(a), type(r), labels(b)`)
  .then((result) => {
    const outline = result.records.map((el) => ({
      originNode: el._fields[0],
      relationship: el._fields[1],
      dependentNode: el._fields[2],
    }));
    console.log(JSON.stringify(outline, null, 2));
    // console.log(result.records[0]._fields);
  })
  .catch((error) => {
    console.log(error);
  })
  .then(() => session.close());

session
  .run(` MATCH (a) -[r] -> (b)
   WHERE (b) -[]-> (a)
   RETURN DISTINCT labels(a), type(r), labels(b)`)
  .then((result) => {
    const outline = result.records.map((el) => ({
      originNode: el._fields[0],
      relationship: el._fields[1],
      dependentNode: el._fields[2],
    }));
    console.log(JSON.stringify(outline, null, 2));
    // console.log(result.records[0]._fields);
  })
  .catch((error) => {
    console.log(error);
  })
  .then(() => session.close());


/**
 * https://stackoverflow.com/questions/44481032/find-only-single-direction-relation-in-neo4j
 * * One Directional Relationships:
 * MATCH (a) -[r] -> (b)
 * WHERE NOT (b) -[]-> (a)
 * RETURN DISTINCT labels(a), type(r), labels(b)
 *
 * * Two Directional Relationships:
 * MATCH (a) -[r] -> (b)
 * WHERE (b) -[]-> (a)
 * RETURN DISTINCT labels(a), type(r), labels(b)
 *
 * https://stackoverflow.com/questions/48993061/how-can-i-get-all-property-keys-for-all-nodes-or-for-a-given-label-with-cypher
 * * Get all Properties and keys for a given node
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
 * https://www.youtube.com/watch?v=snjnJCZhXUM&t=905s
 */
