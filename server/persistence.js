'use strict';
const { Pool } = require('pg');
class MemoryStore {
  constructor(){this.data=new Map()}
  async init(){}
  async get(code){return this.data.get(code)||null}
  async set(code,state){this.data.set(code,state)}
  async close(){}
}
class PostgresStore {
  constructor(connectionString=process.env.DATABASE_URL){
    if(!connectionString) throw new Error('DATABASE_URL is required');
    this.pool=new Pool({connectionString,ssl:connectionString.includes('render.com')?{rejectUnauthorized:false}:undefined});
  }
  async init(){await this.pool.query('CREATE TABLE IF NOT EXISTS party_rooms (code TEXT PRIMARY KEY, state JSONB NOT NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())')}
  async get(code){const r=await this.pool.query('SELECT state FROM party_rooms WHERE code=$1',[code]);return r.rows[0]?r.rows[0].state:null}
  async set(code,state){await this.pool.query('INSERT INTO party_rooms(code,state) VALUES($1,$2) ON CONFLICT(code) DO UPDATE SET state=EXCLUDED.state,updated_at=NOW()',[code,state])}
  async close(){await this.pool.end()}
}
function createStore(){return process.env.DATABASE_URL?new PostgresStore():new MemoryStore()}
module.exports={MemoryStore,PostgresStore,createStore};
