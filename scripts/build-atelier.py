"""Authored art direction. All palettes and compositions are intentional, not random HSL shifts."""
from pathlib import Path
import json,colorsys
ROOT=Path(__file__).resolve().parents[1]
# id, name, motto, lore, palette, effects, merge grammar, surface, emblem
worlds=[
('nebula','NEBULA','Les enfants des étoiles','Dans les débris du premier ciel, les astronomes ont enfermé cinq phénomènes impossibles. Chaque fusion en révèle la lumière.',['#0c1736','#5c4b99','#73cfe3','#e794b6','#ecd3a1'],'cosmic','cosmic','cosmic','✧'),
('eden','EDEN','Le jardin des esprits','Un jardin pousse sans soleil. Ses feuilles gardent la mémoire de la rosée ; ses fleurs ne s’ouvrent qu’à ceux qui savent attendre.',['#122e2a','#658e76','#b2d4ba','#d6a8b8','#f1e9cb'],'leaves','botanic','botanic','❧'),
('abyssal','ABYSS','Les lumières des profondeurs','Au-dessous de la dernière marée, des êtres de lumière ont bâti un royaume. Leurs reliques respirent encore au rythme de l’océan.',['#092637','#245b6c','#73c9c4','#8489c4','#ddc6de'],'water','abyssal','liquid','◎'),
('afterlight','AFTERLIGHT','La ville qui ne dort jamais','À 02:09, la ville a perdu ses habitants. Ses enseignes continuent d’écrire des messages dans la pluie. Quelqu’un répond aux néons.',['#101523','#314561','#72cbda','#d276b3','#ed947f'],'electric','electric','glass','ϟ'),
('arcade','ARCADE LEGACY','Les souvenirs du futur','Une salle de jeux oubliée reste allumée après minuit. Derrière chaque écran, un paysage de pixels attend sa prochaine partie.',['#17172e','#745896','#d19c9b','#e5bd77','#7db8b8'],'electric','arcade','pixel','▦'),
('arcana','ARCANA','Les reliques oubliées','Les sept portes du sanctuaire sont closes. Dans la pierre, les sceaux et les grimoires, un ancien langage recommence à briller.',['#201c36','#7963a1','#85b9bd','#b296bf','#ddc59b'],'alchemy','crystal','mineral','◇'),
('sugar','SUGAR DREAMS','La fabrique des rêves','Chaque nuit, les confiseurs du ciel distillent les rêves en sucre. Au matin, il reste des nuages de crème et des constellations de caramel.',['#50333f','#d69cae','#d9c3a3','#96c6b4','#b4a2cf'],'ribbons','confection','satin','♡'),
('chronos','CHRONOS','Les horlogers du temps','Une manufacture répare les secondes perdues. Ses mécanismes ne mesurent pas les heures : ils conservent les instants que personne ne veut oublier.',['#181f2c','#8a7463','#c89570','#dac9a5','#97b2c5'],'gears','mechanical','metal','⚙'),
('solaris','SOLARIS','Les royaumes du soleil','Au sommet des temples d’ivoire, les gardiens entretiennent un soleil miniature. Son dernier rayon n’appartient à aucun royaume.',['#302331','#ae724c','#dfb76d','#f4e2b6','#7099ac'],'sand','solar','enamel','☼'),
('tempest','TEMPEST','Les gardiens de l’orage','Les navigateurs racontent qu’une couronne dort au centre de chaque tempête. Ses éclairs dessinent une route qui ne reste ouverte qu’un instant.',['#152331','#4f6b7e','#8fcad4','#968cb3','#e0e8df'],'lightning','electric','storm','⌁'),
('prismatic','PRISM','Les cathédrales de lumière','Une cité entière a été taillée dans le verre. Ses cathédrales transforment les souvenirs en couleurs, et la lumière en architecture.',['#20263f','#6389aa','#b983a8','#d6b278','#83b8a7'],'crystal','crystal','glass','❖'),
('glitch','GLITCH','Les fantômes du système','Un programme s’est souvenu d’un rêve. Depuis, des silhouettes traversent les écrans, des fragments s’échappent et le système invente ses propres fantômes.',['#0d2028','#4a9c8c','#82d5c1','#8baed5','#cf8eba'],'portal','glitch','hologram','⌘')]
# Each skin has a composition, a surface, its own ordered eleven-colour journey and a line of lore.
# Palettes are short author-selected anchor journeys, interpolated in RGB, never randomized.
entries=[
('nebula-cobalt','Horizon Cobalt','nebula','planet',['#101e43','#234666','#3a869d','#78bcc4','#e7cfa4'],'common','Le jour se lève ailleurs. Ici, l’horizon n’a pas de fin.'),
('nebula-pulsar','Pulsar Violet','nebula','pulsar',['#211f48','#51417f','#975b9d','#d48db1','#e9c8df'],'rare','Un battement traverse le vide. Puis un autre.'),
('nebula-comet','Comète Solaire','nebula','comet',['#172d48','#647e9a','#d1aa77','#d17e61','#f3dba7'],'epic','Elle ne revient jamais, mais laisse des chemins de lumière.'),
('nebula-dark','Matière Noire','nebula','eclipse',['#101829','#27233f','#4d3a64','#776591','#c0a8bb'],'legendary','Certaines étoiles brillent. D’autres préfèrent avaler la lumière.'),
('nebula-supernova','Supernova','nebula','supernova',['#132447','#5b478b','#bb719b','#67c0c2','#edb77d','#f3e7cb'],'mythic','Il suffit d’une étincelle pour réécrire l’univers.'),
('eden-dew','Rosée du Matin','eden','dew',['#203c38','#557f70','#8db69e','#b9d2b0','#e8dfb9'],'common','Le monde appartient à ceux qui s’éveillent avant le soleil.'),
('jade','Jardin de Jade','eden','leaves',['#143b39','#23635b','#5f9680','#96bea0','#d0d7b3'],'rare','La pierre s’est souvenue qu’elle était une feuille.'),
('eden-bloom','Floraison Céleste','eden','blossom',['#35484d','#738c94','#b2a8bb','#d3a0b5','#eed8c5'],'epic','Ses fleurs ne connaissent ni saison ni pesanteur.'),
('eden-whisper','Forêt des Murmures','eden','forest',['#162f32','#2c4b45','#597b66','#91a78c','#c7d5ae'],'legendary','Écoute assez longtemps. Les arbres finiront par dire ton nom.'),
('eden-spirit','Esprit du Printemps','eden','spirit',['#294c46','#649b8b','#b2d4b9','#dfd5b1','#f0d3c9'],'mythic','Le printemps n’arrive pas. Il se réveille.'),
('abyss-tide','Marée Nocturne','abyssal','tide',['#092a3b','#1b4f62','#377d8c','#69aeb0','#afcdc0'],'common','La nuit aussi a ses marées.'),
('abyss-coral','Corail Fantôme','abyssal','coral',['#143644','#3b637c','#8a819f','#c6a1b8','#e8cbbb'],'rare','Un jardin blanc pousse là où le soleil n’a jamais existé.'),
('abyss-jelly','Méduse Électrique','abyssal','jelly',['#142848','#38577c','#6589b4','#9cb1cf','#d4c4dc'],'epic','Une lanterne sans flamme guide les voyageurs des fonds.'),
('abyss-pearl','Perle des Abysses','abyssal','pearl',['#123441','#40737b','#89ada8','#c4c1c5','#e3d8c5'],'legendary','Une seule perle peut garder le silence de tout un océan.'),
('abyss-leviathan','Léviathan','abyssal','leviathan',['#102c36','#275563','#507c91','#8ba9b7','#d1c4d5'],'mythic','Lorsque la mer respire, c’est lui qui rêve.'),
('after-midnight','Midnight Drive','afterlight','highway',['#152238','#2c465a','#746378','#bd8a9b','#e2b08f'],'common','La route continue après la dernière enseigne.'),
('after-district','Neon District','afterlight','skyline',['#172237','#3b446a','#7772a6','#a788b8','#d4b6cd'],'rare','Les fenêtres racontent les vies que la ville a oubliées.'),
('after-rain','Electric Rain','afterlight','rainwindow',['#192e3e','#376879','#6596a8','#93bdc4','#d4d8ca'],'epic','La pluie transforme les souvenirs en reflets.'),
('after-pink','Pink Voltage','afterlight','neontube',['#302340','#694361','#ae6a91','#d99ab1','#f0d0ca'],'legendary','Un fil rose relie les nuits les plus lointaines.'),
('after-2099','Afterlight 2099','afterlight','megacity',['#102332','#326374','#7595af','#bb8eab','#e8c3a7'],'mythic','Quand la ville s’endort, les néons prennent le pouvoir.'),
('arcade-sunrise','Pixel Sunrise','arcade','pixelmountain',['#39385b','#756587','#b58996','#d7a686','#f0d49c'],'common','Un nouveau jour tient dans quelques pixels.'),
('arcade-crt','CRT Dreams','arcade','crt',['#132d34','#34665f','#64a08d','#9bc1aa','#d8ddbe'],'rare','L’écran ronronne encore dans une chambre vide.'),
('arcade-gold','Eight Bit Gold','arcade','pixelcoin',['#493b38','#876446','#bd945f','#d8bb7d','#f4e1ad'],'epic','Le trésor n’a jamais eu besoin de plus de huit bits.'),
('arcade-midnight','Midnight Arcade','arcade','cabinet',['#171b38','#49406c','#7b6590','#af88a7','#d9b79f'],'legendary','Une dernière pièce avant que le monde ne revienne.'),
('arcade-paradise','Game Over Paradise','arcade','pixelisland',['#234e61','#558584','#9db2a0','#dac6a5','#eac0a9'],'mythic','Certains écrans de fin cachent un lieu où rester.'),
('arcana-amethyst','Améthyste','arcana','geode',['#34284d','#675381','#9a7cae','#c0a8cd','#e4d5df'],'common','Une nuit entière s’est cristallisée dans cette pierre.'),
('arcana-seal','Sceau Éternel','arcana','seal',['#283d4b','#547d84','#87afa6','#bcc6ac','#e2d3b2'],'rare','Le pacte tient encore, bien que son auteur ait disparu.'),
('arcana-astral','Cristal Astral','arcana','crystal',['#253451','#536c95','#8ea2c3','#beb9d6','#e0d6e4'],'epic','Un éclat de ciel, taillé comme une promesse.'),
('arcana-grimoire','Grimoire Royal','arcana','grimoire',['#2f354c','#5e5b79','#91809b','#bea3b0','#e1c7b1'],'legendary','Ses pages ne s’ouvrent qu’à la lumière d’un souvenir.'),
('arcana-heart','Cœur de l’Arcane','arcana','arcaneheart',['#382b46','#855879','#b67e9e','#d7b0b4','#ecddbd'],'mythic','La magie a un cœur. On l’entend parfois battre.'),
('sugar-strawberry','Strawberry Cloud','sugar','strawberry',['#91586b','#bb7c93','#dba6b4','#e9c3cb','#f2dfd4'],'common','Les nuages n’ont pas tous le goût de la pluie.'),
('sugar-caramel','Caramel Sunset','sugar','caramel',['#684738','#a9774f','#cea378','#dfbfa1','#eee0c7'],'rare','Le soleil a fondu dans une cuillère d’ambre.'),
('sugar-mint','Minty Wonderland','sugar','mint',['#38665f','#68a28c','#9dc9af','#c6dfc4','#e6ebd5'],'epic','Un jardin frais sous une fine coquille de sucre.'),
('sugar-cotton','Cotton Candy','sugar','cotton',['#685177','#9d82aa','#c3a6c6','#dfc8da','#f2e4db'],'legendary','Un rêve devient fil, puis nuage, puis lumière.'),
('sugar-galaxy','Sugar Galaxy','sugar','sugargalaxy',['#534764','#a37b9e','#d6a1b2','#96bdc1','#edcead'],'mythic','Quelqu’un a renversé une boîte de rêves dans les étoiles.'),
('chronos-copper','Copper Age','chronos','copper',['#403534','#78594c','#ad8064','#d1ab85','#e5d1ab'],'common','Le cuivre retient la chaleur des mains qui l’ont façonné.'),
('chronos-midnight','Midnight Clock','chronos','clock',['#172535','#3a4d68','#687893','#9cabc0','#d3d8cd'],'rare','L’aiguille s’est arrêtée à l’heure d’un secret.'),
('chronos-golden','Golden Mechanism','chronos','gears',['#413929','#7e6c45','#b6a06b','#d3be8a','#e9ddbc'],'epic','Une mécanique si précise qu’elle peut retenir l’aube.'),
('chronos-silver','Silver Paradox','chronos','escapement',['#263945','#5b7788','#91a5b6','#bac8d2','#e0e7e1'],'legendary','L’instant d’après est parfois celui d’avant.'),
('chronos-eternal','Eternal Chronos','chronos','orrery',['#29303b','#806c61','#b99a7c','#d4c2a1','#ede1c3'],'mythic','Chaque seconde est précieuse. Certaines sont éternelles.'),
('gold','IMPERIAL GOLD','solaris','imperialgold',['#704c2d','#b17d45','#d3ab65','#e6ca88','#f7e8bd'],'common','L’or des douze royaumes, frappé à la main. Chaque fusion révèle un nouveau sceau impérial.'),
('solaris-temple','Temple of Light','solaris','temple',['#364b5a','#718e9b','#b5b7a5','#dcc8a0','#f3e5c7'],'rare','Ses colonnes ne soutiennent rien, sinon le jour.'),
('solaris-amber','Amber Crown','solaris','amber',['#5c382f','#a45e3e','#cc8d58','#e2b17a','#f3d6a0'],'epic','La couronne protège une flamme vieille de mille étés.'),
('solaris-eclipse','Eclipse Royale','solaris','solareclipse',['#241e32','#59415d','#91706f','#c49b7c','#e9cba1'],'legendary','Même le soleil s’incline devant certaines ombres.'),
('solaris-prime','Solaris Prime','solaris','suntemple',['#46313b','#9a664e','#d09f69','#e7ca91','#f7edcf'],'mythic','Un rayon suffit à rendre son nom à un royaume.'),
('tempest-born','Stormborn','tempest','clouds',['#24394b','#4a6479','#7e94aa','#abbac5','#dee4da'],'common','Né entre le grondement et la première goutte.'),
('tempest-rain','Rainfall','tempest','raindrops',['#1a3c4c','#3e6d7c','#77a4ae','#aed0cf','#dfe8de'],'rare','La pluie sait laver ce que le temps ne peut effacer.'),
('tempest-pulse','Electric Pulse','tempest','arcs',['#263650','#576b97','#7fa4c4','#a4cdd8','#e3e8de'],'epic','Un éclair ne dure rien. Son souvenir dure longtemps.'),
('tempest-crown','Thunder Crown','tempest','stormcrown',['#302c48','#625a88','#8d8eac','#b8bdc9','#e0e1d5'],'legendary','Les rois du ciel ne portent pas de couronne tranquille.'),
('tempest-eye','Eye of the Storm','tempest','cyclone',['#183c48','#427485','#84afb9','#bfd2d4','#e8e7db'],'mythic','Au centre du chaos, quelqu’un a construit le silence.'),
('prism-window','Crystal Window','prismatic','window',['#31495e','#60859b','#9cb4bc','#c9cbbf','#e8ddc3'],'common','Une fenêtre ouverte sur un endroit qui n’existe pas encore.'),
('prism-aurora','Aurora Glass','prismatic','auroraglass',['#39476a','#7a6f9b','#a6b2c2','#b4d3c7','#ead8d1'],'rare','La lumière hésite entre cinq couleurs, puis les choisit toutes.'),
('prism-stained','Stained Dreams','prismatic','rosewindow',['#333853','#8a637a','#b88b9b','#b3b29d','#e1cca5'],'epic','Les rêves oubliés deviennent parfois des vitraux.'),
('prism-diamond','Diamond Spectrum','prismatic','diamond',['#30475b','#6a8b9b','#a1b9c4','#c8d2d6','#efeadb'],'legendary','Chaque facette contient une autre manière de voir le monde.'),
('prism-infinite','Infinite Prism','prismatic','kaleidoscope',['#463b66','#8073a5','#b895b4','#8dbcb6','#edcfaa','#f1e5dc'],'mythic','La dernière couleur est celle qu’on n’a pas encore inventée.'),
('glitch-zero','Error Zero','glitch','error',['#122b2f','#2b5b57','#5b9587','#9ec3af','#d2ddc8'],'common','Le premier bug fut un désir de liberté.'),
('glitch-hologram','Hologram','glitch','hologram',['#253f59','#5d86aa','#93b7cb','#bdc8de','#e0d4e3'],'rare','Une image se souvient qu’elle pourrait être réelle.'),
('glitch-ghost','Digital Ghost','glitch','ghost',['#1d3538','#49736e','#7ea695','#b6c8ad','#e2dfc7'],'epic','Quelqu’un est resté de l’autre côté de l’écran.'),
('glitch-fracture','Cyber Fracture','glitch','fracture',['#23374c','#6d628c','#ad88a7','#90b4bc','#e5c1ba'],'legendary','Par la fissure, on aperçoit les couleurs du système suivant.'),
('glitch-king','Glitch King','glitch','datacrown',['#182f38','#4c8a92','#8dbac2','#c1a9cd','#ebd7d4'],'mythic','Il n’a pas pris le pouvoir. Il a réécrit ce mot.')]

