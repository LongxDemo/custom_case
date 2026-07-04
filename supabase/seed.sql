-- Casey — seed the catalog to match the app's bundled defaults.
-- Run after schema.sql.

insert into phone_models (id, brand, name, aspect, camera, sort) values
  ('ip15pm','iPhone','15 Pro Max',0.49,'{"x":0.06,"y":0.05,"w":0.34,"h":0.24}',0),
  ('ip15','iPhone','15 / 15 Pro',0.49,'{"x":0.06,"y":0.05,"w":0.32,"h":0.22}',1),
  ('ip14','iPhone','14 / 13',0.49,'{"x":0.06,"y":0.05,"w":0.3,"h":0.2}',2),
  ('s24u','Samsung','Galaxy S24 Ultra',0.46,'{"x":0.06,"y":0.05,"w":0.16,"h":0.28}',3),
  ('s24','Samsung','Galaxy S24',0.47,'{"x":0.06,"y":0.05,"w":0.16,"h":0.24}',4),
  ('pixel8','Google','Pixel 8 Pro',0.48,'{"x":0.08,"y":0.08,"w":0.84,"h":0.12}',5)
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

-- To grant dashboard access, sign up in the admin app, then run:
--   insert into admins (user_id, email) select id, email from auth.users where email = 'you@email.com';
