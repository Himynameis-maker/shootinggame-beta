/* Tunable constants */
const CFG={maxSlots:8,maxGhost:5,hp:3,tele:60, // tele = 予告表示のフレーム数(60 = 1秒) / maxGhost = 敵が撃つ過去の記録の数
  enemy:{speed:2.5,wait:30,minD:120,x0:.5,x1:.95,y0:.1,y1:.9}}; // 敵1体の動き: speed=px/フレーム(平均) wait=到着後に止まるフレーム minD=次の目標までの最低距離 x0..y1=移動範囲(画面比。全画面なら x0:.05,x1:.95)