def blend(a,b,t):
 a=tuple(int(a[i:i+2],16) for i in [1,3,5]);b=tuple(int(b[i:i+2],16) for i in [1,3,5]);return '#'+''.join(f'{round(x+(y-x)*t):02x}' for x,y in zip(a,b))
def luminance(c):
 a=[int(c[i:i+2],16)/255 for i in [1,3,5]];return sum(k*(v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4) for k,v in zip([.2126,.7152,.0722],a))
worlds.append(('homages','HOMMAGES · JEUX','Des mines à la ligue','Deux souvenirs de jeu prennent vie : les minerais de Minecraft et les capsules de Pokémon. Des créations dessinées pour Fusion, avec onze étapes reconnaissables par thème.',['#142334','#535965','#e8bc60','#81d8dd','#de6e83'],'crystal','arcade','pixel','▣'))
entries.extend([
 ('ores','Minecraft · Minerais','homages','minecraftores',['#353842','#b2764b','#c7b395','#dbb74e','#ca4549','#3e71c0','#9a6fd0','#4ca568','#6ddad7','#73574c','#3b3341'],'epic','Du charbon à la netherite : onze strates de roche, de pépites et de cristaux. La mine devient ta grille.'),
 ('capsules','Pokémon · Ligue des Capsules','homages','pokecapsules',['#df4e53','#4080c4','#d8b54e','#ece4d6','#4baaa4','#76a9d3','#509666','#2e303b','#e7a7be','#d37a45','#9257c1'],'legendary','Poké, Super, Hyper, Honor, Filet, Scuba, Sombre, Luxe, Soin, Chrono et Master : toute une ligue de captures.')])
