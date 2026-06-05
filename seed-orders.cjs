const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(process.cwd(),'data','tradicionale.db'));

const prods = db.prepare('SELECT id,name_sq,name_en,price FROM products').all();
const sources = ['online','phone','whatsapp','in_store'];
const statuses = ['new','preparing','out_for_delivery','delivered','delivered','delivered','cancelled'];
const names = ['Arben K.','Elira H.','Driton M.','Fatime B.','Gent S.','Liridona V.','Burim A.','Teuta R.','Valon Z.','Donika P.'];

const insOrder = db.prepare(`INSERT INTO orders (created_at,status,customer_name,phone,address,city,notes,payment_method,source,total) VALUES (?,?,?,?,?,?,?,?,?,?)`);
const insItem = db.prepare(`INSERT INTO order_items (order_id,product_id,name_sq,name_en,unit_price,quantity) VALUES (?,?,?,?,?,?)`);

function rnd(a){return a[Math.floor(Math.random()*a.length)];}
function mk(dateStr, n){
  for(let i=0;i<n;i++){
    const nItems = 1+Math.floor(Math.random()*3);
    const chosen=[]; let total=0;
    for(let j=0;j<nItems;j++){const p=rnd(prods); const q=1+Math.floor(Math.random()*3); chosen.push([p,q]); total+=p.price*q;}
    const status=rnd(statuses);
    const hh=String(9+Math.floor(Math.random()*9)).padStart(2,'0');
    const dd=String(1+Math.floor(Math.random()*26)).padStart(2,'0');
    const created=`${dateStr}-${dd} ${hh}:${String(Math.floor(Math.random()*60)).padStart(2,'0')}:00`;
    const info=insOrder.run(created,status,rnd(names),'04'+(4+Math.floor(Math.random()*5))+' '+Math.floor(100000+Math.random()*899999),'Rruga e Dëshmorëve '+(1+Math.floor(Math.random()*200)),'Prishtinë','',rnd(['cash']),rnd(sources),total);
    const oid=Number(info.lastInsertRowid);
    for(const [p,q] of chosen) insItem.run(oid,p.id,p.name_sq,p.name_en,p.price,q);
  }
}
mk('2026-05',18);  // last month
mk('2026-06',22);  // this month

const months=db.prepare("SELECT strftime('%Y-%m',created_at) ym, COUNT(*) c, ROUND(SUM(CASE WHEN status!='cancelled' THEN total ELSE 0 END),2) rev FROM orders GROUP BY ym ORDER BY ym").all();
console.log('orders by month:', months);
console.log('total orders:', db.prepare('SELECT COUNT(*) c FROM orders').get().c);
db.close();
