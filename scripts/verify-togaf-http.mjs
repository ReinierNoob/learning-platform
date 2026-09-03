import assert from 'node:assert/strict';
const base=process.env.EAW_ADAPTIVE_BASE_URL??'http://127.0.0.1:3100';
const course='00000000-0000-4000-8000-000000000001';
for(const endpoint of ['chat','grade-quiz']) {
 for(const [id,body,expected] of [['bad',{},400],['1',null,400],['1',{trainingId:course},401]]) {
  const response=await fetch(`${base}/api/${endpoint}/${id}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  assert.equal(response.status,expected,`${endpoint}/${id}`);
 }
}
for(const method of ['GET','POST']) {
 const response=await fetch(`${base}/api/practice/1?trainingId=${course}`,{method});
 assert.equal(response.status,401,`practice ${method} rejects unauthenticated`);
}
console.log('TOGAF HTTP contract: PASS (invalid requests and unauthenticated chat/grade/practice denied)');