collections={}
for id,name,motto,lore,palette,fx,merge,surface,icon in worlds:
 collections[id]=dict(id=id,name=name,motto=motto,hint=lore,color=palette[3],ground=palette[0],palette=palette,fx=fx,merge=merge,surface=surface,icon=icon,type='core',motifs=' · '.join({'cosmic':['Halos','poussière','orbites'],'botanic':['Rosée','nervures','pétales'],'liquid':['Ondes','nacre','bioluminescence'],'glass':['Reflets','lumière','verre'],'pixel':['Pixels','trames','écrans'],'mineral':['Facettes','runes','pierre'],'satin':['Crème','sucre','rubans'],'metal':['Gravures','rouages','alliages'],'enamel':['Ambre','ivoire','soleil'],'storm':['Vent','pluie','éclairs'],'hologram':['Données','fantômes','interférences']}[surface]))
collections['homages']['type']='homage'
skins=[]
for k,(id,name,collection,composition,anchors,rarity,lore) in enumerate(entries):
 c=collections[collection];tiles=[]
 for level in range(11):
  pos=level*(len(anchors)-1)/10;idx=min(len(anchors)-2,int(pos));base=blend(anchors[idx],anchors[idx+1],pos-idx)
  dark=blend(base,c['palette'][0],.63);
  while (1.05/(luminance(dark)+.05))<5:dark=blend(dark,c['palette'][0],.1)
  light=blend(base,'#fff4da',.28);ink='#fbf3df' if luminance(dark)<.30 else '#172231'
  lightCenter=(level>=7 and composition in ['dew','spirit','pearl','mint','cotton','escapement','diamond','hologram']) or (level==10 and composition in ['supernova','suntemple','kaleidoscope'])
  center=light if lightCenter else dark;ink='#172231' if lightCenter else ink
  tiles.append(dict(value=2**(level+1),center=center,base=base,dark=dark,light=light,ink=ink,accent=c['palette'][(level+1)%5],surface=c['surface'],detail=level+1,border=1 if level<4 else 2,depth=round(.18+level*.023,3),hue=round(colorsys.rgb_to_hls(*[int(base[i:i+2],16)/255 for i in [1,3,5]])[0]*360)))
 # Different rhythms, tuning, partials and envelopes; synth remains bounded to <=8 voices.
 audio=dict(wave=['sine','triangle','triangle','sine','square'][k%5],root=round(.70+(k%13)*.087,3),ratios=[[1,1.498,2.996],[1,1.2599,2.52],[1,1.335,2.67],[1,2.4,3.2],[1,1.189,1.782]][k%5],tail=round(.10+(k%7)*.033,3),slide=round(.8+(k%6)*.13,3),rhythm=round(.018+(k%5)*.011,3),volume=.8 if rarity in ['common','rare'] else .95)
 skin=dict(id=id,name=name,collection=collection,rarity=rarity,hint=lore,story=lore,composition=composition,art='atelier-'+id,atelier=True,signature=True,sprite=True,style='pixel' if c['surface']=='pixel' else 'rounded' if c['surface'] in ['satin','liquid'] else 'tech' if collection in ['glitch','afterlight'] else 'engraved',material=c['surface'],fx=c['fx'],sound=c['fx'],hues=[t['hue'] for t in tiles],marks=['·','✧','✦'],tiles=tiles,ink=tiles[0]['ink'],ground=tiles[0]['dark'],board=dict(background=c['palette'][0],empty=blend(c['palette'][0],c['palette'][2],.13),edge=blend(c['palette'][0],c['palette'][3],.35),accent=c['palette'][3]),animation=dict(profile=c['merge'],intensity=round(.8+(k%5)*.09,2),angle=(k%5-2)*1.6,duration=200+(k%5)*22),audio=audio,unlock=dict(type='chest',requirement=rarity))
 # Preserve the legendary gold promise as an actual obtainable skin.
 if id=='gold':
  skin['rarity']='legendary';skin['unlock']['requirement']='legendary';skin['material']='metal'
  skin['board']={'background':'#20170c','empty':'#342614','edge':'#856129','accent':'#f0cb71'}
  for level,t in enumerate(skin['tiles']):t.update(base=blend('#94631e','#f3cd6a',level/10),dark='#3a250e',center='#3a250e',light=blend('#ebbf59','#fff0bc',level/10),ink='#fff3ce',accent='#e8b74f',surface='metal')
 if id in ['ores','capsules']:
  skin['inspiration']='Minecraft' if id=='ores' else 'Pokémon'
  skin['variants']=['Charbon','Cuivre','Fer','Or','Redstone','Lapis-lazuli','Améthyste','Émeraude','Diamant','Débris antiques','Netherite'] if id=='ores' else ['Poké Ball','Super Ball','Hyper Ball','Honor Ball','Filet Ball','Scuba Ball','Sombre Ball','Luxe Ball','Soin Ball','Chrono Ball','Master Ball']
  skin['audio']={'wave':'square' if id=='ores' else 'triangle','root':.92 if id=='ores' else 1.42,'ratios':[1,2,3] if id=='ores' else [1,1.25,1.5],'tail':.13 if id=='ores' else .22,'rhythm':.026 if id=='ores' else .045,'volume':.7}
  skin['style']='pixel' if id=='ores' else 'rounded';skin['material']='pixel' if id=='ores' else 'enamel'
  skin['board']={'background':'#192025' if id=='ores' else '#132337','empty':'#30363b' if id=='ores' else '#263c53','edge':'#64715e' if id=='ores' else '#617b9c','accent':'#6ddad7' if id=='ores' else '#f0ca6e'}
  for level,t in enumerate(skin['tiles']):
   ore=['#3c3b41','#cf8b57','#e0c3a0','#f4ce54','#ee454b','#487de8','#bb82e7','#58d887','#8cf4ec','#b18b77','#a99aaf'][level]
   t.update(base=anchors[level],dark='#262931' if id=='ores' else '#142235',center='#262931' if id=='ores' else '#142235',light=ore if id=='ores' else '#f4dfaa',ink='#fff9e9',accent=ore if id=='ores' else anchors[level],surface=skin['material'])
 skins.append(skin)
