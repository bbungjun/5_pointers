// import { Server } from '@modelcontextprotocol/sdk/server/index.js';
// import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
// import mysql from 'mysql2/promise';
// import * as dotenv from 'dotenv';

// dotenv.config();

// const server = new Server(
//   {
//     name: 'mysql-mcp-server',
//     version: '1.0.0',
//   },
//   {
//     capabilities: {
//       tools: {},
//     },
//   }
// );

// let connection: mysql.Connection | null = null;

// // Auto-connect on startup
// async function initConnection() {
//   try {
//     connection = await mysql.createConnection({
//       host: process.env.MYSQL_HOST || 'localhost',
//       port: parseInt(process.env.MYSQL_PORT || '3306'),
//       user: process.env.MYSQL_USER!,
//       password: process.env.MYSQL_PASSWORD!,
//       database: process.env.MYSQL_DATABASE!,
//     });
//     console.log('Auto-connected to MySQL database');
//   } catch (error) {
//     console.error('Auto-connection failed:', error);
//   }
// }

// server.setRequestHandler('initialize', async () => {
//   return {
//     protocolVersion: '2024-11-05',
//     capabilities: {
//       tools: {},
//     },
//     serverInfo: {
//       name: 'mysql-mcp-server',
//       version: '1.0.0',
//     },
//   };
// });

// server.setRequestHandler('tools/list', async () => {
//   return {
//     tools: [
//       {
//         name: 'mysql_connect',
//         description: 'Connect to MySQL database',
//         inputSchema: {
//           type: 'object',
//           properties: {
//             host: { type: 'string', default: 'localhost' },
//             port: { type: 'number', default: 3306 },
//             user: { type: 'string' },
//             password: { type: 'string' },
//             database: { type: 'string' },
//           },
//           required: ['user', 'password', 'database'],
//         },
//       },
//       {
//         name: 'mysql_query',
//         description: 'Execute MySQL query',
//         inputSchema: {
//           type: 'object',
//           properties: {
//             query: { type: 'string' },
//           },
//           required: ['query'],
//         },
//       },
//       {
//         name: 'mysql_list_tables',
//         description: 'List all tables in the database',
//         inputSchema: {
//           type: 'object',
//           properties: {},
//         },
//       },
//       {
//         name: 'mysql_get_all_data',
//         description: 'Get all data from all tables',
//         inputSchema: {
//           type: 'object',
//           properties: {},
//         },
//       },
//       {
//         name: 'mysql_get_table',
//         description: 'Get all data from a specific table',
//         inputSchema: {
//           type: 'object',
//           properties: {
//             table: { type: 'string' },
//           },
//           required: ['table'],
//         },
//       },
//     ],
//   };
// });

// server.setRequestHandler('tools/call', async (request) => {
//   const { name, arguments: args } = request.params;

//   if (name === 'mysql_connect') {
//     try {
//       connection = await mysql.createConnection({
//         host: args.host || 'localhost',
//         port: args.port || 3306,
//         user: args.user,
//         password: args.password,
//         database: args.database,
//       });
//       return {
//         content: [{ type: 'text', text: 'Connected to MySQL database successfully' }],
//       };
//     } catch (error) {
//       return {
//         content: [{ type: 'text', text: `Connection failed: ${error}` }],
//         isError: true,
//       };
//     }
//   }

//   if (name === 'mysql_query') {
//     if (!connection) {
//       return {
//         content: [{ type: 'text', text: 'Not connected to database. Use mysql_connect first.' }],
//         isError: true,
//       };
//     }

//     try {
//       const [rows] = await connection.execute(args.query);
//       return {
//         content: [{ type: 'text', text: JSON.stringify(rows, null, 2) }],
//       };
//     } catch (error) {
//       return {
//         content: [{ type: 'text', text: `Query failed: ${error}` }],
//         isError: true,
//       };
//     }
//   }

//   if (name === 'mysql_list_tables') {
//     if (!connection) {
//       return {
//         content: [{ type: 'text', text: 'Not connected to database. Use mysql_connect first.' }],
//         isError: true,
//       };
//     }

//     try {
//       const [rows] = await connection.execute('SHOW TABLES');
//       return {
//         content: [{ type: 'text', text: JSON.stringify(rows, null, 2) }],
//       };
//     } catch (error) {
//       return {
//         content: [{ type: 'text', text: `Failed to list tables: ${error}` }],
//         isError: true,
//       };
//     }
//   }

//   if (name === 'mysql_get_all_data') {
//     if (!connection) {
//       return {
//         content: [{ type: 'text', text: 'Not connected to database. Use mysql_connect first.' }],
//         isError: true,
//       };
//     }

//     try {
//       const [tables] = await connection.execute('SHOW TABLES') as any[];
//       const allData: any = {};
      
//       for (const table of tables) {
//         const tableName = Object.values(table)[0] as string;
//         const [rows] = await connection.execute(`SELECT * FROM ${tableName}`);
//         allData[tableName] = rows;
//       }
      
//       return {
//         content: [{ type: 'text', text: JSON.stringify(allData, null, 2) }],
//       };
//     } catch (error) {
//       return {
//         content: [{ type: 'text', text: `Failed to get all data: ${error}` }],
//         isError: true,
//       };
//     }
//   }

//   if (name === 'mysql_get_table') {
//     if (!connection) {
//       return {
//         content: [{ type: 'text', text: 'Not connected to database. Use mysql_connect first.' }],
//         isError: true,
//       };
//     }

//     try {
//       const [rows] = await connection.execute(`SELECT * FROM ${args.table}`);
//       return {
//         content: [{ type: 'text', text: JSON.stringify(rows, null, 2) }],
//       };
//     } catch (error) {
//       return {
//         content: [{ type: 'text', text: `Failed to query table ${args.table}: ${error}` }],
//         isError: true,
//       };
//     }
//   }

//   return {
//     content: [{ type: 'text', text: `Unknown tool: ${name}` }],
//     isError: true,
//   };
// });

// async function main() {
//   await initConnection();
//   const transport = new StdioServerTransport();
//   await server.connect(transport);
// }

// main().catch(console.error);