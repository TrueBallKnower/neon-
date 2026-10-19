"""Sixty original miniature compositions, eleven material/light studies apiece.
The renderer shares drawing primitives, not a universal recoloured tile template.
"""
from pathlib import Path
import json,math,colorsys
ROOT=Path(__file__).resolve().parents[1]
def P(d,c='none',stroke='none',w=1,o=1):return f'<path d="{d}" fill="{c}" stroke="{stroke}" stroke-width="{w}" stroke-linejoin="round" stroke-linecap="round" opacity="{o}"/>'
def R(x,y,w,h,c,r=0,o=1):return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{c}" opacity="{o}"/>'
def C(x,y,r,c,stroke='none',w=1,o=1):return f'<circle cx="{x}" cy="{y}" r="{r}" fill="{c}" stroke="{stroke}" stroke-width="{w}" opacity="{o}"/>'
def E(x,y,rx,ry,c='none',stroke='none',w=1,o=1):return f'<ellipse cx="{x}" cy="{y}" rx="{rx}" ry="{ry}" fill="{c}" stroke="{stroke}" stroke-width="{w}" opacity="{o}"/>'
def poly(points,c,stroke='none',w=1,o=1):return f'<polygon points="{" ".join(str(x)+","+str(y) for x,y in points)}" fill="{c}" stroke="{stroke}" stroke-width="{w}" opacity="{o}"/>'
def star(x,y,r,c,n=4,o=1):return poly([(round(x+math.cos(i*math.pi/n-math.pi/2)*(r if i%2==0 else r*.3),2),round(y+math.sin(i*math.pi/n-math.pi/2)*(r if i%2==0 else r*.3),2)) for i in range(2*n)],c,o=o)
def ring(x,y,r,n,c,start=0):
 return ''.join(P(f'M{x+(r-3)*math.cos(a)} {y+(r-3)*math.sin(a)}L{x+r*math.cos(a)} {y+r*math.sin(a)}','none',c,.8) for a in [i*2*math.pi/n+start for i in range(n)])
def leaf(x,y,size,c,vein):return P(f'M{x} {y}q{-size} {-size*1.5} 0 {-size*2}q{size*1.5} {size} 0 {size*2}',c)+P(f'M{x} {y}v{-size*1.7}','none',vein,.7)
def gear(x,y,r,c,n=12):
 pts=[]
 for i in range(n*4):
  a=i*math.pi*2/(n*4);q=r if i%4 in [1,2] else r*.83;pts.append((x+math.cos(a)*q,y+math.sin(a)*q))
 return poly(pts,c)+C(x,y,r*.54,'#17212d')+C(x,y,r*.2,c)
def branch(x,y,scale,c):return P(f'M{x} {y}q{-7*scale} {-22*scale} 0 {-40*scale}M{x-2*scale} {y-12*scale}l{-13*scale} {-10*scale}m{11*scale} {2*scale}l{11*scale} {-14*scale}M{x-2*scale} {y-23*scale}l{-11*scale} {-11*scale}','none',c,2*scale)
def petals(x,y,r,n,c,center,phase=0):
 s=''
 for i in range(n):
  a=i*math.pi*2/n+phase;px=x+math.cos(a)*r*.6;py=y+math.sin(a)*r*.6
  s+=f'<g transform="rotate({i*360/n+phase*180/math.pi} {px} {py})">'+E(px,py,r*.65,r*.28,c)+'</g>'
 return s+C(x,y,r*.18,center)
