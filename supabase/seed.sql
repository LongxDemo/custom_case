-- Casey — seed the catalog to match the app's bundled defaults.
-- Run after schema.sql.

insert into phone_models (id, brand, name, aspect, camera, sort) values
  ('ip17pm','iPhone','17 Pro Max',0.46,'{"x":0.05,"y":0.04,"w":0.36,"h":0.26}',0),
  ('ip17p','iPhone','17 Pro',0.46,'{"x":0.05,"y":0.04,"w":0.36,"h":0.26}',1),
  ('ip17air','iPhone','Air',0.48,'{"x":0.05,"y":0.04,"w":0.3,"h":0.2}',2),
  ('ip17','iPhone','17',0.47,'{"x":0.05,"y":0.04,"w":0.3,"h":0.2}',3),
  ('ip16pm','iPhone','16 Pro Max',0.46,'{"x":0.05,"y":0.04,"w":0.36,"h":0.26}',4),
  ('ip16p','iPhone','16 Pro',0.46,'{"x":0.05,"y":0.04,"w":0.36,"h":0.26}',5),
  ('ip16','iPhone','16 / 16 Plus',0.48,'{"x":0.05,"y":0.04,"w":0.3,"h":0.2}',6),
  ('ip15pm','iPhone','15 Pro Max',0.49,'{"x":0.05,"y":0.04,"w":0.36,"h":0.26}',7),
  ('ip15','iPhone','15 / 15 Pro',0.49,'{"x":0.05,"y":0.04,"w":0.3,"h":0.2}',8),
  ('ip14','iPhone','14 / 13',0.49,'{"x":0.05,"y":0.04,"w":0.3,"h":0.2}',9),
  ('ip12','iPhone','12 / 11',0.49,'{"x":0.05,"y":0.04,"w":0.3,"h":0.2}',10),
  ('ipse','iPhone','SE (2022)',0.49,'{"x":0.05,"y":0.04,"w":0.2,"h":0.12}',11),
  ('s24u','Samsung','Galaxy S24 Ultra',0.46,'{"x":0.06,"y":0.05,"w":0.16,"h":0.26}',12),
  ('s24p','Samsung','Galaxy S24+',0.46,'{"x":0.06,"y":0.05,"w":0.16,"h":0.26}',13),
  ('s24','Samsung','Galaxy S24',0.47,'{"x":0.06,"y":0.05,"w":0.16,"h":0.26}',14),
  ('s23u','Samsung','Galaxy S23 Ultra',0.45,'{"x":0.06,"y":0.05,"w":0.16,"h":0.26}',15),
  ('s23','Samsung','Galaxy S23',0.48,'{"x":0.06,"y":0.05,"w":0.16,"h":0.26}',16),
  ('a55','Samsung','Galaxy A55 / A54',0.47,'{"x":0.06,"y":0.05,"w":0.16,"h":0.26}',17),
  ('zflip5','Samsung','Galaxy Z Flip 5',0.84,'{"x":0.06,"y":0.05,"w":0.16,"h":0.26}',18),
  ('zfold5','Samsung','Galaxy Z Fold 5',0.44,'{"x":0.06,"y":0.05,"w":0.16,"h":0.26}',19),
  ('pixel9p','Google','Pixel 9 Pro',0.47,'{"x":0.08,"y":0.07,"w":0.84,"h":0.12}',20),
  ('pixel8pro','Google','Pixel 8 Pro',0.48,'{"x":0.08,"y":0.07,"w":0.84,"h":0.12}',21),
  ('pixel8','Google','Pixel 8 / 8a',0.47,'{"x":0.08,"y":0.07,"w":0.84,"h":0.12}',22),
  ('pixel7','Google','Pixel 7',0.48,'{"x":0.08,"y":0.07,"w":0.84,"h":0.12}',23),
  ('xiaomi14','Xiaomi','Xiaomi 14',0.46,'{"x":0.06,"y":0.05,"w":0.28,"h":0.24}',24),
  ('redmi13','Xiaomi','Redmi Note 13',0.46,'{"x":0.06,"y":0.05,"w":0.28,"h":0.24}',25),
  ('oneplus12','OnePlus','OnePlus 12',0.46,'{"x":0.06,"y":0.05,"w":0.28,"h":0.24}',26),
  ('oppo','OPPO','Reno 11',0.46,'{"x":0.06,"y":0.05,"w":0.28,"h":0.24}',27)
