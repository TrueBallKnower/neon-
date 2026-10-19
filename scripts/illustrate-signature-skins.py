"""Full-colour, individually drawn tile sets. No shared emblem/frame template.
Each tile reserves the middle for the live game numeral, never baked into art.
"""
from pathlib import Path
import math, random, json
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'public/skin-art'
def path(d,fill='none',stroke='none',w=1,opacity=1):return f'<path d="{d}" fill="{fill}" stroke="{stroke}" stroke-width="{w}" stroke-linejoin="round" stroke-linecap="round" opacity="{opacity}"/>'
def rect(x,y,w,h,c,r=0,stroke='none',sw=1):return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{c}" stroke="{stroke}" stroke-width="{sw}"/>'
def circle(x,y,r,c,stroke='none',w=1):return f'<circle cx="{x}" cy="{y}" r="{r}" fill="{c}" stroke="{stroke}" stroke-width="{w}"/>'
def ellipse(x,y,rx,ry,c,stroke='none',w=1):return f'<ellipse cx="{x}" cy="{y}" rx="{rx}" ry="{ry}" fill="{c}" stroke="{stroke}" stroke-width="{w}"/>'
def star(x,y,r,c,n=4):
 pts=[]
 for k in range(n*2):
  a=k*math.pi/n-math.pi/2;q=r if k%2==0 else r*.28;pts.append(f'{x+math.cos(a)*q:.2f},{y+math.sin(a)*q:.2f}')
 return f'<polygon points="{" ".join(pts)}" fill="{c}"/>'
def dots(rng,n,c):
 return ''.join(circle(rng.randrange(4,97),rng.randrange(4,97),rng.choice([.4,.6,1]),c) for _ in range(n))
def grad(id,a,b,radial=False):
 return f'<radialGradient id="{id}"><stop stop-color="{a}"/><stop offset="1" stop-color="{b}"/></radialGradient>' if radial else f'<linearGradient id="{id}" x2=".8" y2="1"><stop stop-color="{a}"/><stop offset="1" stop-color="{b}"/></linearGradient>'
