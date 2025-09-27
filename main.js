let gold=0,exp=0,level=1,upgradePoints=0;
const maxLevel=200;
let enemyMaxHp=100,enemyHp=100;
const baseDamage=10;
let upgrades={autoAttack:0,attackPower:0,attackSpeed:0,goldBoost:0};
let stoneSwords=0,wood=0,stone=0,hasRod=false;
let autoAttackEnabled=false;
const attackSpeedOptionsMs=[2500,2000,1000,500,200];
let boostEffects={exp2x:0,point2x:0};
let inventory=[]; 
let currentlyFishing=false;

const autoAttackBtn = document.getElementById('autoAttackToggle');

function updateAutoAttackBtn(){
  if(autoAttackEnabled){
    autoAttackBtn.textContent = '自動攻撃: ON';
    autoAttackBtn.style.background = '#22c55e';
  } else {
    autoAttackBtn.textContent = '自動攻撃: OFF';
    autoAttackBtn.style.background = '#ef4444';
  }
}

autoAttackBtn.onclick = () => {
  autoAttackEnabled = !autoAttackEnabled;
  updateAutoAttackBtn();
};

updateAutoAttackBtn();

function requiredExp(lv){return lv*10;}
function updateGold(){document.getElementById('gold').textContent=`Gold: ${Math.floor(gold)}`;saveData();}
function updateEnemyHp(){
  const pct=(enemyHp/enemyMaxHp)*100;
  const hpEl=document.getElementById('enemyHp');
  hpEl.style.width=Math.max(0,pct)+'%';
  document.getElementById('enemyHpText').textContent=`${Math.max(0,Math.floor(enemyHp))} / ${enemyMaxHp}`;
}
function updateExpUI(){
  const need=requiredExp(level);
  document.getElementById('expBar').style.width=Math.min(100,(exp/need)*100)+'%';
  document.getElementById('level').textContent=`Level: ${level}`;
}
function updateUpgradeUI(){
  document.getElementById('upgradePoints').textContent=upgradePoints;
  document.getElementById('uiAutoAttack').textContent=upgrades.autoAttack?'購入済み':'未購入';
  document.getElementById('uiAttackPower').textContent=upgrades.attackPower;
  document.getElementById('uiAttackSpeed').textContent=upgrades.attackSpeed;
  document.getElementById('uiGoldBoost').textContent=upgrades.goldBoost;
}
function updateMaterialsUI(){
  document.getElementById('uiWood').textContent=`木材 ${wood}`;
  document.getElementById('uiStone').textContent=`石 ${stone}`;
  document.getElementById('uiSwords').textContent=`石の剣 ${stoneSwords}`;
}
function floatGold(amount){
  const g=document.createElement('div');
  g.className='goldGain';g.textContent=`+${Math.floor(amount)}`;
  g.style.left='52%';g.style.top='36px';
  document.body.appendChild(g);
  setTimeout(()=>g.remove(),900);
}
function calculateAttackMultiplier(){
  const attackPowerMultiplier=Math.pow(2,upgrades.attackPower);
  const swordMultiplier=stoneSwords>0?(3*stoneSwords):1;
  return attackPowerMultiplier*swordMultiplier;
}
function getEffectiveDamage(){return baseDamage*calculateAttackMultiplier();}
function showError(msg){
    const errEl = document.createElement('div');
    errEl.style.position = 'fixed';
    errEl.style.left = '50%';
    errEl.style.top = '60%';
    errEl.style.transform = 'translate(-50%, -50%)';
    errEl.style.padding = '12px 20px';
    errEl.style.background = 'rgba(239,68,68,0.9)';
    errEl.style.color = '#fff';
    errEl.style.fontWeight = '700';
    errEl.style.borderRadius = '12px';
    errEl.style.boxShadow = '0 6px 20px rgba(0,0,0,0.4)';
    errEl.style.zIndex = '9999';
    errEl.style.opacity = '0';
    errEl.style.transition = 'all 0.5s ease';
    errEl.textContent = msg;
    document.body.appendChild(errEl);
    
    setTimeout(()=>{errEl.style.opacity='1'; errEl.style.transform='translate(-50%, -60%)';},50);
    setTimeout(()=>{
        errEl.style.opacity='0';
        errEl.style.transform='translate(-50%, -40%)';
        setTimeout(()=>errEl.remove(),500);
    },2000);
}

function attackEnemy() {
    try {
        const damage = getEffectiveDamage();
        enemyHp -= damage;
        if(enemyHp < 0) enemyHp = 0; // HPが負にならないようにする

        updateEnemyHp();

        if(enemyHp <= 0){
            const rewardGold = Math.floor(5 * (upgrades.goldBoost + 1) * (boostEffects.point2x > 0 ? 2 : 1));
            const rewardExp  = Math.floor(2 * (boostEffects.exp2x > 0 ? 2 : 1));

            if(isNaN(rewardGold) || isNaN(rewardExp)){
                showError('報酬計算でエラー発生');
                return;
            }

            gold += rewardGold;
            exp  += rewardExp;
            floatGold(rewardGold);
            updateGold();
            updateExpUI();

            // レベルアップ判定
            while(exp >= requiredExp(level) && level < maxLevel){
                exp -= requiredExp(level);
                level++;
                upgradePoints++;
            }

            // 次の敵を出す
            enemyMaxHp = 100 + Math.floor(level / 5) * 50;
            enemyHp = enemyMaxHp;
            updateEnemyHp();
        }
    } catch(e) {
        console.error(e);
        showError('攻撃処理でエラー発生: ' + e.message);
    }
}

document.getElementById('enemy').addEventListener('click',()=>{if(!currentlyFishing)attackEnemy();});

function showMenu(id){document.querySelectorAll('.menuScreen').forEach(m=>m.style.display='none');document.getElementById(id).style.display='block';}
function hideAllMenus(){document.querySelectorAll('.menuScreen').forEach(m=>m.style.display='none');}
document.getElementById('upgradeBtn').onclick=()=>showMenu('upgradeMenu');
document.getElementById('craftBtn').onclick=()=>showMenu('craftMenu');
document.getElementById('fishBtn').onclick=()=>showMenu('fishMenu');
document.getElementById('inventoryBtn').onclick=()=>showMenu('inventoryMenu');
document.getElementById('closeUpgrade').onclick=hideAllMenus;
document.getElementById('closeCraft').onclick=hideAllMenus;
document.getElementById('closeFish').onclick=hideAllMenus;
document.getElementById('closeInventory').onclick=hideAllMenus;

updateGold();updateEnemyHp();updateExpUI();updateUpgradeUI();updateMaterialsUI();
