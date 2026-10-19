from pathlib import Path
import random,math
names=['ores','capsules','dojo','sabers','sakura','pharaoh','atlantis','candy','disco','origami']
orecolors=['#24242c','#d7b598','#cb8252','#ffe063','#ff3a51','#5277ff','#6be9eb','#57e394','#c894f7','#774da6','#71625c']
def circle(x,y,r,fill='none',stroke='white',width=1):return f'<circle cx="{x}" cy="{y}" r="{r}" fill="{fill}" stroke="{stroke}" stroke-width="{width}"/>'
def path(d,fill='none',stroke='white',width=1):return f'<path d="{d}" fill="{fill}" stroke="{stroke}" stroke-width="{width}" stroke-linejoin="round"/>'
def rect(x,y,w,h,fill,opacity=1):return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{fill}" stroke="none" opacity="{opacity}"/>'
def pattern(name,l):
 rng=random.Random(name+str(l));s='';t=l%3
 if name=='ores':
  s=rect(0,0,100,100,['#45454b','#4c4a47','#41454a'][l%3])
  for i in range(80):
   x,y=rng.randrange(0,24)*4,rng.randrange(0,24)*4;s+=rect(x,y,rng.choice([4,8,12]),4,rng.choice(['#22242b','#74747b','#92918d']),rng.choice([.15,.25,.35]))
  for cx,cy in [(17,19),(78,16),(13,72),(79,79)]:
   for j in range(5+t):
    x,y=(cx+rng.randrange(-8,9))//4*4,(cy+rng.randrange(-8,9))//4*4
    s+=rect(x+2,y+3,8,8,'#171b26',.7)+rect(x,y,8,8,orecolors[l])+rect(x,y,4,3,'white',.4)
  s+=path('M1 1h98v98H1z','none','#a6a6ab',1)
  if l>=8:s+=path('M5 45h9v5h4M95 52H86v-5h-4','none',orecolors[l],2)
  return s
 if name=='capsules':
  for x,y in [(16,16),(84,84)]:
   s+=circle(x,y,12,'none','white',1.5)+path(f'M{x-12} {y}h24','none','white',2)+circle(x,y,4,'#181928','white',1)+circle(x,y,1,'white')
  s+=path('M5 39v22M95 39v22M39 5h22M39 95h22')
  for n in range(t+1):s+=circle(40+n*10,8,2,'white')+circle(40+n*10,92,2,'white')
  if l>=4:s+=path('m7 76 4-6 4 6-4 6zM85 20l4-6 4 6-4 6z')
  if l>=8:s+=path('m29 8 3 5 6 1-4 4 1 6-6-3-5 3 1-6-4-4 6-1z')
 elif name=='dojo':
  s+=path('M7 7h86v86H7zM12 12h76v76H12z')
  for n in range(7):s+=path(f'M{15+n*10} 4l5 6M{15+n*10} 90l5 6M4 {15+n*10}l6 5M90 {15+n*10}l6 5')
  s+=circle(22,22,10)+path('M17 19q13-7 10 5-8 8-10 0 2-7 8-3')
  s+=path('m76 66 3 10 10 3-10 3-3 10-3-10-10-3 10-3z')
  if l>=4:s+=path('M33 84q17-10 34 0M35 88h30')
  if l>=8:s+=circle(78,22,10)+path('M78 13v18M71 17l14 10M71 27l14-10')
 elif name=='sabers':
  for flip in [False,True]:
   x=10 if not flip else 90;dx=1 if not flip else -1
   s+=path(f'M{x} 80l{dx*19} -53','none','white',1.4)+path(f'M{x+dx*2} 82l{dx*19} -53','none','white',.5)+path(f'M{x-dx*1} 83l{-dx*4} 11m{-dx*2} -6 5 2m-3-6 5 2','none','white',2)
  s+=path('M32 5h36M32 95h36M4 34v25M96 34v25')+path('m45 8 5 8 5-8-5-6z')
  for n in range(t+1):s+=rect(42+n*6,90,3,2,'white')
  if l>=7:s+=path('M20 15l-4-6M80 15l4-6M19 48l-7-3M81 48l7-3')
 elif name=='sakura':
  s+=path('M4 10q28-8 38 10M96 90q-28 8-38-10M4 89q9-8 18 0t18 0M60 11q9 8 18 0t18 0')
  for cx,cy in [(16,20),(83,78)]:
   for n in range(5):
    a=n*math.pi*2/5;dx,dy=math.cos(a)*9,math.sin(a)*9;s+=f'<ellipse cx="{cx+dx:.1f}" cy="{cy+dy:.1f}" rx="3" ry="5" transform="rotate({n*72} {cx+dx:.1f} {cy+dy:.1f})" fill="white" opacity=".6"/>'
   s+=circle(cx,cy,2,'white')
  if l>=4:s+=path('M3 62q9-10 18-2M79 40q9-8 18 2')
  if l>=8:s+=path('M32 89l35-5M38 94l26-3','none','white',2)
 elif name=='pharaoh':
  s+=path('M5 5h90v90H5zM10 10h80v80H10z')+path('M34 15 45 23h10l11-8M32 12l13 7h10l13-7M29 9l16 6h10l16-6')+circle(50,19,5)
  for x in [8,92]:
   for y in [30,48,66]:s+=path(f'M{x-2} {y}h4m-2-3v8m-3-1 3-2 3 2')
  s+=path('m36 91 14-17 14 17zM50 74v17')
  if l>=4:s+=path('M14 28l7 7-7 7M86 58l-7 7 7 7')
  if l>=8:s+=path('M28 8l-9 13M72 8l9 13M28 92l-9-13M72 92l9-13')
 elif name=='atlantis':
  s+=path('M2 24 50 3l48 21M7 24h86M12 26v50M18 26v50M82 26v50M88 26v50M7 76h16M77 76h16M3 89q12-12 24 0t24 0 24 0 24 0M3 95q12-12 24 0t24 0 24 0 24 0')
  s+=circle(50,14,5)+path('M50 7v14M43 14h14')
  for y in [36,48,60]:s+=circle(7,y,1.5,'white')+circle(93,y,1.5,'white')
  if l>=5:s+=path('M30 81q20-15 40 0M35 81l15-10 15 10')
  if l>=9:s+=path('M35 16l-7 4M65 16l7 4')
 elif name=='candy':
  s+=path('M5 5h90v90H5zM0 21q10 8 20 0t20 0 20 0 20 0 20 0M0 79q10-8 20 0t20 0 20 0 20 0 20 0')
  for x,y in [(16,12),(83,88)]:s+=circle(x,y,8)+path(f'M{x-7} {y}q7-12 14 0-7 12-14 0M{x} {y-7}q12 7 0 14-12-7 0-14')
  for n in range(8+t*3):
   x,y=rng.choice([rng.randrange(5,95),rng.choice([5,95])]),rng.choice([rng.randrange(4,17),rng.randrange(83,97)]);s+=rect(x,y,3,1.5,'white',.7)
  if l>=5:s+=path('m4 40 8-3 4 8-8 3zm80 15 9-4 3 8-8 4z')
 elif name=='disco':
  for row in range(2):
   for col in range(10):
    if (row+col)%2==0:s+=rect(col*10,row*5,10,5,'white',.5)+rect(col*10,90+row*5,10,5,'white',.5)
  for x,y in [(17,24),(82,76)]:
   for r in [12,9,6]:s+=circle(x,y,r)
   s+=circle(x,y,2,'white')
  s+=path('M4 44h7v18H4M89 38h7v18h-7')
  if l>=4:s+=path('M35 16v8m10-10v10m10-8v8m10-10v10M35 76v8m10-8v10m10-10v8m10-8v10')
  if l>=8:s+=path('m46 5 4 7 4-7M46 95l4-7 4 7')
 elif name=='origami':
  s+=path('M0 0 24 12 50 0l26 12L100 0M0 100l24-12 26 12 26-12 24 12M0 0l12 24L0 50l12 26L0 100M100 0 88 24l12 26-12 26 12 24')
  s+=path('m6 6 18 6-12 12zM94 94l-18-6 12-12zM94 6l-6 18-12-12zM6 94l6-18 12 12z')
  if l>=4:s+=path('M33 14l17 10 17-10-17 4zM33 86l17-10 17 10-17-4z')
  if l>=8:s+=path('m12 37 7 13-7 13 3-13zM88 37l-7 13 7 13-3-13z')
 # Add distinct frame jewels for every value, not merely a hue shift.
 for n in range(1+l//3):s+=circle(40+n*5,96,1,'white')
 return s
for name in names:
 groups=[]
 for l in range(11):groups.append(f'<g transform="translate(0 {l*100})">'+pattern(name,l)+'</g>')
 attr=' shape-rendering="crispEdges"' if name=='ores' else ''
 (Path(__file__).resolve().parents[1] / 'public' / 'skin-art' / (name+'.svg')).write_text('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 1100"'+attr+'><g fill="none" stroke="white" stroke-width=".85" stroke-linecap="round">'+''.join(groups)+'</g></svg>')

# Extended atelier: each authored silhouette gets eleven illustrated evolutions.
import json,hashlib,colorsys
root=Path(__file__).resolve().parents[1]
expansion=json.loads((root/'public/skin-expansion.json').read_text())
(root/'public/skin-expansion.js').write_text('(function(root){const data='+json.dumps(expansion,ensure_ascii=False,separators=(',',':'))+';if(typeof module!=="undefined")module.exports=data;else root.FusionSkinExpansion=data;})(typeof window!=="undefined"?window:globalThis);\n')
def material_frame(material,level,seed):
 rng=random.Random(str(seed)+':'+str(level));s='';kind=seed%4
 frames=['M2 12 12 2h76l10 10v76L88 98H12L2 88z','M3 3h94v94H3zM7 7h86v86H7z','M2 17Q2 2 17 2h66q15 0 15 15v66q0 15-15 15H17Q2 98 2 83z','M2 10 10 2h80l8 8v80l-8 8H10l-8-8zM8 16v68m84-68v68']
 s+=path(frames[kind],stroke='white',width=.85)
 if material in ['chrome','brass','carbon','engraved']:
  for x in [7,93]:
   for y in [8,30,70,92]:s+=circle(x,y,1.5,stroke='white')
  s+=path('M3 36h8v28H3M97 36H89v28h8M36 3v8h28V3M36 97v-8h28v8',width=.8)
  for n in range(1+level//2):s+=rect(38+n*4,7,2,3,'white',.65)+rect(38+n*4,90,2,3,'white',.65)
 elif material in ['silk','canvas','velvet','fur','bone']:
  for n in range(3,98,7):s+=path(f'M{n} 4l3 3M{n} 93l3 3M4 {n}l3 3M93 {n}l3 3',width=.55)
  for n in range(2+level//3):s+=path(f'M{32+n*7} 5q4 8 8 0M{32+n*7} 95q4-8 8 0',width=.7)
  if material=='bone':s+=path('M3 40l8 5-8 5 8 5-8 5M97 40l-8 5 8 5-8 5 8 5')
  elif material=='fur':s+=path('M4 35l5 7-4 8 5 8-6 7M96 35l-5 7 4 8-5 8 6 7',width=1.3)
 elif material in ['wood','stone','clay','sandstone','obsidian']:
  for n in range(4):
   y=8+n*3;s+=path(f'M31 {y}q15 {rng.randrange(-5,6)} 38 0M31 {100-y}q15 {rng.randrange(-5,6)} 38 0',width=.5)
  s+=path('M3 34l7 8-4 14 5 9M97 34l-7 8 4 14-5 9M38 2l7 9 10-5 8 4M38 98l7-9 10 5 8-4',width=.7)
  for n in range(level//3):s+=circle(40+n*8,94,1.2,'white')
 elif material in ['glass','ice','crystal','pearl']:
  s+=path('M2 2 17 13 35 2M65 2l18 11L98 2M2 98l15-11 18 11M65 98l18-11 15 11M2 35l11 15L2 65M98 35 87 50l11 15',width=.8)
  for n in range(1+level//3):
   x=36+n*8;s+=path(f'm{x} 4 3 4-3 4-3-4zM{x} 88l3 4-3 4-3-4z',width=.65)
  if material=='pearl':s+=circle(8,50,3)+circle(92,50,3)
 elif material=='pixel':
  s+=path('M2 20h5v10h5M98 20h-5v10h-5M2 80h5V70h5M98 80h-5V70h-5M35 2v5h30V2M35 98v-5h30v5',width=1.3)
  for n in range(2+level//2):s+=rect(35+n*5,8,3,3,'white',.7)
 else:
  s+=path('M3 34q15 8 0 16t0 16M97 34q-15 8 0 16t0 16M34 3q8 15 16 0t16 0M34 97q8-15 16 0t16 0',width=.75)
  for n in range(1+level//3):s+=circle(35+n*9,95,1.5,'white')
 return s
for skin in expansion['skins']:
 seed=int(hashlib.sha256(skin['id'].encode()).hexdigest()[:8],16);panels=[]
 for level in range(11):
  hue=skin['hues'][level];rgb=colorsys.hls_to_rgb((hue%360)/360,.75,.65);accent='#'+''.join(f'{int(c*255):02x}' for c in rgb)
  icon=skin['icon'];s=material_frame(skin['material'],level,seed)
  # Two individually authored emblems, extra inlays and a coronet at high values.
  for x,y,angle in [(7,7,0),(66,66,180)]:
   s+=f'<g transform="translate({x} {y}) scale(.75)"><path d="{icon}" fill="{accent}" fill-opacity=".12" stroke="{accent}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></g>'
  if level>=3:
   for x,y in [(76,6),(6,76)]:s+=f'<g transform="translate({x} {y}) scale(.45)"><path d="{icon}" fill="none" stroke="white" stroke-width="1.2"/></g>'
  if level>=6:s+=path('M32 4l6 8 12-5 12 5 6-8M32 96l6-8 12 5 12-5 6 8',stroke=accent,width=.85)
  if level>=9:s+=path('M33 17 50 11l17 6M33 83l17 6 17-6M17 33l-6 17 6 17M83 33l6 17-6 17',stroke='white',width=.65)
  # A different number of inset jewels, matched to each level's hue.
  for n in range(1+level%4):s+=circle(40+n*6,5,1,accent,accent,.5)
  panels.append(f'<g transform="translate(0 {level*100})">'+s+'</g>')
 (root/'public/skin-art'/(skin['art']+'.svg')).write_text('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 1100"><g fill="none" stroke="white" stroke-width=".85">'+''.join(panels)+'</g></svg>')