on conflict (id) do nothing;

insert into backgrounds (id, name, colors, sort) values
  ('bubblegum','Bubblegum','["#FF7EC0","#FF3E9A"]',0),
  ('cotton','Cotton Candy','["#FFD6EC","#C8B6FF"]',1),
  ('sunset','K-Sunset','["#FFC3A0","#FF5470"]',2),
  ('midnight','Midnight Stan','["#2B1B3D","#141018"]',3),
  ('mint','Fresh Mint','["#B8F2E6","#8ED1C6"]',4),
  ('cream','Cream','["#FFF5FA","#FFE9F4"]',5),
  ('lilac','Lilac Dream','["#E4C1F9","#B892FF"]',6),
  ('solidpink','Hot Pink','["#FF3E9A","#FF3E9A"]',7)
on conflict (id) do nothing;

insert into sticker_packs (id, name, cover, sort) values
  ('hearts','Love','💗',0),
  ('kpop','K-Pop','🎤',1),
  ('cute','Cutie','🐰',2),
  ('sparkle','Sparkle','✨',3)
on conflict (id) do nothing;

-- Casey Case Gallery — mirrors the 4 templates bundled in mobile/src/data/catalog.ts
-- so a freshly connected backend starts with the same gallery the app already
-- ships in local/mock mode. Admins can add more from the dashboard or by
-- publishing designs from the mobile editor.
insert into templates (id, name, tag, accent, background, layers, featured, sort) values
  ('t-stan', 'Stan 4 Life', 'Trending', '#FF3E9A',
   '{"id":"midnight","name":"Midnight Stan","colors":["#2B1B3D","#141018"]}',
   '[{"kind":"text","text":"STAN\n4 LIFE","color":"#FF3E9A","fontSize":46,"fontWeight":"900","align":"center","tx":0,"ty":-40,"scale":1,"rotation":0,"z":2},
     {"kind":"sticker","emoji":"🖤","size":60,"tx":-70,"ty":90,"scale":1,"rotation":-0.2,"z":1},
     {"kind":"sticker","emoji":"⭐","size":44,"tx":80,"ty":-140,"scale":1,"rotation":0.3,"z":1}]',
   true, 0),
  ('t-love', 'Love Print Stan', 'Casey pick', '#FF7EC0',
   '{"id":"bubblegum","name":"Bubblegum","colors":["#FF7EC0","#FF3E9A"]}',
   '[{"kind":"text","text":"love.\nprint.\nstan.","color":"#FFFFFF","fontSize":40,"fontWeight":"800","align":"left","tx":-30,"ty":0,"scale":1,"rotation":0,"z":2},
     {"kind":"sticker","emoji":"💗","size":52,"tx":80,"ty":-150,"scale":1,"rotation":0.1,"z":1},
     {"kind":"sticker","emoji":"🐰","size":64,"tx":70,"ty":150,"scale":1,"rotation":0,"z":1}]',
   true, 1),
  ('t-bunny', 'Bunny Blush', 'New', '#C8B6FF',
   '{"id":"cotton","name":"Cotton Candy","colors":["#FFD6EC","#C8B6FF"]}',
   '[{"kind":"sticker","emoji":"🐰","size":120,"tx":0,"ty":-30,"scale":1,"rotation":0,"z":2},
     {"kind":"text","text":"be a cutie","color":"#D6006E","fontSize":30,"fontWeight":"800","align":"center","tx":0,"ty":110,"scale":1,"rotation":0,"z":2},
     {"kind":"sticker","emoji":"🎀","size":40,"tx":-80,"ty":-150,"scale":1,"rotation":-0.3,"z":1}]',
   true, 2),
  ('t-idol', 'Idol Frame', 'Photo', '#FF5470',
   '{"id":"sunset","name":"K-Sunset","colors":["#FFC3A0","#FF5470"]}',
   '[{"kind":"text","text":"♡ my bias ♡","color":"#FFFFFF","fontSize":26,"fontWeight":"800","align":"center","tx":0,"ty":150,"scale":1,"rotation":0,"z":3},
     {"kind":"sticker","emoji":"📸","size":50,"tx":0,"ty":-160,"scale":1,"rotation":0,"z":2}]',
   true, 3)
on conflict (id) do nothing;

-- To grant dashboard access, sign up in the admin app, then run:
--   insert into admins (user_id, email) select id, email from auth.users where email = 'you@email.com';