for c in collections.values():c['samples']=[s['id'] for s in skins if s['collection']==c['id']][:3]
# Future event collections are deliberately separate from the twelve core worlds.
events=[dict(id='atelier-equinox',name='Équinoxe · atelier imaginaire',type='collaboration',partner='Studio Lisière (concept fictif)',credits='Concept original Fusion, sans affiliation externe.',status='concept',startsAt=None,endsAt=None,skins=[],unlock=dict(type='event',requirement='Un événement doit être annoncé et activé avant toute récompense.'),palette=['#26354a','#d5a982'],effects='cosmic',sound='cosmic')]
import copy
champion=copy.deepcopy(next(s for s in skins if s['id']=='solaris-eclipse'))
champion.update(id='king',name='SOVEREIGN',collection='champion',rarity='sovereign',hint='Le sommet ne se partage pas.',story='Velours pourpre, rubis de la couronne, saphirs de minuit et or ciselé. Onze insignes racontent le couronnement d’un souverain. Le trône change de main lorsque le classement change.',composition='sovereign',art='atelier-king',fx='royal',sound='royal',unlock={'type':'leaderboard','requirement':'N°1 du classement classique permanent'},animation={'profile':'sovereign','intensity':1.1,'angle':0,'duration':300})
champion['material']='satin'
champion['board']={'background':'#170d25','empty':'#2b173a','edge':'#947043','accent':'#f0cd84'}
royal=['#45205f','#5e225b','#74273e','#263663','#4b2471','#842841','#283e77','#602b84','#8a304b','#493083','#71386b']
for level,t in enumerate(champion['tiles']):t.update(base=royal[level],dark=blend(royal[level],'#0b091a',.65),center='#21112f',light=blend('#cfa45a','#fff0c0',level/10),ink='#fff0ce',accent=['#dca4ff','#ed798b','#88b5ff'][level%3],surface='satin')
champion['audio']={'wave':'triangle','root':1.5857,'ratios':[1,1.25,1.5],'tail':.26,'rhythm':.045,'volume':.8}
data=dict(version=1,collections=collections,skins=skins,champion=champion,events=events)
(ROOT/'public/atelier-catalog.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
(ROOT/'public/atelier-catalog.js').write_text('(function(root){const data='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';if(typeof module!=="undefined")module.exports=data;else root.FusionAtelier=data;})(typeof window!=="undefined"?window:globalThis);\n')
print('Authored catalogue:',len(collections),'worlds,',len(skins),'skins')