def compose(skin,l):
 t=skin['tiles'][l];b,d,h,a=t['base'],t['dark'],t['light'],t['accent'];name=skin['composition'];n=l+1
 s='';ink='#f4e6c8';# A stable, different layout per skin; growing motifs and light per value.
 if name in ['planet','pulsar','comet','eclipse','supernova']:
  for k in range(16+n):s+=C((k*37+11)%97,(k*53+7)%97,.4+(k%3)*.25,h,o=.55)
 if name=='sovereign':
  s+=P('M6 6h88v88H6z','none',h,1.2)+P('M10 10h80v80H10z','none',a,.35)
  s+=P('M30 11 39 22 50 6l11 16 9-11-6 23H36z',b,h,1)+C(50,16,2,ink)
  for y in [39,50,61,72]:s+=P(f'M12 {y}l4 4-4 4-4-4zM88 {y}l4 4-4 4-4-4z','none',a,.6)
  s+=P('M36 87h28M42 82h16','none',h,.8)+ring(50,20,20,12+n,a)
 elif name=='planet':
  s+=C(75,87,48,b,h,.8)+E(70,88,64,22,'none',a,1.2,.6)+P('M20 81q45-13 80 7M29 92q38-9 71 3','none',h,2,.35)
  s+=P(f'M0 {20+n}Q50 {35+n} 100 {8+n}','none',a,2,.35)+star(21,19,2+l*.2,ink)
 elif name=='pulsar':
  for k in range(4+n//2):s+=E(80,17,9+k*5,3+k*3,'none',h,1,.65-k*.05)
  s+=P('M0 82q20-30 40 0t40 0 40 0M0 89q20-30 40 0t40 0 40 0','none',a,1.5,.65)+C(80,17,4+l*.2,ink)
 elif name=='comet':
  for k in range(5):s+=P(f'M{22+k*4} {8+k*2}Q{45+k*4} 23 {99} {63+k*4}','none',a if k%2 else h,1+k*.3,.4)
  s+=C(22,9,5+n*.2,h)+star(22,9,9+n*.3,ink)+P('M0 89q30-8 100 6','none',b,3)
 elif name=='eclipse':
  s+=C(77,16,34,a,o=.12)+C(77,16,26,h,o=.22)+C(77,16,21,d,h,1)+C(69,12,20,d)
  for k in range(3+n//3):s+=P(f'M{-9+k*6} 100Q{24+k*6} 68 100 {79+k*2}','none',a,.6,.35)
 elif name=='supernova':
  for k in range(18+n):
   ang=k*2*math.pi/(18+n);x=16+math.cos(ang)*(18+n);y=17+math.sin(ang)*(18+n)
   s+=P(f'M16 17L{x} {y}','none',[h,a,b,ink][k%4],.6+(k%3)*.4,.6)
  s+=C(16,17,4+n*.3,ink)+P('M0 84Q40 64 100 88','none',a,4,.5)+P('M0 91Q40 71 100 95','none',h,1,.5)
 elif name=='dew':
  s+=leaf(16,40,19,b,h)+leaf(88,104,22,a,h)
  for x,y,r in [(16,15,6+n*.13),(84,82,4+n*.17),(30,89,2+n*.08)]:
   s+=P(f'M{x} {y-r*2}q{-r*2} {r*2} 0 {r*3}q{r*2} {-r} 0 {-r*3}',b,h,.7)+E(x-1,y,r*.4,r*.9,'#fff4d9',o=.65)
 elif name=='leaves':
  s+=P('M-5 104Q16 63 3-3M105-4Q80 33 100 97','none',a,2)
  for k in range(3+n//3):s+=leaf(8+k*2,23+k*16,8+l*.2,b,h)+leaf(91-k*2,45+k*14,8+l*.2,a,h)
  s+=C(24,81,5,b,h,1)+C(79,18,3,h)
 elif name=='blossom':
  s+=P('M0 96q22-31 39-14M100 0Q74 13 76 34','none',a,1.4)
  s+=petals(14,84,14+n*.6,5,b,ink,.3)+petals(86,14,9+n*.45,6,h,a,.7)
  for k in range(n//2):s+=E(31+k*13,10+(k%3)*8,2,4,h,o=.7)
 elif name=='forest':
  for x,y,w in [(1,100,20),(85,100,17),(20,20,7)]:
   s+=P(f'M{x} {y}q{w/2} -44 {w} -100v100z',b)+P(f'M{x+w/2} {y}v-91','none',a,.7)
  s+=C(74,14,9+n*.35,h)+C(78,11,8,b)
  for k in range(4+n):s+=C((k*17+9)%96,(k*29+14)%94,.7,a,o=.6)
 elif name=='spirit':
  s+=P('M9 91q4-55 27-77Q50 5 64 14q23 22 27 77','none',a,.7)
  s+=petals(14,19,7+n*.4,4,h,ink,.5)+petals(87,84,9+n*.5,5,b,h,.2)
  s+=P('M31 88q19-23 38 0l-19 9z',a)+C(50,84,3,ink)
 elif name=='tide':
  for k in range(6):s+=P(f'M-10 {8+k*16}q18 {-6-n*.4} 36 0t36 0 36 0','none',[b,a,h][k%3],1+k*.2,.45)
  s+=P('M-5 88q34-36 61-15t60-11v38H0z',b)+P('M0 87q34-28 59-13t50-7','none',h,1,.8)
 elif name=='coral':
  s+=branch(12,102,.9+l*.015,a)+branch(91,95,.8+l*.02,h)+branch(4,35,.45,b)
  for k in range(4+n//2):s+=C(10+(k*13)%80,92-(k%3)*5,1.2,h)
 elif name=='jelly':
  for x,y,r in [(20,17,17),(85,81,12)]:
   s+=P(f'M{x-r} {y}q{r} {-r*2} {r*2} 0z',b,h,1)+E(x,y,r,3,h,o=.6)
   for k in range(3+n//4):s+=P(f'M{x-r+4+k*5} {y}q-6 13 0 26t0 18','none',a,.7,.7)
 elif name=='pearl':
  for k in range(9+n//2):
   x=8+k*84/(8+n//2);s+=P(f'M50 96Q{x} 80 {x} {77-abs(x-50)*.35}','none',a,1)
  s+=E(50,88,32,8,b,h,.7)+C(50,83,8+n*.5,h,a,1)+C(47,80,2.5,'#fff6e8')
  s+=E(17,17,8,5,'none',a,.7)
 elif name=='leviathan':
  for x,sg in [(0,1),(100,-1)]:
   for k in range(3):s+=P(f'M{x} {12+k*29}q{sg*22} -8 {sg*(17+n*.4)} 17t{sg*10} 23','none',[b,a,h][k],3.6-k*.6,.8)
  for k in range(6):s+=E(9,15+k*13,1.7,2.5,a)+E(92,14+k*13,1.7,2.5,h)
  s+=P('M22 94q28-20 56 0','none',a,2)
 elif name=='highway':
  s+=P('M0 100 41 64h18l41 36z',d)+P('M16 100 44 68M84 100 56 68','none',a,1.2)
  for k in range(4):s+=R(49,70+k*8,2,3+k,h)
  s+=C(77,20,10+n*.3,a)+P('M0 23h20v17H0M88 12h12v36H88',b,h,.6)
 elif name=='skyline':
  for k in range(9):
   x=k*13-4;y=5+(k*13)%25;s+=R(x,y,10,29+(k%3)*8,b,1)
   for j in range(2+n//4):s+=R(x+2,y+4+j*5,2,1.5,h,o=.7)
  s+=P('M0 91h100M0 95h100','none',a,1.5,.6)
 elif name=='rainwindow':
  for k in range(16+n):
   x=(k*19)%105;y=(k*31)%100;s+=P(f'M{x} {y}l-3 12','none',h,.6,.5)
  s+=R(7,7,4,80,a,2,.8)+R(75,83,29,2,b,1)+P('M8 83q43-17 80 8','none',a,2,.5)
 elif name=='neontube':
  for k in range(2):s+=P('M1 32V17Q1 4 18 4h64q17 0 17 13v15M1 68v15q0 13 17 13h64q17 0 17-13V68','none',h if k else a,1 if k else 5,.85 if k else .17)
  s+=P('M14 16h31l-9 10M86 84H55l9-10','none',a,2)
  for k in range(1+n//3):s+=R(12+k*5,89,2,3,h)
 elif name=='megacity':
  s+=P('M0 0h27v35L0 28zM100 0H71v27l29 8zM0 100h28V74L0 68zM100 100H73V74l27-9z',b,h,.8)
  for k in range(3+n//3):s+=P(f'M{5+k*4} 7v20M{95-k*4} 93V76','none',a,1)
  s+=P('M32 8h36M50 0v13M7 50h9M84 50h9','none',h,1.2)
 elif name=='pixelmountain':
  s+=R(73,9,14+n*.3,13,h)+poly([(0,33),(13,20),(24,30),(37,9),(56,32),(76,18),(100,34),(100,39),(0,39)],b)
  s+=P('M0 86h13v-8h10v8h19v-5h18v8h16v-8h24v19H0z',a)
  for k in range(4+n//2):s+=R((k*17)%97,92-(k%3)*3,3,3,h,o=.65)
 elif name=='crt':
  s+=R(2,2,96,96,b,11)+R(7,7,86,76,d,8)+P('M10 12q40-7 80 0','none',h,1,.7)
  for y in range(13,79,4):s+=P(f'M10 {y}h80','none',a,.35,.3)
  s+=R(30,89,30+n,3,h,1)+C(83,90,2,a)
 elif name=='pixelcoin':
  pts=[(28,4),(72,4),(72,10),(89,10),(89,28),(95,28),(95,72),(89,72),(89,89),(72,89),(72,95),(28,95),(28,89),(10,89),(10,72),(4,72),(4,28),(10,28),(10,10),(28,10)]
  s+=poly(pts,b,h,2)+R(20,20,60,60,d)+P('M28 24h44M24 28v44M28 76h44','none',a,3)
  for k in range(1+n//3):s+=R(28+k*8,84,5,5,h)
 elif name=='cabinet':
  s+=P('M10 2h80l6 67-10 28H14L4 69z',b,h,1.2)+R(13,12,74,62,d,3)+R(15,5,70,4,a)
  s+=P('M9 80h82l-5 12H14z',a)+C(69,85,3,d)+C(79,85,3,d)+P('M24 88v-9','none',d,2)+C(24,79,3,h)
  for k in range(n//3):s+=R(18+k*5,69,3,2,h)
 elif name=='pixelisland':
  s+=P('M0 68h100v32H0z',b)+P('M0 80h28v-5h47v5h25v20H0z',a)+P('M10 89h19v-4h42v4h18v5H10z',h)
  s+=P('M6 8h17v-4h12v4h10v9H6zM66 20h11v-5h16v5h7v7H66z',h)
  s+=P('M80 86V63h-5v-9h5v-8h5v17h5v9h-5v14z',d)
 elif name=='geode':
  for k in range(12):
   ang=k*math.pi/6;ang2=(k+1)*math.pi/6;x=50+math.cos(ang)*64;y=50+math.sin(ang)*64
   s+=poly([(x,y),(50+math.cos(ang2)*64,50+math.sin(ang2)*64),(50+math.cos(ang2)*33,50+math.sin(ang2)*33),(50+math.cos(ang)*33,50+math.sin(ang)*33)],[b,a,h][k%3],d,.6)
  s+=ring(50,50,44,12+n,h)
 elif name=='seal':
  s+=C(50,50,45,'none',a,1)+C(50,50,38,'none',h,.6)+ring(50,50,42,12+n,a,l*.08)
  for k in range(6):
   ag=k*math.pi/3;xx=50+math.cos(ag)*37;yy=50+math.sin(ag)*37;s+=star(xx,yy,3,h,3)
  s+=P('M19 83 50 8l31 75z','none',a,.7,.65)
 elif name=='crystal':
  s+=poly([(4,17),(20,2),(33,24),(18,40)],b,h,1)+poly([(18,40),(20,2),(33,24)],a,h,.6)
  s+=poly([(65,84),(79,60),(97,79),(86,99)],b,h,1)+P('M79 60 86 99M65 84l32-5','none',h,.8)
  for k in range(1+n//3):s+=star(79-k*10,11+(k%2)*9,2.5,h)
 elif name=='grimoire':
  s+=R(5,3,91,94,b,5)+R(11,7,80,86,d,2)+P('M17 3v94M5 18h18M5 81h18','none',a,2)
  s+=P('M78 10h10v10M78 90h10V80M22 13h13M22 87h13','none',h,2)
  s+=C(79,51,4,a)+P('M84 51h15','none',a,3)
  for k in range(1+n//3):s+=R(9,31+k*9,2,5,h)
 elif name=='arcaneheart':
  s+=P('M50 14q15-23 31-1t-31 68Q3 35 19 13t31 1',b,a,1)+P('M50 14v67M19 13l62 0M26 47l24-33 24 33-24 34z','none',h,.6)
  s+=C(50,50,43,'none',a,.5)+ring(50,50,43,10+n,h)
 elif name=='strawberry':
  for x,y in [(12,12),(83,82)]:
   s+=P(f'M{x-10} {y}q10-7 20 0-1 15-10 19-9-4-10-19',b,h,.7)+petals(x,y-1,6,5,a,h)
   for k in range(5):s+=E(x-5+(k%3)*4,y+4+(k//3)*5,.6,1.2,h)
  s+=P('M0 0h100v9q-12 17-25 0-12 17-25 0-12 17-25 0-12 17-25 0z',h,o=.5)
 elif name=='caramel':
  s+=P('M0 0h100v22q-9 0-9-10v26q0 9-7 8V21q0-12-9-8V30q0 8-6 8V15q-13-8-16 3v6q0 9-7 9V11H0z',b,h,.5)
  s+=P('M0 86q22-17 42 0t58 0v14H0z',a)+P('M8 90q40-7 84 2','none',h,1.3)
 elif name=='mint':
  s+=P('M0 0h100v100H0z','none',h,5)+leaf(16,35,13,b,h)+leaf(84,98,15,a,h)
  for k in range(3+n//3):s+=P(f'M{30+k*9} 7l6 6-6 6-6-6z',h,o=.5)
  s+=P('M12 85h49M18 90h53','none',a,2)
 elif name=='cotton':
  for x,y,r in [(8,11,19),(30,1,17),(97,75,19),(78,100,21)]:s+=C(x,y,r,b)+C(x-3,y-4,r*.75,h,o=.35)
  s+=P('M5 25q27-19 43-9M62 89q17-15 38-4','none',h,1)
  s+=P('M8 93 19 69l7 24z',a)
 elif name=='sugargalaxy':
  for k in range(9+n):s+=star((k*31+7)%100,(k*43+6)%100,1+(k%3),[h,a,b][k%3],5,.8)
  s+=E(80,19,21,7,'none',h,2)+C(80,19,10,b,a,1)+P('M0 86q24-16 46 0t54 0v14H0z',a)
  for k in range(6):s+=R(k*18+2,92+(k%2)*3,5,2,h,1)
 elif name=='copper':
  s+=P('M0 0h100v100H0z','none',a,6)+P('M7 7h86v86H7z','none',h,.6)
  for x,y in [(12,12),(88,12),(12,88),(88,88)]:s+=C(x,y,3,b,h,1)+P(f'M{x-2} {y}h4','none',h,.7)
  for k in range(2+n//3):s+=P(f'M{20+k*7} 5v8M{80-k*7} 95v-8','none',h,.7)
  s+=P('M4 38h9v24H4M96 38h-9v24h9','none',h,1)
 elif name=='clock':
  s+=C(50,50,46,b,h,1.3)+C(50,50,39,d,a,.8)+ring(50,50,43,60,h)
  s+=P(f'M50 50L{50+31*math.cos(n*.35)} {50+31*math.sin(n*.35)}M50 50 32 20','none',h,1.1,.65)
  for k in range(12):
   ag=k*math.pi/6;s+=C(50+math.cos(ag)*35,50+math.sin(ag)*35,1,a)
 elif name=='gears':
  s+=gear(11,12,23,a,14)+gear(88,89,26,b,16)+gear(95,11,13,h,10)
  s+=P('M3 76h15v17h31M97 24H82V7H51','none',h,1.3)
  for k in range(2+n//3):s+=C(26+k*7,90,1.2,h)
 elif name=='escapement':
  s+=P('M15 0 5 100M85 0l10 100','none',a,3)+C(50,19,14,'none',h,1)+ring(50,19,17,16+n,a)
  s+=P('M21 84h58M28 74v21M72 74v21M39 77l11 12 11-12','none',h,1.5)
  s+=gear(13,84,12,b,10)+gear(87,84,12,a,10)
 elif name=='orrery':
  s+=C(50,50,43,'none',h,.8)+E(50,50,47,22,'none',a,1)+E(50,50,25,46,'none',h,.7)
  for k in range(3+n//3):
   ag=k*1.6+l*.2;s+=C(50+40*math.cos(ag),50+40*math.sin(ag),3+k%3,[a,b,h][k%3],h,.6)
  s+=gear(50,91,8,a,10)
 elif name=='dawn':
  s+=C(50,96,46,b)+C(50,96,33,a)+ring(50,96,47,24+n,h)
  s+=P('M0 20q50 12 100 0M0 28q50 12 100 0','none',h,.8,.6)
  for k in range(4):s+=P(f'M0 {85+k*5}q50-8 100 0','none',h,.7)
 elif name=='temple':
  s+=P('M0 20 50 2l50 18z',a,h,.8)+P('M5 24h90M5 88h90M0 96h100','none',h,3)
  for x in [10,88]:s+=R(x,28,5,56,b)+P(f'M{x+2} 28v56','none',h,1)
  s+=C(50,14,4+n*.15,h)
 elif name=='amber':
  s+=poly([(18,4),(81,4),(96,29),(85,92),(15,92),(4,29)],b,h,1.3)+poly([(18,4),(31,25),(22,82),(15,92),(4,29)],a)
  s+=P('M32 11 40 20 50 7l10 13 8-9-5 20H37z',h)+P('M33 87h34','none',a,2)
  s+=P('M75 5q-10 23 10 44M7 69q14-17 17-6','none',h,.6,.5)
 elif name=='solareclipse':
  s+=C(50,16,24,a,o=.25)+C(50,16,19,h)+C(54,13,19,d)
  s+=P('M0 93 17 71l16 14 17-21 17 21 16-14 17 22v7H0z',b,h,.8)+P('M0 97h100','none',h,2)
 elif name=='suntemple':
  s+=P('M0 36 50 0l50 36M7 35h86M7 93h86','none',a,2.5)
  s+=C(50,14,10,h)+ring(50,14,16,16+n,a)
  for x in [10,85]:s+=R(x,37,5,53,b)+P(f'M{x+2} 37v49','none',h,1)
  s+=P('M22 89h56M28 83h44','none',h,1.3)
 elif name=='clouds':
  for x,y,r in [(6,8,20),(31,2,18),(93,88,24),(70,100,18)]:s+=C(x,y,r,b)+E(x-2,y-5,r*.7,r*.35,h,o=.18)
  s+=P('M16 24 11 34h9l-5 14','none',a,1.3)+P('M78 73h15l-7 9h8l-12 12','none',h,1)
 elif name=='raindrops':
  for k in range(9+n//2):
   x=(k*27+11)%100;y=(k*37+7)%100;s+=P(f'M{x} {y-5}q-5 7 0 10 5-3 0-10',b,h,.6)
  s+=E(50,91,39,5,'none',a,.8)+E(50,91,25,2,'none',h,.6)
 elif name=='arcs':
  s+=P('M0 26 22 19l-6 10 19-3M100 76l-23 6 6-11-19 3','none',h,2)
  s+=P('M9 0v16l12 8M91 100V84L79 76','none',a,1)
  for x,y in [(8,14),(91,85)]:s+=C(x,y,5,b,h,.8)+C(x,y,2,h)
 elif name=='stormcrown':
  s+=P('M13 7 30 23 50 3l20 20L87 7l-9 29H22z',b,h,1.5)
  s+=P('M6 80h15L10 92h19M94 80H79l11 12H71','none',a,1.5)+ring(50,12,27,12+n,h)
 elif name=='cyclone':
  for k in range(8):s+=f'<g transform="rotate({k*45+l*2} 50 50)">'+P('M52 10q37-7 42 20Q87 10 65 22','none',[a,b,h][k%3],1.4,.65)+'</g>'
  s+=C(50,50,34,'none',a,.7)+C(50,50,28,'none',h,.4)
 elif name=='window':
  s+=P('M7 96V34Q7 2 50 2t43 32v62z','none',h,2)
  for k in range(6):s+=P(f'M50 28 {10+k*16} 5M50 72 {10+k*16} 95','none',a,1)
  s+=P('M7 28h86M7 72h86M24 28V6M76 28V6','none',h,.8)
 elif name=='auroraglass':
  for k in range(7):s+=P(f'M{k*17-25} 0l40 100h17L{k*17-8} 0z',[b,a,h][k%3],d,.6,.6)
  s+=P('M3 3h94v94H3z','none',h,1)+P('M0 25h100M0 75h100','none',a,.6)
 elif name=='rosewindow':
  for k in range(12):
   ang=k*math.pi/6;s+=f'<g transform="rotate({k*30} 50 50)">'+E(50,16,9,15,[b,a,h][k%3],d,.8)+'</g>'
  s+=C(50,50,27,d,h,1)+C(50,50,46,'none',h,1.2)
 elif name=='diamond':
  pts=[(50,0),(100,35),(80,100),(20,100),(0,35)];s+=poly(pts,b,h,1.1)
  s+=poly([(50,0),(70,35),(50,100),(30,35)],a,h,.8)+P('M0 35h100M50 0 20 100M50 0l30 100M0 35l50 65 50-65','none',h,.7)
 elif name=='kaleidoscope':
  for k in range(12):
   an=k*math.pi/6;an2=(k+1)*math.pi/6;s+=poly([(50,50),(50+75*math.cos(an),50+75*math.sin(an)),(50+75*math.cos(an2),50+75*math.sin(an2))],[b,a,h][(k+l//3)%3],d,.9,.8)
  s+=poly([(50,17),(82,35),(82,65),(50,83),(18,65),(18,35)],d,h,1)+ring(50,50,46,18+n,h)
 elif name=='error':
  s+=P('M3 28V3h28M69 3h28v25M97 72v25H69M31 97H3V72','none',h,2)
  for k in range(8):s+=R((k*13)%100,8+(k*17)%88,4+(k%3)*7,2,a,o=.5)
  s+=P('M17 15h12m-6-6v12M71 85h12','none',h,1)
 elif name=='hologram':
  for k in range(0,100,4):s+=R(0,k,100,.5,h,o=.3)
  s+=P('M50 3 96 25v52L50 98 4 77V25z','none',a,1.2)+P('M4 25 50 48l46-23M50 48v50','none',h,.7)
  s+=P('M4 67 50 90l46-23','none',h,.5)
 elif name=='ghost':
  s+=P('M24 31Q24 1 50 1t26 30v60l-9-7-9 9-8-7-8 7-9-9-9 7z',b,h,.9,.6)
  s+=E(39,23,3,5,h)+E(61,23,3,5,h)
  for k in range(5+n//3):s+=R(17+k*9,80+(k%3)*4,7,2,a,o=.7)
 elif name=='fracture':
  s+=poly([(0,0),(49,0),(34,27),(62,40),(33,72),(41,100),(0,100)],b)
  s+=P('M53 0 38 27l28 13-29 32 8 28','none',h,2)+P('M58 0 43 27l28 13-29 32 8 28','none',a,.8)
  for k in range(5):s+=R(72-(k%2)*65,13+k*18,23,2,h,o=.55)
 elif name=='datacrown':
  s+=P('M14 8 29 24 50 5l21 19L86 8l-8 29H22z','none',h,2)+P('M24 33h52M29 29h42','none',a,1)
  for k in range(12+n//3):s+=R((k*17+9)%98,75+(k%5)*5,4+(k%3)*5,1.6,[b,a,h][k%3],o=.7)
  s+=P('M8 46v18M92 46v18','none',a,2)
 else:raise ValueError(name)
 # Quiet central light: faithful gradients remain visible; high-contrast numerals sit above.
 # Surface properties evolve per value and are shared with the live renderer.
 return s

def render():
 data=json.loads((ROOT/'public/atelier-catalog.json').read_text());out=ROOT/'public/atelier-art';out.mkdir(exist_ok=True)
 for sk in data['skins']+[data['champion']]:
  defs=['<clipPath id="tile"><rect width="100" height="100"/></clipPath>'];groups=[]
  for l,t in enumerate(sk['tiles']):
   # Light direction belongs to the chosen material, with an authored value progression.
   origins={'cosmic':(18,18),'botanic':(12,4),'liquid':(50,0),'glass':(8,90),'pixel':(0,0),'mineral':(18,6),'satin':(23,5),'metal':(8,3),'enamel':(18,18),'storm':(75,0),'hologram':(2,40)}
   x,y=origins[sk['material']];center=t.get('center',t['dark'])
   defs.append(f'<linearGradient id="ground{l}" x1="{x}%" y1="{y}%" x2="{100-x}%" y2="{100-y}%"><stop stop-color="{t["base"]}"/><stop offset=".57" stop-color="{t["dark"]}"/><stop offset="1" stop-color="{t["base"]}"/></linearGradient>')
   defs.append(f'<radialGradient id="quiet{l}"><stop stop-color="{center}" stop-opacity=".97"/><stop offset=".58" stop-color="{center}" stop-opacity=".80"/><stop offset="1" stop-color="{center}" stop-opacity="0"/></radialGradient>')
   content=R(0,0,100,100,t['dark'] if sk['material']=='pixel' else f'url(#ground{l})')
   if sk['material']=='metal':
    for yy in range(2,100,4):content+=P(f'M0 {yy}h100','none',t['light'],.35,.14)
   elif sk['material']=='botanic':
    for k in range(22):content+=C((k*23+7)%100,(k*37+3)%100,.4,t['light'],o=.17)
   elif sk['material']=='liquid':
    content+=P('M20 0 2 100H6L24 0M58 0 32 100h4L62 0',t['light'],o=.10)
   elif sk['material']=='satin':
    content+=E(26,7,40,12,t['light'],o=.12)
   elif sk['material']=='hologram':
    for yy in range(2,100,5):content+=R(0,yy,100,.5,t['light'],o=.16)
   elif sk['material']=='pixel':
    for k in range(14):content+=R((k*17)%100,(k*29)%100,2,2,t['light'],o=.13)
   content+=compose(sk,l)
   content+=R(20,36,60,29,center,0,.88) if sk['material']=='pixel' else E(50,51,39,24,f'url(#quiet{l})')
   # Value-specific study: growing inset light, silhouette changes and ordered material colours.
   if l>=8:content+=star(89,11,2+(l-8)*.5,t['light'],6,.8)
   groups.append(f'<g transform="translate(0 {l*100})"><g clip-path="url(#tile)">{content}</g></g>')
  pixel=' shape-rendering="crispEdges"' if sk['style']=='pixel' else ''
  (out/(sk['id']+'.svg')).write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 1100"{pixel}><defs>'+''.join(defs)+'</defs>'+''.join(groups)+'</svg>')
 print('Rendered',len(data['skins']),'individually composed sheets /',len(data['skins'])*11,'tile studies')
if __name__=='__main__':render()
