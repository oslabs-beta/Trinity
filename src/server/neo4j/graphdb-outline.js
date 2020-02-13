const path = require('path');
const neo4j = require('neo4j-driver');
const username = 'neo4j';
const password = 'test';


const getGraphStructure = async (user, pass) => {
  const driver = neo4j.driver(
    'bolt://localhost',
    neo4j.auth.basic(user, pass),
  );

  const session = driver.session();
  const txc = session.beginTransaction();
  try {
    //get graph outline of labels and properties
    const outline = await txc.run(
      `MATCH(n)
      WITH LABELS(n) AS labels , KEYS(n) AS keys
      UNWIND labels AS label
      UNWIND keys AS key
      RETURN DISTINCT label, COLLECT(DISTINCT key) AS props
      ORDER BY label`
    );
    const outlineFormat = outline.records.map((el) => ({
      label: el._fields[0],
      properties: el._fields[1],
    }));
    // console.log(JSON.stringify(outlineFormat, null, 2));
    //get uni-directional relationship 
    const outline2 = await txc.run(
      `MATCH (a) -[r] -> (b)
      WHERE NOT (b) -[]-> (a)
      RETURN DISTINCT labels(a), type(r), labels(b)`
    );
    const outline2Format = outline2.records.map((el) => ({
      originNode: el._fields[0],
      relationship: el._fields[1],
      dependentNode: el._fields[2],
    }));
    // console.log(JSON.stringify(outline2Format, null, 2));
     //get bi-directional relationship 
    const outline3 = await txc.run(
      `MATCH (a) -[r] -> (b)
      WHERE (b) -[]-> (a)
      RETURN DISTINCT labels(a), type(r), labels(b)`
    );
    const outline3Format = outline3.records.map((el) => ({
      originNode: el._fields[0],
      relationship: el._fields[1],
      dependentNode: el._fields[2],
    }));
    // console.log(JSON.stringify(outline3Format, null, 2));
    return {
      graphOutline:outlineFormat,
      uniDirectionalRelationship:outline2Format,
      biDirectionalRelationship:outline3Format,

    };
  }
  catch (error) {
    console.log(error);
    await txc.rollback();
    console.log('rolled back');
  } finally {
    session.close();
    driver.close();
  }
};
getGraphStructure(username, password)
  .then((result) => {
    console.log(result);
  });



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

