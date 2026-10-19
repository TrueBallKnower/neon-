const {test}=require('node:test'),assert=require('node:assert/strict');
const {verifyDatabaseConnection}=require('../database');
test('startup retries transient authentication without changing credentials or rerunning migrations',async()=>{
 let calls=0;const waits=[],retries=[];
 await verifyDatabaseConnection({async query(sql){assert.equal(sql,'SELECT 1');if(++calls<3)throw Object.assign(new Error('private details'),{code:'28P01'});}}, {wait:async ms=>waits.push(ms),onRetry:n=>retries.push(n)});
 assert.equal(calls,3);assert.deepEqual(waits,[1000,2000]);assert.deepEqual(retries,[1,2]);
});
test('permanent rejection remains fatal after four attempts; other failures are not retried',async()=>{
 for(const code of ['28P01','SELF_SIGNED_CERT_IN_CHAIN','42501']){
  let calls=0;const error=Object.assign(new Error('failure'),{code});
  await assert.rejects(verifyDatabaseConnection({async query(){calls++;throw error;}},{wait:async()=>{},onRetry:()=>{}}),e=>e===error);
  assert.equal(calls,code==='28P01'?4:1);
 }
});
