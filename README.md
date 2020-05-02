<p align="center">
  <img width="250px" src="https://raw.githubusercontent.com/oslabs-beta/Trinity/dev/DOCUMENTATION/Trinity-Logo.png" />
</p>

# Trinity

## What is Trinity?

Trinity is a VS Code extension for previewing Neo4j queries and database structure within the VS Code environment. Trinity intends to remove the need for switching between VS Code and Neo4j Desktop or Neo4j Browser during the development process.

## Features

### **Core Features**

1. Connects to a user's Neo4j database and displays the graph database structure (Node Labels, Properties and Unidirectional/Bidirectional relationships).
2. Parses Neo4j/Cypher queries/mutations that are typed into the current open document in VS Code.
3. Sends the queries/mutations to a database as defined in the user's configuration file .
4. Renders the responses to the Trinity output channel on VS Code.
5. Optionally writes the output to a local JSON file based on the user's configuration.

  <img width="800px" src="https://raw.githubusercontent.com/oslabs-beta/Trinity/dev/DOCUMENTATION/gifs/basicDemo.gif" alt="demo gif" />

## Getting Started

### **Installation**

Trinity can be installed from the VS Code Extensions marketplace [here](https://marketplace.visualstudio.com/items?itemName=Trinity.trinity).

### **Setting up the config file**

In your working directory create a
`.trinity.json` file. The following configuration options are available for setup by the user:

```json
{
  "dbAddress": "bolt://localhost",
  "username": "neo4j",
  "password": "test",
  "clearChannelOnSave": true,
  "writeOutputToJSON": true,
  "JSONOutputRelativePath": "./",
  "outputFilename": "output.json"
}
```

Required Settings: `dbAddress`, `username` and `password`.

Default settings when not defined in the configuration file:

```json
{
  "clearChannelOnSave": false,
  "writeOutputToJSON": false,
  "JSONOutputRelativePath": "./",
  "outputFilename": "output.json"
}
```

## Write and Invoking your first Trinity query

To activate the extension and connect to your Neo4j Database:

1. Search for Trinity from the command palette in VS Code (Cmd/Ctrl + Shift + P) and run the _`Trinity: Run Trinity`_ command.
2. To deactivate, search for Trinity from the command palette in VS Code (Cmd/Ctrl + Shift + P) and run the _`Trinity: Deactivate Trinity`_ command.

The following steps are required to setup a `Trinity` query inside your working file.

1. Create a function declaration for your `Trinity` query
2. Invoke your Cypher Query within a Trinity function invocation\*
3. On every save, Trinity will send any requests inside of the `Trinity` functions to your Neo4j Database and show responses in the Trinity Output Channel. To send another request, create a new invocation of the `Trinity` function and put the new request as the argument. Output will also be saved to a JSON file if setup in the configuration file.

_\*Multiple queries may be invoked within a single file. Current functionality does not support the passing of variables or parameterized queries._

---

### Sample Python Setup

```python
# Create a Trinity function definition in your working file.
def Trinity ():
  return

# Anywhere in your open file, put a Neo4j Cypher query inside the Trinity function. For example:
Trinity('Match (n{name: "Carrie-Anne Moss"}) Return n')
```

### Sample JavaScript Setup

```javascript
// Create a Trinity function definition in your working file.
function Trinity() {}

// Anywhere in your open file, put a Neo4j Cypher query inside the Trinity function. For example:
Trinity('Match (n{name: "Carrie-Anne Moss"}) Return n');
```

On every save, Trinity will send any requests inside of the `Trinity` functions to your Neo4j Database and show responses in the Trinity Output Channel. To send another request, create a new invocation of the `Trinity` function and put the new request as the argument.

---

## Contributing and Issues

We are always looking to improve. If there are any contributions, feature requests or issues/bugs you have, please check out our documentation on [contributions](./DOCUMENTATION/docs/contributing.md), [feature requests](./DOCUMENTATION/docs/featureRequest.md) or [issues/bugs](./DOCUMENTATION/docs/bugReport.md).

## Release Notes

Created by: Alex Bednarek, Alex Drew, Connor Bovino, Olena Danykh

0.0.1 | Initial release of Trinity, More to come!