def art(id,l):
 rng=random.Random(id+str(l));t=l/10;s='';defs='';accent='#ffffff';bg='#101522'
 def ground(a,b=None):
  nonlocal defs,s
  if b:defs+=grad('b'+str(l),a,b);s+=rect(0,0,100,100,f'url(#b{l})')
  else:s+=rect(0,0,100,100,a)
 # Homages use their own visual language and canonical palette progression.
 if id=='ores':return None
 if id=='capsules':
  colors=['#ef4352','#2588cf','#efbc41','#835cc8','#59a577','#d87935','#5fc4d7','#e77caa','#593c9e','#b6d7e2','#292737'];c=colors[l]
  ground('#e7edf3');s+=path('M0 0h100v49H0z',c)+path('M0 48h100v10H0z','#182535')
  s+=path('M-5 47Q50 24 105 47','none','#ffffff',1,.35)
  if l in [1,3,6,8]:s+=path('M14 0 24 29 36 12 44 0M56 0l8 12 12 17L86 0','#eee2be')
  s+=circle(50,53,24,'#152333')+circle(50,53,20,'#e8f2f6')+circle(50,53,16,'#b8c8d3')+circle(50,53,13,'#152333')
  s+=path('M4 4h16M4 4v16M80 96h16V80','none','#fff',2,.6)
  for n in range(l//3):s+=star(16+n*11,82,4,c,5)
 elif id=='mushroom':
  c=['#e6a629','#edb431','#d66439','#f0bf43','#5a9d55','#e4b448','#4b90c6','#bd6265','#8a63b6','#e8c56b','#f8d859'][l]
  ground('#8c481f');s+=rect(3,3,94,91,c,5,'#5a2d21',3)+rect(7,7,86,82,'none',3,'#ffe29b',2)
  for x,y in [(12,12),(88,12),(12,84),(88,84)]:s+=circle(x,y,3,'#62351f')+path(f'M{x-1} {y-1}h2','none','#f5d28a')
  s+=rect(6,94,88,6,'#6b361f')
  # A mushroom, a sprout and a brick course evolve at the foot of the block.
  s+=path('M12 77Q11 58 26 58T40 77z','#dc393b','#6a2923',1.5)+rect(22,76,10,14,'#ffe8bc',2,'#6a2923')
  s+=ellipse(21,68,4,5,'#fff3d4')+ellipse(32,69,3,4,'#fff3d4')
  if l>=3:s+=rect(65,82,27,10,'#df6f38',1,'#743821')+path('M65 87h27M78 82v5M71 87v5M86 87v5','none','#743821',1.5)
  if l>=7:s+=star(79,20,10,'#fff2a1',5)+ellipse(77,20,.8,2,'#774b26')+ellipse(82,20,.8,2,'#774b26')
 elif id=='bluevelocity':
  ground('#064db5','#07164c');s+=path('M0 15h35l-13 7H0M100 73H71l13-7h16M0 89h27l-12 7H0','#28a9ec')
  # The number sits in a giant gold collectible ring; checkerboard track below.
  s+=circle(51,48,35,'none','#071c55',13)+circle(50,46,34,'none','#d98711',9)+circle(49,44,34,'none','#ffe980',4)
  for row in range(2):
   for col in range(10):s+=rect(col*10,82+row*9,10,9,'#b5672c' if (row+col)%2 else '#efb369')
  s+=path('M0 81h100v4H0z','#56cc6b')
  if l>=4:s+=star(86,16,7,'#fff0a0')+star(14,43,4,'#fff0a0')
  if l>=8:s+=path('M12 10 20 14 9 18M83 60l10-7-3 11','#6fd9ff')
 elif id=='palehorn':
  ground('#172c41','#080f1e');s+=path('M0 100V39Q5 13 23 9L16 32 4 48v52M100 100V39Q95 13 77 9l7 23 12 16v52','#33485d')
  s+=path('M27 32Q27 16 21 3L39 15Q50 11 61 15L79 3Q73 16 73 32Q75 71 50 78 25 71 27 32','#f2eddc','#aab4b6',1.5)
  s+=ellipse(36,32,4,7,'#13202c')+ellipse(64,32,4,7,'#13202c')
  s+=path('M27 76 50 65l23 11 18 24H9z','#172939')+path('M31 81l19-10 19 10M26 90l24-10 24 10','none','#657487',1.3)
  for n in range(2+l//2):s+=ellipse(7+n*15,94-rng.randrange(9),1.5,3,'#72b7c2')
 elif id=='relic':
  ground('#163e37','#071f20');s+=path('M0 10 10 0h80l10 10v80L90 100H10L0 90z','none','#bc9854',5)
  s+=path('M3 23h9v54H3M97 23h-9v54h9','none','#377c70',4)
  s+=path('M50 5 41 21h18zM40 23 31 39h18zM60 23 51 39h18z','#ead38c')
  s+=path('M50 9 45 18h10z','#fff4bf')
  for x in [15,85]:
   s+=path(f'M{x} 16v66m-3-53h6m-6 11 6 6-6 6 6 6m-6 12h6','none','#71b9a6',1.4)
  s+=path('M22 85q28-17 56 0M30 92q20-14 40 0','none','#b99c63',1.5)
  if l>=5:s+=star(50,81,7,'#b6e6a6',6)
 elif id=='portals':
  ground('#dce3df');s+=path('M0 0h100v18H0zM0 86h100v14H0z','#303a46')
  s+=path('M10 18v68M34 18v68M66 18v68M90 18v68','none','#a6b8bb',.6)
  s+=ellipse(13,52,12,31,'#162c4e','#29bfff',4)+ellipse(87,52,12,31,'#4b2818','#ff9a38',4)
  s+=ellipse(13,52,8,26,'#22648a')+ellipse(87,52,8,26,'#9b4d1b')
  s+=path('M2 6h32M66 94h32','none','#f5f5dc',2)
  if l>=4:s+=rect(43,72,15,15,'#9caeb0',2,'#5c7379',1.5)+path('M46 75h9v9h-9z','#d5dadd')+circle(50.5,79.5,2.5,'#e69cc2')
  if l>=8:s+=path('M45 7h12M51 3v8','none','#a7e68a',2)
 elif id=='mazeghost':
  ground('#060910');s+=path('M3 3h94v94H3zM8 8h84v84H8zM15 18h23v9H24v10H15zM62 18h23v19h-9V27H62zM15 63h9v10h14v9H15zM62 73h14V63h9v19H62z','none','#294fe8',2)
  for x in range(14,93,9):s+=circle(x,12,1.3,'#ffe1a6')+circle(x,88,1.3,'#ffe1a6')
  s+=path('M21 42a11 11 0 1 0 0 18l-9-9z','#ffe044')
  c=['#ed555c','#f39cd0','#55d7df','#f2ac5d'][l%4];s+=path('M72 41q-10 0-10 11v13l5-4 5 4 5-4 5 4V52q0-11-10-11',c)
  for x in [68,76]:s+=ellipse(x,51,2.5,4,'#fff')+circle(x-1,51,1.2,'#24378b')
  if l>=6:s+=circle(14,88,3,'#ffe1a6')+circle(86,12,3,'#ffe1a6')
 elif id=='tetramino':
  ground('#10102d');s+=path('M7 0v100M24 0v100M41 0v100M58 0v100M75 0v100M92 0v100M0 7h100M0 24h100M0 41h100M0 58h100M0 75h100M0 92h100','none','#232044',.6)
  shapes=[([(0,0),(1,0),(2,0),(1,1)],'#c789f5'), ([(0,0),(1,0),(0,1),(1,1)],'#f6ca46'), ([(0,0),(1,0),(2,0),(3,0)],'#5bddeb'), ([(0,0),(0,1),(1,1),(2,1)],'#efa35a')]
  for k,(coords,c) in enumerate(shapes):
   for x,y in coords:
    px=(3 if k<2 else 54)+x*12;py=(4 if k%2==0 else 75)+y*12
    s+=rect(px,py,11,11,c,1)+path(f'M{px+1} {py+9}v-8h8','none','#ffffff',1,.65)+path(f'M{px+2} {py+10}h8v-8','none','#171535',1,.5)
  if l>=5:s+=path('M2 65h96','none','#c9fff5',2)
 elif id=='crewmate':
  colors=['#d74354','#51c5dc','#9653c0','#f0b94a','#68a164','#e992bf','#d47534','#656d9a','#b6d9cc','#7b4437','#b52f45'];c=colors[l]
  ground('#17243a');s+=dots(rng,12,'#7e9aba')
  s+=rect(7,40,16,41,c,6,'#131a2c',3)+path('M21 100V35Q21 8 54 8T87 35v65H66V83H43v17z',c,'#111b2d',4)
  s+=path('M25 38Q25 13 54 13q22 0 27 16','none','#ffffff',3,.2)
  s+=rect(41,25,49,23,'#395f81',10,'#132238',4)+rect(44,27,40,13,'#a8e4e9',7)+ellipse(59,30,12,3,'#e8fffc')
  if l>=5:s+=path('M24 12 32 3l17 8-7 9z','#f8c752','#20283c',2)
 elif id=='inkcity':
  ground('#1d1437');a,b=[('#dc53c7','#b8ef47'),('#52c4ea','#ff9b39'),('#b084f7','#ffdd64')][l%3]
  s+=path('M0 0h65L51 16 72 31 40 40 50 57 21 54 12 82 0 72z',a)+path('M100 100H28l21-18-12-12 33-8-5-19 28 8 7-31z',b)
  for n in range(14):s+=circle(rng.randrange(100),rng.randrange(100),rng.randrange(1,5),a if n%2 else b)
  s+=path('M11 22 28 3 44 23 37 20v11l-9-5-9 5V20z',b,'#1c1830',1.4)+ellipse(24,19,2,4,'#212339')+ellipse(32,19,2,4,'#212339')
 elif id=='matrixcode':
  ground('#020d0c');chars=['M0 0h4v6H0z','M0 0h4v3H0v3h4','M0 0v6m0-3h4V0m0 3v3']
  for col in range(10):
   for row in range(12):
    x=3+col*10;y=(row*9+col*5+l*3)%100;c=['#0e492f','#177a45','#31c26a','#8debac'][(row+col+l)%4]
    s+=f'<g transform="translate({x} {y})">'+path(chars[(row*3+col+l)%3],'none',c,.7)+'</g>'
  s+=rect(20,34,60,32,'#031710',3,'#24633f',.5)
 elif id=='strawsail':
  ground('#2b8c9e','#0f435e');s+=path('M0 0h100v12H0z','#e0c492')
  # Rope-framed nautical chart, straw hat and billowing sail.
  s+=path('M5 0v100M95 0v100','none','#ecd1a2',5)+path('M5 0v100M95 0v100','none','#9b774d',1)
  for y in range(1,100,6):s+=path(f'M2 {y}l6 4M92 {y}l6 4','none','#f7e1b3',.8)
  s+=ellipse(49,17,25,6,'#c1883c','#634725',1)+path('M32 16Q32 0 49 1T66 16','#e9b65e','#654b2b',1)+path('M33 12h32v4H33z','#b8453f')
  s+=path('M17 82h65l-10 12H28z','#995331','#e0c492',1)+path('M51 65v18M49 64 27 80h22M54 64l20 16H54','#f4e7c9','#dfcea5',1)
  if l>=6:s+=path('M0 72q12-7 25 0t25 0 25 0 25 0','none','#91d2cf',2)
 elif id=='forestcourier':
  ground('#c4e1cc');s+=path('M0 85 20 71 41 80 65 67l35 13v20H0z','#7ea79b')
  for x,y in [(1,0),(76,2),(87,65)]:
   s+=path(f'M{x} {y+32}q-8-24 8-32 23-3 16 22l-7 15z','#54826c')+path(f'M{x+7} {y+5}v36','none','#355b56',2)
  s+=path('M13 18q10-13 16 2L25 9l10 10q18 7 10 26-4 17-20 14T11 38z','#283b42')+ellipse(30,30,1.4,2,'#e8dfb7')
  s+=path('M36 60q28 2 46-20-3 17-21 23l23-1-15 8-33-5z','#9b6248')+path('M80 44l12-3-6 11','#dfcf9f')
  if l>=5:s+=path('M54 5q5-7 10 0l8 12H45z','#b65f65')+rect(50,17,18,12,'#f2e2bf',2)+path('M45 17h28','none','#846e62',1)
 elif id=='cupcartoon':
  ground('#ecdfbc');s+=path('M3 0v100M97 0v100','none','#302829',5)
  for y in range(2,100,9):s+=rect(1,y,5,4,'#f7edca')+rect(94,y,5,4,'#f7edca')
  s+=path('M21 27h53v43Q74 89 48 89T21 70z','#fff3cc','#34252c',3)+path('M74 37q26-6 19 20-3 10-19 8','none','#34252c',4)
  s+=path('M55 27 67 1h8L63 27','#e25149','#34252c',2)+path('M63 10h9M59 18h9','none','#fff0cb',3)
  s+=path('M16 92q12-9 23 0m21 0q10-9 22 0','none','#34252c',3)
  for x in [34,62]:s+=ellipse(x,38,2.5,4,'#34252c')
  s+=path('M39 76q10 8 20 0','none','#34252c',2)
 elif id=='sabers':
  ground('#121d32','#050810');s+=dots(rng,20,'#b4c7dc');c=['#65c9ff','#74e89d','#f75c67','#d49af9','#f9da76','#90f3e9','#f68bb9','#f39359','#7caaf6','#97e2b1','#f2df99'][l]
  s+=path('M15 88 85 11','none',c,8,.2)+path('M15 88 85 11','none',c,4)+path('M15 88 85 11','none','#f5fcff',1.3)
  s+=path('M10 93 28 73','none','#66778d',8)+path('M12 92 29 73','none','#e1d6bb',3)+path('M10 84l9 8M15 79l9 8M20 74l9 8','none','#233048',2)
  if l>=5:s+=path('M12 12 88 89','none','#ec6a77',6,.25)+path('M12 12 88 89','none','#ffb5b6',2)
  # The central number gets its own quiet, translucent cockpit pane.
  s+=path('M23 36h54l4 27H19z','#0c162b','none',1,.88)
 elif id=='dojo':
  c=['#d87c36','#d87c36','#cf7334','#456c7a','#d37536','#c57037','#3d4d49','#b6543d','#d1aa63','#bf5b36','#e7d7b0'][l]
  ground(c);s+=path('M0 30 22 39l9 61H0zM100 30 78 39l-9 61h31z','#23363d')
  s+=path('M5 36 22 44 30 100M95 36 78 44 70 100','none','#131e28',3)
  s+=rect(0,6,100,26,'#263a49',3)+rect(17,9,66,21,'#aebfc2',5,'#23313c',2)
  for x in [22,78]:s+=circle(x,14,1.4,'#586a73')+circle(x,25,1.4,'#586a73')
  s+=path('M58 14q-15-8-20 4t16 7q7-6-1-10-10-2-10 5l8 3M38 20l-7 7','none','#364d55',1.7)
  s+=path('M36 87q-6-12 8-15t20 9-15 15q-10-6-2-12l8 3','none','#273a40',2)
  if l>=5:s+=path('M3 52q14 8 3 19m88-19q-14 8-3 19','none','#d6d9bd',2)
  if l>=8:s+=path('M0 72q13 7 6 28M100 72q-13 7-6 28','none','#a8312d',3)
 elif id=='dragonspheres':
  ground('#9c4328','#482633');defs+=grad('orb'+str(l),'#ffe9a0','#da762b',True)
  s+=circle(50,50,45,f'url(#orb{l})','#f6bd5b',2)+path('M17 31Q29 8 58 12','none','#fff0b1',4,.65)
  count=l%7+1
  for n in range(count):
   x=50+(n-(count-1)/2)*8;y=23+(abs(n-(count-1)/2)%2)*4;s+=star(x,y,3.8,'#b53e30',5)
  if l>=7:
   s+=path('M0 100 10 31 19 54 18 7 36 29 45 0 59 27 79 5 77 39 93 21 100 100H78V72H22v28z','#edb658','#c87237',1)
   s+=path('M0 74 22 56 37 72h26l15-16 22 18v26H0z','#de7b3d','#653b2d',2)+path('M22 56 50 78l28-22-10 25H32z','#285273')
   s+=circle(50,48,27,'#b46531','#efc469',1)
  s+=path('M6 92q8-11 14-3M80 89q6-8 14 3','none','#ffdf91',1.5)
 elif id=='circuit':
  ground('#0b2a2e','#06141f');s+=rect(9,10,82,74,'#0a1c27',7,'#48726d',3)+rect(13,14,74,64,'#092c30',5,'#86b09a',.7)
  for y in range(17,77,4):s+=path(f'M16 {y}h68','none','#518d75',.4,.3)
  for x in [4,96]:
   for y in [23,37,61,75]:s+=circle(x,y,1.5,'#b3ccb0')
  s+=path('M24 25l5 4-5 4m11 0h8M18 69h15M66 21h14M65 69h15','none','#9dedc6',1.5)
  s+=rect(33,89,34,5,'#71847b',2)+circle(82,90,2,'#e8b177')
  if l>=6:s+=path('M18 17h12M18 17v7M82 75H70M82 75v-7','none','#b6f1d3',1.2)
 elif id=='saturn':
  ground('#252647','#0d1830');s+=dots(rng,40,'#dddbd8')
  s+=ellipse(50,51,51,16,'none','#a692b1',7)+ellipse(50,51,48,14,'none','#e4c9a2',2)
  defs+=grad('planet'+str(l),'#ead2a5','#9c786d',True);s+=circle(50,46,31,f'url(#planet{l})')
  s+=path('M24 30q26 8 52 0M20 39q30 9 60 0M19 48q31 9 62 0M23 58q27 8 54 0','none','#91756e',2,.4)
  s+=path('M1 52q49 35 98 0','none','#ddbf93',6)+path('M1 54q49 35 98 0','none','#f1d7aa',1)
  if l>=6:s+=circle(85,15,5,'#bbb6c3')+star(13,82,5,'#fff2ce')
 elif id=='mars':
  ground('#351f32','#11182b');s+=dots(rng,30,'#d2abb7');defs+=grad('planet'+str(l),'#dca079','#7b3f42',True)
  s+=circle(50,49,43,f'url(#planet{l})')
  for x,y,r in [(24,28,9),(76,30,7),(26,76,5),(70,73,11),(82,57,4),(46,13,3)]:
   s+=ellipse(x,y,r,r*.7,'#ac6555','#dc9673',1)+path(f'M{x-r} {y}q{r} {-r} {r*2} 0','none','#81454a',1)
  s+=path('M15 51q10-8 18 0t20 0 30 5M32 87q5-10 17-8','none','#86464a',1.5)
  s+=path('M42 9q10-4 18 1l-2 3H45z','#dfc3ad')
  if l>=6:s+=path('M4 95h92M7 90v10m86-10v10','none','#b5a5a6',1)
 # Aesthetic originals: bespoke composition and medium rather than hue swaps.
 elif id in ['pulse','blackhole','aurora']:
  ground('#132249' if id=='aurora' else '#211c40','#060d21');s+=dots(rng,48,'#c4d8eb')
  if id=='aurora':
   for k,c in enumerate(['#68e2bc','#61addb','#b3a0ec']):s+=path(f'M-10 {8+k*7}Q20 {40+k*5} 46 {8+k*3}T110 {19+k*5}','none',c,9,.5)
   s+=path('M0 92 13 79l10 12 18-18 21 20 21-16 17 17v6H0z','#0a2031')
  elif id=='pulse':
   s+=path('M11 82 30 20 78 13 90 71 56 88z','none','#6787bb',.8)
   for x,y in [(11,82),(30,20),(78,13),(90,71),(56,88)]:s+=star(x,y,3.5,'#fff1cb')
   s+=ellipse(86,86,21,9,'none','#dbb57d',1.2)+circle(86,86,10,'#56659b')
  else:
   defs+=grad('bh'+str(l),'#120c1b','#c5709c',True);s+=circle(50,52,34,f'url(#bh{l})')+ellipse(50,53,49,12,'none','#e8ba80',4)+ellipse(50,53,48,9,'none','#f6dfb7',1)+circle(50,49,22,'#080c18','#eea9ad',1.3)
   s+=path('M6 58q44 22 88 0','none','#8b7ec4',2)
  if l>=7:s+=star(18,15,6,'#fff1c2')+star(80,31,4,'#ebefff')
 elif id=='solar':
  ground('#592925','#201c25');s+=path('M0 79 20 69l14 10 20-10 21 9 25-13v35H0z','#171b25')
  for x in [6,94]:s+=path(f'M{x} 7v83','none','#c07b48',6)+path(f'M{x} 11v74','none','#efbd73',1)
  s+=circle(50,20,12,'#f8cf71','#a65433',2)
  for n in range(12):
   a=n*math.pi/6;s+=path(f'M{50+16*math.cos(a)} {20+16*math.sin(a)}l{4*math.cos(a)} {4*math.sin(a)}','none','#e6a961',2)
  s+=path('M17 94q-9-17 6-26-1 12 8 13-3-17 10-25-4 23 10 24 0-9 8-12 18 12 10 26z','#ce573d')+path('M25 97q-3-17 9-17 0 9 10 4l7-9 12 22z','#f7b85a')
 elif id=='phoenix':
  ground('#421a39','#19182e');s+=path('M50 29Q23-5 4 7l17 12L3 16l18 15-16-4 24 26-7 19 23-15h10l23 15-7-19 24-26-16 4 18-15-18 3L96 7Q77-5 50 29','#d46a54','#edba70',1)
  s+=path('M42 24q8-11 16 0l-3 7H45z','#f5d395')+path('M36 77 50 65l14 12-7 20-7-8-7 8z','#ef9c60')
  s+=path('M50 29q-17 15-13 38h26q4-23-13-38','#622338')
 elif id=='prism':
  ground('#182435');colors=['#487b9c','#ad6777','#619982','#b39359','#6a5d94']
  for n in range(12):
   a=n*math.pi/6;b=(n+1)*math.pi/6
   s+=path(f'M50 48  {50+80*math.cos(a)} {48+80*math.sin(a)} {50+80*math.cos(b)} {48+80*math.sin(b)}z',colors[(n+l//3)%5],'#1c2333',1.6)
  s+=circle(50,48,30,'#182536','#e0bf83',2)+path('M5 5h90v90H5z','none','#ccb180',3)+circle(50,48,24,'none','#7b98a8',.7)
  for x,y in [(12,12),(88,12),(12,88),(88,88)]:s+=star(x,y,8,'#f3d18d',6)
 elif id=='dragon':
  ground('#253e36','#101e25')
  for row in range(7):
   for col in range(6):
    x=col*20-(10 if row%2 else 0);y=row*16;s+=path(f'M{x} {y}q10 18 20 0v12l-10 10-10-10z',['#254c42','#38664c','#4e7a52'][(row+col+l//3)%3],'#122b2c',.8)
  s+=path('M8 33Q1 4 29 7L18 19l12 5-19 15M92 33Q99 4 71 7l11 12-12 5 19 15','#d8ba79','#675a3f',1)
  s+=path('M18 23 23 26 13 31zM82 23l-5 3 10 5z','#f3cb71')
  s+=path('M4 94 22 77 37 91 50 78 63 91 78 77 96 94','none','#b99b63',3)
 elif id=='abyss':
  ground('#174557','#091f35');s+=path('M0 15q50-18 100 0M0 24q50-18 100 0','none','#62a2a1',1,.5)
  for x,flip in [(0,1),(100,-1)]:
   for n in range(3):
    y=22+n*24;end=x+flip*(18+n*5)
    s+=path(f'M{x} {y}Q{end} {y-9} {end} {y+12}t{flip*4} 21','none',['#a078a8','#648ca8','#7798aa'][n],5)
    for k in range(3):s+=circle(end-flip*2,y+4+k*6,1,'#ddbdc7')
  s+=ellipse(50,87,18,6,'#102e44')+circle(50,84,7,'#e8d9cf','#9f9ab6',1)
  for n in range(5+l//2):s+=circle(rng.randrange(6,94),rng.choice([14,82,93]),rng.choice([1,2]),'none','#84bfc3',.7)
 elif id=='sakura':
  ground('#efe1d2');s+=path('M-5 90Q12 20 70 9T102-7M6 63Q10 12 32-2M37 32q36 11 64-6','none','#523b47',4)
  for x,y in [(17,40),(32,26),(56,14),(75,4),(82,27),(96,22),(13,13)]:
   for k in range(5):
    a=k*math.pi*2/5;s+=ellipse(x+math.cos(a)*3,y+math.sin(a)*3,3,2,'#d68f9d')
   s+=circle(x,y,1,'#e8bd7b')
  s+=path('M0 93q17-15 35 0t35 0 35 0','none','#567e88',2)+path('M0 99q17-15 35 0t35 0 35 0','none','#8da4a5',1)
  if l>=6:s+=circle(80,72,10,'#c26766')
 elif id=='pharaoh':
  ground('#173d64');s+=path('M0 0h100v13H0zM0 87h100v13H0z','#dcb76b')
  for x in range(0,100,10):s+=path(f'M{x} 2v9M{x} 89v9','none','#795d38',2)
  for x in [8,92]:
   for y in range(20,86,12):s+=path(f'M{x-3} {y}h6l-3 6z','none','#dfc080',1)
  s+=ellipse(50,19,8,5,'#47ada7','#f3d48c',1)+path('M40 19 21 15l4 5-8 3 24 1M60 19l19-4-4 5 8 3-24 1','#d6ab65')
  s+=path('M30 82 50 64l20 18z','#d5ad65')+path('M50 64v18h20z','#997344')
 elif id in ['gold','king']:
  ground('#a46a29' if id=='gold' else '#17264d','#3a291f' if id=='gold' else '#0e1025');c='#edca7e'
  s+=path('M5 5h90v90H5z','none',c,3)+path('M9 9h82v82H9z','none','#8d682f',.8)
  for x in [15,85]:
   for y in range(33,85,9):s+=ellipse(x,y,4,2.5,c)
   s+=path(f'M{x} 30v55','none',c,1)
  s+=path('M31 12 39 20 50 6l11 14 8-8-4 20H35z',c,'#fff0b5',1)
  for x,y in [(39,20),(50,13),(61,20)]:s+=circle(x,y,1.5,'#ac5e46' if id=='gold' else '#8fc4c9')
  s+=path('M35 88h30M41 83h18','none',c,1)
  if id=='king':s+=path('M10 9 22 25 10 42M90 9 78 25l12 17','#962f59')
  else:s+=path('M12 30 88 12M12 38 88 20','none','#ffe5a2',.8,.4)
 elif id=='jade':
  ground('#c7dbb5');s+=path('M0 75Q14 38 52 69t48-5v36H0z','#729e83')
  for x,y in [(0,4),(72,1),(84,68)]:
   s+=path(f'M{x} {y+29}Q{x-4} {y+2} {x+17} {y}q26 15 6 31z','#467e67')+path(f'M{x+5} {y+28}l16-23','none','#acd2a0',1)
  s+=ellipse(24,87,19,7,'#d0d8b2','#5c8970',1)+ellipse(78,12,12,7,'#d0d8b2','#5c8970',1)
  if l>=5:s+=circle(19,19,6,'#e8e0be')+circle(19,19,2,'#d6a970')
 elif id=='candy':
  ground('#f5d7ca');s+=path('M0 0h100v18Q87 4 75 18T50 18 25 18 0 18z','#bf7294')
  s+=path('M0 100V83q12 13 25 0t25 0 25 0 25 0v17z','#b6d6c9')
  s+=circle(15,25,11,'#f6edd1','#c6788a',2)+path('M8 25q8-13 14 0-3 10-10 2 0-6 6-4','none','#d78d9c',2)
  s+=rect(78,62,4,27,'#b88471',2)+circle(80,62,11,'#bfbbd7','#f6f0d7',2)+path('M74 62q7-12 13 0-3 9-9 1','none','#826eae',2)
  for n in range(8+l):
   x=rng.randrange(100);y=rng.choice([rng.randrange(0,12),rng.randrange(90,100)]);s+=rect(x,y,4,1.5,['#7aafab','#eac56f','#b06e91'][n%3],1)
 elif id=='disco':
  ground('#211b3c','#10172e');s+=circle(50,45,44,'#131423','#62577c',1)
  for r in [38,35,32,29,26]:s+=circle(50,45,r,'none','#4e4168',.7)
  s+=circle(50,45,21,'#9f5f94')+circle(50,45,16,'#19182c')
  for row in range(2):
   for col in range(10):s+=rect(col*10,82+row*9,9,8,['#76b4c7','#c1a364','#926eaf','#c37b92'][(row+col+l//2)%4])
  s+=path('M72 4 87 16v40l-9 9','none','#d5c9ac',2)
 elif id=='origami':
  ground('#e6caba');s+=path('M0 0 100 100H0z','#c5d7cf')+path('M100 0 43 48 100 100z','#dfb7af')
  s+=path('M0 0 100 100M100 0 43 48 100 100M43 48 0 100','none','#a18f83',.7)
  s+=path('M10 21 27 6 45 25 27 19 18 34z','#fff0d8','#ac8e79',.8)+path('M27 6v13l18 6','none','#c5a68e',1)
  s+=path('M60 83 77 64 91 92 76 83 62 94z','#698d94','#446a79',.8)+path('M77 64 76 83l15 9','none','#afd0c6',1)
 else:return None
 # Every tier has a distinct hand-placed progression signature, in that set's ink.
 # No universal crown or identical metallic border is applied.
 if l>=9 and id not in ['matrixcode','mazeghost','mushroom','tetramino']:s+=star(88,12,3.5,'#fff1ce')
 return defs,s

def generate():
 data=json.loads((ROOT/'public/skin-expansion.json').read_text());selection=data['selection']
 for id in selection:
  if id in ['original','ores']:continue
  groups=[];defs=[]
  for l in range(11):
   result=art(id,l)
   if result is None:raise ValueError('Missing authored art: '+id)
   d,s=result;defs.append(d);groups.append(f'<g transform="translate(0 {l*100})">{s}</g>')
  (OUT/(id+'.svg')).write_text('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 1100"><defs>'+''.join(defs)+'</defs>'+''.join(groups)+'</svg>')
if __name__=='__main__':generate()
