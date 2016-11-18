drop table if exists entries;
create table entries (
  id integer primary key autoincrement,
  session_id integer not null,
  end_click text not null,
  move_path text not null,
  tre integer,
  tac integer,
  mdc integer,
  odc integer,
  mv integer,
  me integer,
  mo integer
);
