CREATE TABLE public.t_sbpb_chat
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    text text COLLATE pg_catalog."default",
    userid integer,
    "isDeleted" boolean DEFAULT false,
    "isReady" boolean DEFAULT false,
    date timestamp with time zone,
    CONSTRAINT t_chatsbpb_pkey PRIMARY KEY (id)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

CREATE TABLE public.t_sbpb_count
(
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    count integer NOT NULL,
    date timestamp with time zone,
    CONSTRAINT t_sbpb_count_pkey PRIMARY KEY (id)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

CREATE TABLE public.t_sbpb_logins
(
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    userid integer NOT NULL,
    date timestamp with time zone,
    CONSTRAINT t_sbpb_userslogin_pkey PRIMARY KEY (id)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;
CREATE TABLE public.t_sbpb_logouts
(
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    userid integer NOT NULL,
    date timestamp with time zone,
    CONSTRAINT t_sbpb_userslogout_pkey PRIMARY KEY (id)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;
CREATE TABLE public.t_sbpb_q
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    text text COLLATE pg_catalog."default",
    userid integer,
    "isDeleted" boolean DEFAULT false,
    "isReady" boolean DEFAULT false,
    date timestamp with time zone,
    CONSTRAINT t_qsbpb_pkey PRIMARY KEY (id)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

CREATE TABLE public.t_sbpb_users
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    f text COLLATE pg_catalog."default",
    i text COLLATE pg_catalog."default",
    o text COLLATE pg_catalog."default",
    tel name,
    email name,
    "isDeleted" boolean DEFAULT false,
    date timestamp with time zone,
    CONSTRAINT t_sbpb_users_pkey PRIMARY KEY (id)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

CREATE OR REPLACE VIEW public.v_sbpb_chat
 AS
 SELECT q.text,
    q.userid,
    q.date,
    u.o,
    u.i,
    u.f,
    q.id
   FROM t_sbpb_chat q
     JOIN t_sbpb_users u ON q.userid = u.id
  WHERE q."isDeleted" = false;

  CREATE OR REPLACE VIEW public.v_sbpb_q
 AS
 SELECT q.text,
    q.userid,
    q.date,
    u.o,
    u.i,
    u.f,
    q.id
   FROM t_sbpb_q q
     JOIN t_sbpb_users u ON q.userid = u.id
  WHERE q."isDeleted" = false;

  CREATE TABLE public.t_sbpb_settings
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    site json,
    content json,
    speakers json,
    CONSTRAINT t_sbpb_settings_pkey PRIMARY KEY (id)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;
