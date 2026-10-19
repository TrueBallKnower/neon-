const {test}=require('node:test');
const assert=require('node:assert/strict');
const {X509Certificate}=require('node:crypto');
const tls=require('node:tls');
const {databaseTlsOptions}=require('../database');

test('trust Supabase CA only for Supabase hosts, preserving TLS verification',()=>{
 const previous=process.env.DATABASE_CA_CERT;
 delete process.env.DATABASE_CA_CERT;
 try{
  const options=databaseTlsOptions('aws-0-eu-west-1.pooler.supabase.com');
  assert.equal(options.rejectUnauthorized,true);
  const ca=new X509Certificate(options.ca.at(-1));
  assert.equal(ca.ca,true);
  assert.equal(ca.fingerprint256,'80:70:25:AD:50:D4:ED:21:9D:2C:9C:7D:29:9C:00:4F:82:4E:B0:0C:F7:F6:5A:FE:F6:07:D0:7B:72:E6:CA:FA');
  assert.ok(ca.verify(ca.publicKey));
  assert.ok(Date.parse(ca.validFrom)<Date.now()&&Date.parse(ca.validTo)>Date.now());
  assert.ok(options.ca.length>tls.rootCertificates.length);
  tls.createSecureContext(options);
  for(const host of ['localhost','example.com','pooler.supabase.com.evil.example'])assert.deepEqual(databaseTlsOptions(host),{rejectUnauthorized:true});
  process.env.DATABASE_CA_CERT=options.ca.at(-1);
  assert.deepEqual(databaseTlsOptions('localhost'),{rejectUnauthorized:true,ca:options.ca.at(-1)});
 }finally{if(previous===undefined)delete process.env.DATABASE_CA_CERT;else process.env.DATABASE_CA_CERT=previous;}
});
