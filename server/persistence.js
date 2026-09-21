'use strict';
const { Pool } = require('pg');

function dbLog(message, detail=''){
  const suffix=detail?' '+detail:'';
  console.log('[DB] '+message+suffix);
}

class MemoryStore {
  constructor(){this.data=new Map()}
  async init(){dbLog('Using in-memory room store (DATABASE_URL not set)')}
  async get(code){return this.data.get(code)||null}
  async set(code,state){this.data.set(code,state)}
  async delete(code){this.data.delete(code)}
  async close(){}
}

class PostgresStore {
  constructor(connectionString=process.env.DATABASE_URL){
    if(!connectionString) throw new Error('DATABASE_URL is required');
    this.pool=new Pool({connectionString,ssl:connectionString.includes('render.com')?{rejectUnauthorized:false}:undefined});
    this.pool.on('error',err=>console.error('[DB] PostgreSQL pool error:',err.message));
  }
  async init(){
    try{
      await this.pool.query('CREATE TABLE IF NOT EXISTS party_rooms (code TEXT PRIMARY KEY, state JSONB NOT NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())');
      await this.pool.query('SELECT 1');
      dbLog('PostgreSQL connected and room table ready');
    }catch(err){
      console.error('[DB] PostgreSQL startup check failed:',err.message);
      throw err;
    }
  }
  async get(code){
    try{
      const r=await this.pool.query('SELECT state FROM party_rooms WHERE code=$1',[code]);
      dbLog('Room read','code='+code+' found='+(r.rowCount>0));
      return r.rows[0]?r.rows[0].state:null;
    }catch(err){
      console.error('[DB] Room read failed:','code='+code,err.message);
      throw err;
    }
  }
  async set(code,state){
    try{
      await this.pool.query('INSERT INTO party_rooms(code,state) VALUES($1,$2) ON CONFLICT(code) DO UPDATE SET state=EXCLUDED.state,updated_at=NOW()',[code,state]);
      dbLog('Room saved','code='+code);
    }catch(err){
      console.error('[DB] Room save failed:','code='+code,err.message);
      throw err;
    }
  }
  async delete(code){
    try{
      await this.pool.query('DELETE FROM party_rooms WHERE code=$1',[code]);
      dbLog('Room deleted','code='+code);
    }catch(err){
      console.error('[DB] Room delete failed:','code='+code,err.message);
      throw err;
    }
  }
  async close(){await this.pool.end()}
}

function createStore(){return process.env.DATABASE_URL?new PostgresStore():new MemoryStore()}
module.exports={MemoryStore,PostgresStore,createStore};
