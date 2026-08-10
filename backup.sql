--
-- PostgreSQL database dump
--

\restrict pqLZ65WMzItNek3IdbkETq9ANq0mqfgWve2jyUpLGSp0TMbizG8s5xAWFatNV7z

-- Dumped from database version 15.15
-- Dumped by pg_dump version 15.15

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- Name: EstadoConexion; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."EstadoConexion" AS ENUM (
    'CONECTADO',
    'REQUIERE_ACTUALIZACION',
    'ERROR_SISTEMA'
);


ALTER TYPE public."EstadoConexion" OWNER TO postgres;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Role" AS ENUM (
    'SUPER_ADMIN',
    'ADMIN',
    'USUARIO_LOCAL'
);


ALTER TYPE public."Role" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: AuditLog; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."AuditLog" (
    id text NOT NULL,
    "usuarioId" text,
    accion text NOT NULL,
    entidad text,
    "entidadId" text,
    detalles text,
    "ipAddress" text,
    "userAgent" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."AuditLog" OWNER TO postgres;

--
-- Name: Empresa; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Empresa" (
    id text NOT NULL,
    ruc text NOT NULL,
    "razonSocial" text NOT NULL,
    "usuarioSol" text NOT NULL,
    "claveSol" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "usuarioId" text NOT NULL,
    "estadoConexion" public."EstadoConexion" DEFAULT 'CONECTADO'::public."EstadoConexion" NOT NULL,
    "estadoSincro" text DEFAULT 'IDLE'::text NOT NULL,
    "ultimaSincronizacion" timestamp(3) without time zone,
    activo boolean DEFAULT true NOT NULL
);


ALTER TABLE public."Empresa" OWNER TO postgres;

--
-- Name: EmpresaAsignacion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."EmpresaAsignacion" (
    id text NOT NULL,
    "usuarioId" text NOT NULL,
    "empresaId" text NOT NULL,
    "creadoEn" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."EmpresaAsignacion" OWNER TO postgres;

--
-- Name: Notificacion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Notificacion" (
    id text NOT NULL,
    "empresaId" text NOT NULL,
    "fechaMensaje" timestamp(3) without time zone NOT NULL,
    asunto text NOT NULL,
    "rutaArchivoPdf" text,
    estado text DEFAULT 'NO_LEIDO'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "fileId" text,
    tipo text DEFAULT 'NOTIFICACION'::text NOT NULL,
    "expedienteCoactivo" text,
    "montoExigible" text
);


ALTER TABLE public."Notificacion" OWNER TO postgres;

--
-- Name: NotificacionLectura; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."NotificacionLectura" (
    id text NOT NULL,
    "notificacionId" text NOT NULL,
    "usuarioId" text NOT NULL,
    "creadoAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."NotificacionLectura" OWNER TO postgres;

--
-- Name: Usuario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Usuario" (
    id text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    rol public."Role" DEFAULT 'USUARIO_LOCAL'::public."Role" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "telegramChatId" text,
    nombres text NOT NULL,
    apellidos text NOT NULL,
    dni text NOT NULL
);


ALTER TABLE public."Usuario" OWNER TO postgres;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Data for Name: AuditLog; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."AuditLog" (id, "usuarioId", accion, entidad, "entidadId", detalles, "ipAddress", "userAgent", "createdAt") FROM stdin;
cd4a3e16-07cc-4c58-8ab4-6b7d0c28f49d	\N	LOGIN_FALLIDO	Usuario	\N	{"email":"admin@bes.com","motivo":"Contraseña incorrecta"}	\N	\N	2026-07-31 19:54:49.825
be34f94b-5395-438e-89e5-1fb21462f347	\N	LOGIN_FALLIDO	Usuario	\N	{"email":"admin@bes.com","motivo":"Contraseña incorrecta"}	\N	\N	2026-07-31 19:54:57.496
1d78a1c5-faf7-405b-83c7-643151ad5ad1	\N	LOGIN_FALLIDO	Usuario	\N	{"email":"admin@bes.com","motivo":"Contraseña incorrecta"}	\N	\N	2026-07-31 19:55:09.363
1fd281fe-4502-4ce6-834c-c8d76ce07309	\N	LOGIN_FALLIDO	Usuario	\N	{"email":"admin@bes.com","motivo":"Contraseña incorrecta"}	\N	\N	2026-07-31 19:55:19.435
9f0cb04c-d0b2-4b80-bd51-a94f319b259f	\N	LOGIN_FALLIDO	Usuario	\N	{"email":"admin@bes.com","motivo":"Contraseña incorrecta"}	\N	\N	2026-07-31 19:55:20.02
9c7004f7-25c1-4dd7-b8b0-9b2ddc69c5ed	\N	LOGIN_FALLIDO	Usuario	\N	{"email":"admin@bes.com","motivo":"Contraseña incorrecta"}	\N	\N	2026-07-31 19:55:23.86
84c3f3b2-5d39-4e05-bc12-fb763a81e337	\N	LOGIN_FALLIDO	Usuario	\N	{"email":"admin@bes.com","motivo":"Contraseña incorrecta"}	\N	\N	2026-07-31 19:55:45.606
6537d7f0-5654-49c5-8aba-f129b5bc7fee	\N	LOGIN_FALLIDO	Usuario	\N	{"email":"admin@bes.com","motivo":"Contraseña incorrecta"}	\N	\N	2026-07-31 19:55:50.636
1b5623cd-c125-41e0-afca-8a352e24019f	\N	LOGIN_FALLIDO	Usuario	\N	{"email":"admin@bes.com","motivo":"Contraseña incorrecta"}	\N	\N	2026-07-31 19:56:11.457
9c39c0b5-e2a4-4745-8c7e-00b57e89c6a8	\N	LOGIN_FALLIDO	Usuario	\N	{"email":"admin@bes.com","motivo":"Contraseña incorrecta"}	\N	\N	2026-07-31 19:56:37.813
fb4d47a6-c8b0-40de-b8fc-ee4f14ac7752	\N	LOGIN_FALLIDO	Usuario	\N	{"email":"admin@bes.com","motivo":"Contraseña incorrecta"}	\N	\N	2026-07-31 19:56:41.784
57235ef0-79b7-4d9b-91f9-fb2861a6cefa	e76f2d2b-d59a-44d6-9047-824224918b3b	INICIO_SESION	Usuario	e76f2d2b-d59a-44d6-9047-824224918b3b	{"email":"admin@bes.com"}	\N	\N	2026-07-31 19:58:06.213
189549fb-984e-4ace-b9b8-2b2876172c08	e76f2d2b-d59a-44d6-9047-824224918b3b	INICIO_SESION	Usuario	e76f2d2b-d59a-44d6-9047-824224918b3b	{"email":"admin@bes.com"}	\N	\N	2026-07-31 19:59:25.543
6d231318-1601-4f7f-9933-54b8408b16bd	e76f2d2b-d59a-44d6-9047-824224918b3b	INICIO_SESION	Usuario	e76f2d2b-d59a-44d6-9047-824224918b3b	{"email":"admin@bes.com"}	\N	\N	2026-08-04 22:01:50.891
e7fcd2b3-24c7-4b8c-a727-55ded15125d7	e76f2d2b-d59a-44d6-9047-824224918b3b	INICIO_SESION	Usuario	e76f2d2b-d59a-44d6-9047-824224918b3b	{"email":"admin@bes.com"}	\N	\N	2026-08-04 22:28:00.914
08fc76ed-0a22-40a8-9030-ac908fed753f	e76f2d2b-d59a-44d6-9047-824224918b3b	INICIO_SESION	Usuario	e76f2d2b-d59a-44d6-9047-824224918b3b	{"email":"admin@bes.com"}	\N	\N	2026-08-04 22:31:29.372
d4c52a62-eef3-4fe1-8f13-88f70c148e92	e76f2d2b-d59a-44d6-9047-824224918b3b	INICIO_SESION	Usuario	e76f2d2b-d59a-44d6-9047-824224918b3b	{"email":"admin@bes.com"}	\N	\N	2026-08-05 23:40:46.369
e239ec2c-c802-45b5-90eb-eb4a82c26f27	\N	INICIO_SESION	Usuario	9a222204-913c-407b-b3ff-c5969a8ba988	{"email":"dhac@bes.com"}	\N	\N	2026-08-04 22:28:30.822
1b9ffb84-15e5-4690-905b-5faefcbcf893	\N	INICIO_SESION	Usuario	9a222204-913c-407b-b3ff-c5969a8ba988	{"email":"dhac@bes.com"}	\N	\N	2026-08-04 22:31:49.88
0899c39f-e96c-4b42-af76-61479f2743a8	e76f2d2b-d59a-44d6-9047-824224918b3b	INICIO_SESION	Usuario	e76f2d2b-d59a-44d6-9047-824224918b3b	{"email":"admin@bes.com"}	\N	\N	2026-08-06 01:09:59.64
d7a50e32-713a-4d1f-a545-cb056ad64253	e76f2d2b-d59a-44d6-9047-824224918b3b	INICIO_SESION	Usuario	e76f2d2b-d59a-44d6-9047-824224918b3b	{"email":"admin@bes.com"}	\N	\N	2026-08-07 22:17:07.607
83542657-eac1-441e-8c88-fe61ccb5fb0c	e76f2d2b-d59a-44d6-9047-824224918b3b	INICIO_SESION	Usuario	e76f2d2b-d59a-44d6-9047-824224918b3b	{"email":"admin@bes.com"}	\N	\N	2026-08-07 22:48:57.847
f02d950f-47e4-4a47-8940-2cecccb26d1e	e76f2d2b-d59a-44d6-9047-824224918b3b	INICIO_SESION	Usuario	e76f2d2b-d59a-44d6-9047-824224918b3b	{"email":"admin@bes.com"}	\N	\N	2026-08-07 22:52:12.712
22ad0d6f-1592-4de8-a645-bf1c301931d7	e76f2d2b-d59a-44d6-9047-824224918b3b	INICIO_SESION	Usuario	e76f2d2b-d59a-44d6-9047-824224918b3b	{"email":"admin@bes.com"}	\N	\N	2026-08-08 16:44:28.125
1b12da0d-a5a5-46c6-8a6d-b6fde63f0651	e76f2d2b-d59a-44d6-9047-824224918b3b	INICIO_SESION	Usuario	e76f2d2b-d59a-44d6-9047-824224918b3b	{"email":"admin@bes.com"}	\N	\N	2026-08-08 18:00:42.292
60f0fae8-8e2d-4bc5-a971-fa23a5c15978	e76f2d2b-d59a-44d6-9047-824224918b3b	INICIO_SESION	Usuario	e76f2d2b-d59a-44d6-9047-824224918b3b	{"email":"admin@bes.com"}	\N	\N	2026-08-08 18:41:28.766
cc7d1ee3-2240-4f70-b6f2-5ee1b21d2d34	\N	LOGIN_FALLIDO	Usuario	\N	{"email":"admin@oracon.com","motivo":"Contraseña incorrecta"}	\N	\N	2026-08-08 19:17:58.601
18f948e4-4b2a-4e84-b219-bca1a4592deb	\N	LOGIN_FALLIDO	Usuario	\N	{"email":"admin@oracon.com","motivo":"Contraseña incorrecta"}	\N	\N	2026-08-08 19:21:43.223
2ac1b060-e839-4802-8862-bfe17d7b68f7	\N	LOGIN_FALLIDO	Usuario	\N	{"email":"admin@oracon.com","motivo":"Contraseña incorrecta"}	\N	\N	2026-08-08 19:23:21.56
d908e072-efef-48bb-aaec-bb01749109c6	\N	LOGIN_FALLIDO	Usuario	\N	{"email":"admin@oracon.com","motivo":"Contraseña incorrecta"}	\N	\N	2026-08-08 19:23:28.71
b0f9dd48-2baf-486d-8fa0-bd2585b04c7d	e76f2d2b-d59a-44d6-9047-824224918b3b	INICIO_SESION	Usuario	e76f2d2b-d59a-44d6-9047-824224918b3b	{"email":"admin@oracon.com"}	\N	\N	2026-08-08 19:23:44.505
f30d067e-abd4-4bcf-a958-f60bf9bef482	e76f2d2b-d59a-44d6-9047-824224918b3b	INICIO_SESION	Usuario	e76f2d2b-d59a-44d6-9047-824224918b3b	{"email":"admin@oracon.com"}	\N	\N	2026-08-08 19:33:10.589
1da06b54-6725-4ca5-a0d2-05c5ccf014c3	e76f2d2b-d59a-44d6-9047-824224918b3b	INICIO_SESION	Usuario	e76f2d2b-d59a-44d6-9047-824224918b3b	{"email":"admin@oracon.com"}	\N	\N	2026-08-08 19:33:57.952
98f5fc60-943b-4cbe-b35a-b78ecc2ee500	e76f2d2b-d59a-44d6-9047-824224918b3b	INICIO_SESION	Usuario	e76f2d2b-d59a-44d6-9047-824224918b3b	{"email":"admin@oracon.com"}	\N	\N	2026-08-08 21:01:24.377
519769f7-6a3f-467b-818c-e85f6d5a1179	\N	LOGIN_FALLIDO	Usuario	\N	{"email":"admin@oracon.com","motivo":"Contraseña incorrecta"}	\N	\N	2026-08-08 21:13:48.95
4250793c-bae6-4e52-ba13-3fb13f421572	\N	LOGIN_FALLIDO	Usuario	\N	{"email":"admin@oracon.com","motivo":"Contraseña incorrecta"}	\N	\N	2026-08-08 21:13:51.265
81778036-7325-4d16-84b3-9df206563b9e	\N	LOGIN_FALLIDO	Usuario	\N	{"email":"admin@oracon.com","motivo":"Contraseña incorrecta"}	\N	\N	2026-08-08 21:14:43.376
bc51f97a-569e-4ddf-b8d7-979cebc2f51b	e76f2d2b-d59a-44d6-9047-824224918b3b	INICIO_SESION	Usuario	e76f2d2b-d59a-44d6-9047-824224918b3b	{"email":"admin@oracon.com"}	\N	\N	2026-08-08 21:14:46.823
0baa7269-73ef-4828-9194-962f45c7b5a3	\N	INICIO_SESION	Usuario	551f710b-4485-4da6-b77b-daf990ed58a4	{"email":"da74838577@bes.com"}	\N	\N	2026-08-05 23:42:19.38
39cfa083-085c-46d2-92d5-20306c274f7e	\N	INICIO_SESION	Usuario	551f710b-4485-4da6-b77b-daf990ed58a4	{"email":"da74838577@bes.com"}	\N	\N	2026-08-07 23:03:01.835
71b7533d-92ab-44c2-b385-cc9d23d80c26	\N	INICIO_SESION	Usuario	6ff3b141-e662-4578-9a9c-6412c4707cb3	{"email":"da74838577@bes.com"}	\N	\N	2026-08-08 22:10:26.666
6c1ae924-1a31-455c-94b1-e7943cac1bc1	2cc16576-af38-4be8-b765-8f46040c5b1b	INICIO_SESION	Usuario	2cc16576-af38-4be8-b765-8f46040c5b1b	{"email":"da74838577@bes.com"}	\N	\N	2026-08-09 17:46:35.637
4266c92b-a76d-4031-9b39-a984ab671568	da86d7ec-76ff-421c-ace1-df7e856eea70	INICIO_SESION	Usuario	da86d7ec-76ff-421c-ace1-df7e856eea70	{"email":"sz12345678@bes.com"}	\N	\N	2026-08-09 18:42:58.773
aa40c3d5-0dcd-40cc-9012-3658ce3e3c26	f021382c-cf29-4908-ba2f-8fdf702379e5	INICIO_SESION	Usuario	f021382c-cf29-4908-ba2f-8fdf702379e5	{"email":"az23456789@bes.com"}	\N	\N	2026-08-09 18:54:12.415
\.


--
-- Data for Name: Empresa; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Empresa" (id, ruc, "razonSocial", "usuarioSol", "claveSol", "createdAt", "updatedAt", "usuarioId", "estadoConexion", "estadoSincro", "ultimaSincronizacion", activo) FROM stdin;
606ea953-8bb2-40c1-895b-bf4f9ed13272	15614447220	MEJIAS PEREZ ABRAHAN ENRIQUE	EUREQUAY	bbd18422d6ee223e4b69e302f7bfb584:504a0ff289eb3ce13d528d40813719cb	2026-07-31 20:00:16.661	2026-08-09 22:05:00.792	e76f2d2b-d59a-44d6-9047-824224918b3b	CONECTADO	SUCCESS	2026-08-09 22:04:55.559	t
20e08425-bbb4-411a-8b75-223fc7487554	20607426211	ENTRECOSTILLAS E.I.R.L.	45441646	e159930d3293c4cbf2ab9bab3aaca2d1:12588789be21392ac3cbf6326c5c56bc	2026-07-31 20:00:16.668	2026-08-09 22:05:48.406	e76f2d2b-d59a-44d6-9047-824224918b3b	CONECTADO	SUCCESS	2026-08-09 22:05:43.166	t
e47f01be-9617-437e-b5f1-1c56ef8be3c8	20614544491	SERVICIOS GENERALES INGMER S.A.C.	18866982	6cc2a86b5bd9eb12641367af967e5016:ab85924112ee1e91875899005f753391	2026-07-31 20:00:16.681	2026-08-09 22:09:44.754	e76f2d2b-d59a-44d6-9047-824224918b3b	CONECTADO	SUCCESS	2026-08-09 22:09:39.38	t
fc5eb855-5d50-4ee1-b5cc-9abc638e40f5	20600615140	PASANNI S.R.L.	PASSANNI	f97d671bffaf47ee1007dd215fe5ac81:a3382cf688fc819bca225179df60ed88	2026-07-31 20:00:16.654	2026-08-09 22:06:28.008	e76f2d2b-d59a-44d6-9047-824224918b3b	CONECTADO	SUCCESS	2026-08-09 22:06:22.756	t
d7c75373-0bf0-4f34-85ec-c5ffa1081f84	20600938551	SERVICIOS MULTIPLES J A HERMANOS S.R.L.	JAHERMAN	54a1c8bed10a97e23209f2127991e6fc:dcf7bd7a54e42811d9652fbe271c5411	2026-07-31 20:00:16.674	2026-08-09 22:02:53.366	e76f2d2b-d59a-44d6-9047-824224918b3b	CONECTADO	SUCCESS	2026-08-09 22:02:48.062	t
c7ea4920-6ebf-41a1-b2f5-fcd53c3b3ee6	20551902910	JADAMI S.A.C.	ISTOCLIA	951bbed6fe1c17374ed50f9d1c7d593b:830e2c11b62839ebb9d33c9026f9ae9a	2026-07-31 20:00:16.62	2026-08-09 22:11:00.554	e76f2d2b-d59a-44d6-9047-824224918b3b	CONECTADO	SUCCESS	2026-08-09 22:10:55.314	t
55ad6ec1-7b7d-472d-b316-4e5642dc5783	20612668320	KRICASA E.I.R.L.	43575764	00a16b4aa8bce162dbc6a2eeec1a07bc:31ff0e6e04766985521b3d352c790ebd	2026-07-31 20:00:16.647	2026-08-09 22:07:12.947	e76f2d2b-d59a-44d6-9047-824224918b3b	CONECTADO	SUCCESS	2026-08-09 22:07:07.7	t
13460e01-0de5-4caa-866a-8c9c73b38957	20610331581	FAST DENTAL ESTHETIC E.I.R.L.	70136474	de1c211eec1b0240b4b81bcac12a2c06:cfcf0b372e90fff38392f1f5cc269cb2	2026-07-31 20:00:16.688	2026-08-09 22:03:37.712	e76f2d2b-d59a-44d6-9047-824224918b3b	CONECTADO	SUCCESS	2026-08-09 22:03:32.401	t
eb3058e6-b82b-4c62-ae16-1384c6e43460	20606249081	TEG&T TECNICOS ESPECIALISTAS EN GEOSINTETICOS S.A.C.	AIRGINOT	ccc3ab56d829ce835c1201af4374bb93:2b7f5c9e74827aee4cd96a5115362c4b	2026-07-31 20:00:16.694	2026-08-09 22:07:52.683	e76f2d2b-d59a-44d6-9047-824224918b3b	CONECTADO	SUCCESS	2026-08-09 22:07:47.46	t
5c1045b7-d3a1-4ef9-81ce-6c96ec69547d	20609648300	PARADA 90'S S.R.L.	45032279	56e40dd04c6dd9e0d442387aba3e0818:1d9dd2ca486ebc2c68bde0c00b164d0c	2026-07-31 20:00:16.633	2026-08-09 22:04:23.362	e76f2d2b-d59a-44d6-9047-824224918b3b	CONECTADO	SUCCESS	2026-08-09 22:04:18.059	t
854f0b2e-73eb-491b-b1e7-b351c210248f	20614898870	ARYP SERVICIOS GENERALES E.I.R.L.	61025533	6cd9da4d32084ca35825afd9e4239d2c:cd8672b4c3a01122d05c2c34bb3cb4e3	2026-07-31 20:00:16.64	2026-08-09 22:08:29.808	e76f2d2b-d59a-44d6-9047-824224918b3b	CONECTADO	SUCCESS	2026-08-09 22:08:24.606	t
\.


--
-- Data for Name: EmpresaAsignacion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."EmpresaAsignacion" (id, "usuarioId", "empresaId", "creadoEn") FROM stdin;
489f8ba5-99c0-4194-bb43-5adb80b57d4a	2cc16576-af38-4be8-b765-8f46040c5b1b	854f0b2e-73eb-491b-b1e7-b351c210248f	2026-08-09 17:46:40.743
46affdd9-97f2-4d05-865d-668d7c7b5d1e	2cc16576-af38-4be8-b765-8f46040c5b1b	20e08425-bbb4-411a-8b75-223fc7487554	2026-08-09 17:46:41.422
c3b57a00-1fa5-4d2d-9798-5ef94255f824	2cc16576-af38-4be8-b765-8f46040c5b1b	13460e01-0de5-4caa-866a-8c9c73b38957	2026-08-09 17:46:42.65
3328af67-2a72-41e3-8309-fb241e50a3d2	2cc16576-af38-4be8-b765-8f46040c5b1b	55ad6ec1-7b7d-472d-b316-4e5642dc5783	2026-08-09 17:46:43.878
74832b87-9289-4431-a73b-11b435703182	da86d7ec-76ff-421c-ace1-df7e856eea70	fc5eb855-5d50-4ee1-b5cc-9abc638e40f5	2026-08-09 18:43:21.77
b3dedd9e-ac38-4450-9b4c-e35a7f844865	da86d7ec-76ff-421c-ace1-df7e856eea70	e47f01be-9617-437e-b5f1-1c56ef8be3c8	2026-08-09 18:43:24.54
4a3f4aa8-26ff-4bfc-98a8-6ca950293bba	f021382c-cf29-4908-ba2f-8fdf702379e5	d7c75373-0bf0-4f34-85ec-c5ffa1081f84	2026-08-09 18:52:31.279
a9a58403-44f9-4f2f-838c-d6649089b55f	f021382c-cf29-4908-ba2f-8fdf702379e5	c7ea4920-6ebf-41a1-b2f5-fcd53c3b3ee6	2026-08-09 18:52:34.877
a081f84a-4988-4574-a83c-6aa520dc8648	f021382c-cf29-4908-ba2f-8fdf702379e5	e47f01be-9617-437e-b5f1-1c56ef8be3c8	2026-08-09 18:56:00.873
70dc6e13-5526-42de-a305-9f43c10394a2	f021382c-cf29-4908-ba2f-8fdf702379e5	13460e01-0de5-4caa-866a-8c9c73b38957	2026-08-09 18:56:04.827
\.


--
-- Data for Name: Notificacion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Notificacion" (id, "empresaId", "fechaMensaje", asunto, "rutaArchivoPdf", estado, "createdAt", "fileId", tipo, "expedienteCoactivo", "montoExigible") FROM stdin;
5db3e680-242c-402f-b6b7-9f199a5f4a29	20e08425-bbb4-411a-8b75-223fc7487554	2026-07-30 16:29:51	ASUNTO: Notificación de Resolución de Ejecución Coactiva N° 163-006-0454024 en Buzón Electrónico SOL	http://panel.oracon.com/uploads/1114635238.pdf	NO_LEIDO	2026-08-09 18:07:34.553	1114635238	NOTIFICACION	\N	\N
fbaefea0-0bbd-4a1a-9ebe-ca8ce56e2f9f	20e08425-bbb4-411a-8b75-223fc7487554	2026-07-22 14:45:10	ASUNTO: Notificación de Orden de Pago N° 163-001-0753335 en Buzón Electrónico SOL	http://panel.oracon.com/uploads/1112383621.pdf	NO_LEIDO	2026-08-09 18:07:34.553	1112383621	NOTIFICACION	\N	\N
3f370399-6bfe-4ad9-81e9-805a08c40ee3	20e08425-bbb4-411a-8b75-223fc7487554	2026-07-22 14:45:10	ASUNTO: Notificación de Orden de Pago N° 163-001-0753334 en Buzón Electrónico SOL	http://panel.oracon.com/uploads/1112382744.pdf	NO_LEIDO	2026-08-09 18:07:34.553	1112382744	NOTIFICACION	\N	\N
ee53878c-f26a-41f9-b05a-a3c1fe89a1f2	20e08425-bbb4-411a-8b75-223fc7487554	2026-07-20 23:45:30	ASUNTO: Notificación de Resolución de Conclusión N° 1630070862208	http://panel.oracon.com/uploads/1630070862208_resolucion.pdf	NO_LEIDO	2026-08-09 18:07:34.553	1630070862208	NOTIFICACION	\N	\N
0089d6d7-1575-4db2-8066-3495bcf155a7	20e08425-bbb4-411a-8b75-223fc7487554	2026-06-23 16:39:03	ASUNTO: Notificación de Resolución de Ejecución Coactiva N° 163-006-0448614 en Buzón Electrónico SOL	http://panel.oracon.com/uploads/1102063237.pdf	NO_LEIDO	2026-08-09 18:07:34.553	1102063237	NOTIFICACION	\N	\N
4f3188dc-f0a4-40f7-a590-9aa833cec810	20e08425-bbb4-411a-8b75-223fc7487554	2026-06-19 15:49:07	ASUNTO: Notificación de Orden de Pago N° 163-001-0746690 en Buzón Electrónico SOL	http://panel.oracon.com/uploads/1100853742.pdf	NO_LEIDO	2026-08-09 18:07:34.553	1100853742	NOTIFICACION	\N	\N
58a3cf5d-05c4-4c5e-b5de-30f39b65c5a1	20e08425-bbb4-411a-8b75-223fc7487554	2026-06-08 23:14:37	ASUNTO: Notificación de Resolución de Conclusión N° 1630070849092	http://panel.oracon.com/uploads/1630070849092_resolucion.pdf	NO_LEIDO	2026-08-09 18:07:34.553	1630070849092	NOTIFICACION	\N	\N
4f64b4ab-fbe5-4485-a688-71974e598158	20e08425-bbb4-411a-8b75-223fc7487554	2026-05-26 15:30:33	ASUNTO: Notificación de Resolución de Ejecución Coactiva N° 163-006-0442014 en Buzón Electrónico SOL	http://panel.oracon.com/uploads/1091615087.pdf	NO_LEIDO	2026-08-09 18:07:34.553	1091615087	NOTIFICACION	\N	\N
2a06eb48-bcba-4c49-8eb2-89bd81066ec5	20e08425-bbb4-411a-8b75-223fc7487554	2026-05-22 17:00:16	ASUNTO: Notificación de Orden de Pago N° 163-001-0738455 en Buzón Electrónico SOL	http://panel.oracon.com/uploads/1090513595.pdf	NO_LEIDO	2026-08-09 18:07:34.553	1090513595	NOTIFICACION	\N	\N
57cb5e61-eefd-4cae-beb2-d596a705c525	20e08425-bbb4-411a-8b75-223fc7487554	2026-04-22 18:21:11	ASUNTO: Notificación de Orden de Pago N° 163-001-0732425 en Buzón Electrónico SOL	http://panel.oracon.com/uploads/1080168288.pdf	NO_LEIDO	2026-08-09 18:07:34.553	1080168288	NOTIFICACION	\N	\N
4df43ecc-c86c-4662-9c2e-56d4f8ba48ae	20e08425-bbb4-411a-8b75-223fc7487554	2026-04-22 18:21:11	ASUNTO: Notificación de Orden de Pago N° 163-001-0732426 en Buzón Electrónico SOL	http://panel.oracon.com/uploads/1080167471.pdf	NO_LEIDO	2026-08-09 18:07:34.553	1080167471	NOTIFICACION	\N	\N
e14b4aae-4b03-40ba-97f3-89f299eaac94	20e08425-bbb4-411a-8b75-223fc7487554	2026-02-20 16:49:05	ASUNTO: Notificación de Orden de Pago N° 163-001-0720993 en Buzón Electrónico SOL	http://panel.oracon.com/uploads/1060329808.pdf	NO_LEIDO	2026-08-09 18:07:34.553	1060329808	NOTIFICACION	\N	\N
0c4d51d1-94da-4e83-95e1-c125002eaf54	eb3058e6-b82b-4c62-ae16-1384c6e43460	2026-08-05 18:20:17	ASUNTO: Notificación de Requerimiento de Procedimiento de fiscalización	http://panel.oracon.com/uploads/1117161901.pdf	NO_LEIDO	2026-08-09 18:17:28.037	1117161901	NOTIFICACION	\N	\N
9e724585-7113-457d-a691-78c5ac6f863b	eb3058e6-b82b-4c62-ae16-1384c6e43460	2026-08-05 18:18:17	ASUNTO: Notificación de Resultado Requerimiento	http://panel.oracon.com/uploads/1117161297.pdf	NO_LEIDO	2026-08-09 18:17:28.037	1117161297	NOTIFICACION	\N	\N
608fe600-0a31-4ee5-8d97-9cb4c8375a79	eb3058e6-b82b-4c62-ae16-1384c6e43460	2026-07-24 18:45:17	ASUNTO: Notificación de Carta	http://panel.oracon.com/uploads/1113333509.pdf	NO_LEIDO	2026-08-09 18:17:28.037	1113333509	NOTIFICACION	\N	\N
a9a008c7-8bc8-4dfd-808f-b66668774c44	eb3058e6-b82b-4c62-ae16-1384c6e43460	2026-07-09 17:37:43	ASUNTO: Notificación de Carta de Prórroga no vinculada a solicitudes electrónicas	http://panel.oracon.com/uploads/1108401078.pdf	NO_LEIDO	2026-08-09 18:17:28.037	1108401078	NOTIFICACION	\N	\N
69188782-b3f8-4c59-a9b9-0245ba66f85b	eb3058e6-b82b-4c62-ae16-1384c6e43460	2026-07-06 09:58:07	ASUNTO: Notificación Requerimiento del Procedimiento de Fiscalizacion N° 0222260007076	http://panel.oracon.com/uploads/1106879986.pdf	NO_LEIDO	2026-08-09 18:17:28.037	1106879986	NOTIFICACION	\N	\N
e9bdf568-7883-4887-8be6-a8072f0c5758	eb3058e6-b82b-4c62-ae16-1384c6e43460	2026-07-06 09:39:08	ASUNTO: Notificación de Resultado Requerimiento	http://panel.oracon.com/uploads/1106870632.pdf	NO_LEIDO	2026-08-09 18:17:28.037	1106870632	NOTIFICACION	\N	\N
5508c479-2c0f-46d6-b20c-fe8af7bc3e55	eb3058e6-b82b-4c62-ae16-1384c6e43460	2026-06-25 17:31:17	ASUNTO: Notificación de Requerimiento de Procedimiento de fiscalización	http://panel.oracon.com/uploads/1103183109.pdf	NO_LEIDO	2026-08-09 18:17:28.037	1103183109	NOTIFICACION	\N	\N
e885371b-b4fa-40a6-939f-da93d3601b53	eb3058e6-b82b-4c62-ae16-1384c6e43460	2026-06-25 15:37:48	ASUNTO: Notificación de Resultado Requerimiento	http://panel.oracon.com/uploads/1103048546.pdf	NO_LEIDO	2026-08-09 18:17:28.037	1103048546	NOTIFICACION	\N	\N
1c7ce573-1824-4e85-9755-5a16e2c28c1e	eb3058e6-b82b-4c62-ae16-1384c6e43460	2026-06-25 11:36:56	ASUNTO: Notificación de Resolución Coactiva de Conclusión con Numeral de Sustento N° 0300070973826 e	http://panel.oracon.com/uploads/1102988696.pdf	NO_LEIDO	2026-08-09 18:17:28.037	1102988696	NOTIFICACION	\N	\N
c6f3351e-c403-47d0-b43c-5da6b7a810f3	eb3058e6-b82b-4c62-ae16-1384c6e43460	2026-06-15 16:43:49	ASUNTO: Notificación Resolución de Apelación Administrativa N° 0490250012757	http://panel.oracon.com/uploads/1099084643.pdf	NO_LEIDO	2026-08-09 18:17:28.037	1099084643	NOTIFICACION	\N	\N
281ac481-9d77-411d-9fe5-0130ae3b52bf	eb3058e6-b82b-4c62-ae16-1384c6e43460	2026-06-12 16:19:47	ASUNTO: Notificación de Resolución de Ejecución Coactiva N° 029-006-4488845 en Buzón Electrónico SOL	http://panel.oracon.com/uploads/1098556550.pdf	NO_LEIDO	2026-08-09 18:17:28.037	1098556550	NOTIFICACION	\N	\N
cf745184-564f-4ba5-8eda-74890b9852ea	eb3058e6-b82b-4c62-ae16-1384c6e43460	2026-06-10 21:09:56	ASUNTO: Notificación de Orden de Pago N° 030-001-4543583 en Buzón Electrónico SOL	http://panel.oracon.com/uploads/1097900253.pdf	NO_LEIDO	2026-08-09 18:17:28.037	1097900253	NOTIFICACION	\N	\N
bf1db037-decc-460b-9f9b-b0356c955e52	eb3058e6-b82b-4c62-ae16-1384c6e43460	2026-06-03 19:44:46	ASUNTO: Notificación de Carta de Presentación	http://panel.oracon.com/uploads/1095588809.pdf	NO_LEIDO	2026-08-09 18:17:28.037	1095588809	NOTIFICACION	\N	\N
50ceb1cd-c351-4604-b02d-bbde0464997f	eb3058e6-b82b-4c62-ae16-1384c6e43460	2026-06-03 19:44:23	ASUNTO: Notificación de Requerimiento de Procedimiento de fiscalización	http://panel.oracon.com/uploads/1095588811.pdf	NO_LEIDO	2026-08-09 18:17:28.037	1095588811	NOTIFICACION	\N	\N
b83bf3e4-4a5e-4515-bf18-da91443e61b7	eb3058e6-b82b-4c62-ae16-1384c6e43460	2026-05-19 16:13:30	ASUNTO: Notificación Requerimiento N° 000145720267E1600	http://panel.oracon.com/uploads/1089208747.pdf	NO_LEIDO	2026-08-09 18:17:28.037	1089208747	NOTIFICACION	\N	\N
0cc92f1d-6090-4743-953c-74d31c1ba2cc	eb3058e6-b82b-4c62-ae16-1384c6e43460	2026-05-18 14:22:13	ASUNTO: Notificación Cierre Esquela R N° 226022274682-1	http://panel.oracon.com/uploads/1088739198.pdf	NO_LEIDO	2026-08-09 18:17:28.037	1088739198	NOTIFICACION	\N	\N
e10f5664-7253-4d6b-9ebc-6d6f3a713311	eb3058e6-b82b-4c62-ae16-1384c6e43460	2026-04-24 12:16:48	ASUNTO: Notificación de RCA - Liberación de Fondos Procedente N.° 0230242352904	http://panel.oracon.com/uploads/1080852525.pdf	NO_LEIDO	2026-08-09 18:17:28.037	1080852525	NOTIFICACION	\N	\N
90baafbc-9afd-4d83-8e18-232cdf87a7d2	eb3058e6-b82b-4c62-ae16-1384c6e43460	2026-04-20 17:03:02	ASUNTO: Notificación Esquela R N° 226022274682-1	http://panel.oracon.com/uploads/1078934725.pdf	NO_LEIDO	2026-08-09 18:17:28.037	1078934725	NOTIFICACION	\N	\N
a21560ec-a6d2-4a4e-a4fb-bb1b30d4ed63	eb3058e6-b82b-4c62-ae16-1384c6e43460	2026-04-16 16:22:01	ASUNTO: Notificación Cierre de Esquela de Citación N° 226022274682	http://panel.oracon.com/uploads/1078098788.pdf	NO_LEIDO	2026-08-09 18:17:28.037	1078098788	NOTIFICACION	\N	\N
5f137c52-7aaf-4d80-96d1-46def8e8c2df	eb3058e6-b82b-4c62-ae16-1384c6e43460	2026-03-26 15:51:26	ASUNTO: Notificación RCA Ingreso Recaudacion Detracciones N° 0230242330108	http://panel.oracon.com/uploads/1071319668.pdf	NO_LEIDO	2026-08-09 18:17:28.037	1071319668	NOTIFICACION	\N	\N
f369a2d5-1a42-4d34-9f55-590a93bfea65	eb3058e6-b82b-4c62-ae16-1384c6e43460	2026-03-23 19:54:54	ASUNTO: Notificación Esquela de Citación N° 226022274682	http://panel.oracon.com/uploads/1069880481.pdf	NO_LEIDO	2026-08-09 18:17:28.037	1069880481	NOTIFICACION	\N	\N
62043cb7-143d-4638-a9d6-36ad8f875061	eb3058e6-b82b-4c62-ae16-1384c6e43460	2026-03-11 18:51:26	ASUNTO: Notificación Esquela N° 002990120267E1600	http://panel.oracon.com/uploads/1066576939.pdf	NO_LEIDO	2026-08-09 18:17:28.037	1066576939	NOTIFICACION	\N	\N
42109695-bb34-413b-a618-771c3389daec	eb3058e6-b82b-4c62-ae16-1384c6e43460	2026-03-10 14:31:19	ASUNTO: Notificación de Resolución de Multa N° 023-002-2854231 en Buzón Electrónico SOL	http://panel.oracon.com/uploads/1066084984.pdf	NO_LEIDO	2026-08-09 18:17:28.037	1066084984	NOTIFICACION	\N	\N
f0bb06b9-8156-4428-9555-5b1ee563858a	fc5eb855-5d50-4ee1-b5cc-9abc638e40f5	2026-05-22 13:58:46	ASUNTO: Notificación de Orden de Pago N° 163-001-0737723 en Buzón Electrónico SOL	http://panel.oracon.com/uploads/1090297360.pdf	NO_LEIDO	2026-08-09 18:44:42.025	1090297360	NOTIFICACION	\N	\N
f60d895d-5504-4621-a9bf-d315e9985870	fc5eb855-5d50-4ee1-b5cc-9abc638e40f5	2026-04-22 18:08:37	ASUNTO: Notificación de Orden de Pago N° 163-001-0731713 en Buzón Electrónico SOL	http://panel.oracon.com/uploads/1080067321.pdf	NO_LEIDO	2026-08-09 18:44:42.025	1080067321	NOTIFICACION	\N	\N
36e4d8d3-79b3-48f5-89ce-641c04daab8a	fc5eb855-5d50-4ee1-b5cc-9abc638e40f5	2026-03-19 18:14:31	ASUNTO: Notificación de Orden de Pago N° 163-001-0725776 en Buzón Electrónico SOL	http://panel.oracon.com/uploads/1068750242.pdf	NO_LEIDO	2026-08-09 18:44:42.025	1068750242	NOTIFICACION	\N	\N
bd9b55ff-8da5-4994-99dc-4c61acefe799	fc5eb855-5d50-4ee1-b5cc-9abc638e40f5	2026-03-19 18:14:31	ASUNTO: Notificación de Orden de Pago N° 163-001-0725775 en Buzón Electrónico SOL	http://panel.oracon.com/uploads/1068749840.pdf	NO_LEIDO	2026-08-09 18:44:42.025	1068749840	NOTIFICACION	\N	\N
30587e8b-90b9-4778-b2b3-547b642f7707	fc5eb855-5d50-4ee1-b5cc-9abc638e40f5	2026-03-10 00:17:23	ASUNTO: Notificación de Resolución de Conclusión N° 1630070812011	http://panel.oracon.com/uploads/1630070812011_resolucion.pdf	NO_LEIDO	2026-08-09 18:44:42.025	1630070812011	NOTIFICACION	\N	\N
18c8c46f-5e18-441b-a8ed-354f1238db23	fc5eb855-5d50-4ee1-b5cc-9abc638e40f5	2026-02-23 12:48:41	ASUNTO: Notificación de Resolución de Ejecución Coactiva N° 163-006-0428354 en Buzón Electrónico SOL	http://panel.oracon.com/uploads/1060761217.pdf	NO_LEIDO	2026-08-09 18:44:42.025	1060761217	NOTIFICACION	\N	\N
86e30b65-d393-46b0-8883-91580f58ed3f	fc5eb855-5d50-4ee1-b5cc-9abc638e40f5	2026-02-19 16:46:16	ASUNTO: Notificación de Orden de Pago N° 163-001-0720220 en Buzón Electrónico SOL	http://panel.oracon.com/uploads/1059916913.pdf	NO_LEIDO	2026-08-09 18:44:42.025	1059916913	NOTIFICACION	\N	\N
0d2f8715-9e4c-4557-9ebd-e1885fccebad	fc5eb855-5d50-4ee1-b5cc-9abc638e40f5	2026-02-19 16:46:16	ASUNTO: Notificación de Orden de Pago N° 163-001-0720221 en Buzón Electrónico SOL	http://panel.oracon.com/uploads/1059916500.pdf	NO_LEIDO	2026-08-09 18:44:42.025	1059916500	NOTIFICACION	\N	\N
ea144226-5522-4fbc-b9ed-6f98d50de103	13460e01-0de5-4caa-866a-8c9c73b38957	2026-07-20 23:47:53	ASUNTO: Notificación de Resolución de Conclusión N° 1630070862349	http://panel.oracon.com/uploads/1630070862349_resolucion.pdf	NO_LEIDO	2026-08-09 18:57:22.673	1630070862349	NOTIFICACION	\N	\N
6c5f3f84-a9de-49fa-9b1a-c47f0daf4427	13460e01-0de5-4caa-866a-8c9c73b38957	2026-07-10 13:41:30	ASUNTO: Notificación RCA Ingreso Recaudacion Detracciones N° 1630240109479	http://panel.oracon.com/uploads/1108685993.pdf	NO_LEIDO	2026-08-09 18:57:22.673	1108685993	NOTIFICACION	\N	\N
e0c4842e-d3d3-48b3-afa7-a88139f65119	13460e01-0de5-4caa-866a-8c9c73b38957	2026-06-24 11:22:15	ASUNTO: Notificación Esquela N° 002303820267P0300	http://panel.oracon.com/uploads/1102464174.pdf	NO_LEIDO	2026-08-09 18:57:22.673	1102464174	NOTIFICACION	\N	\N
4d72c4cb-0386-4bb0-b6bf-5cc083a5a2b4	13460e01-0de5-4caa-866a-8c9c73b38957	2026-06-23 16:39:03	ASUNTO: Notificación de Resolución de Ejecución Coactiva N° 163-006-0448668 en Buzón Electrónico SOL	http://panel.oracon.com/uploads/1102063292.pdf	NO_LEIDO	2026-08-09 18:57:22.673	1102063292	NOTIFICACION	\N	\N
3e57eeab-ff29-40e3-bad1-7e60e4d10ab6	13460e01-0de5-4caa-866a-8c9c73b38957	2026-06-19 15:49:07	ASUNTO: Notificación de Orden de Pago N° 163-001-0746784 en Buzón Electrónico SOL	http://panel.oracon.com/uploads/1100853847.pdf	NO_LEIDO	2026-08-09 18:57:22.673	1100853847	NOTIFICACION	\N	\N
b4f87de8-d99a-411e-a08f-c8c53ec4f16b	13460e01-0de5-4caa-866a-8c9c73b38957	2026-04-27 11:15:01	ASUNTO: Notificación de RCA - Liberación de Fondos Procedente N.° 1630240096680	http://panel.oracon.com/uploads/1081593458.pdf	NO_LEIDO	2026-08-09 18:57:22.673	1081593458	NOTIFICACION	\N	\N
09ce48bb-5c0c-4636-8c4e-527cff82160a	13460e01-0de5-4caa-866a-8c9c73b38957	2026-01-27 17:10:23	ASUNTO: Notificación de RCA - Liberación de Fondos Procedente N.° 1630240092972	http://panel.oracon.com/uploads/1053033790.pdf	NO_LEIDO	2026-08-09 18:57:22.673	1053033790	NOTIFICACION	\N	\N
a8c0a2df-88d2-47d0-8f1f-54a3fae78130	d7c75373-0bf0-4f34-85ec-c5ffa1081f84	2026-08-04 18:24:45	ASUNTO: Notificación de RCA - Liberación de Fondos Procedente N.° 1630240114840	http://panel.oracon.com/uploads/1116763099.pdf	NO_LEIDO	2026-08-09 22:02:26.386	1116763099	NOTIFICACION	\N	\N
1bb8c7e6-d553-4735-a692-779ac304bf9a	d7c75373-0bf0-4f34-85ec-c5ffa1081f84	2026-05-22 17:00:16	ASUNTO: Notificación de Orden de Pago N° 163-001-0738313 en Buzón Electrónico SOL	http://panel.oracon.com/uploads/1090513450.pdf	NO_LEIDO	2026-08-09 22:02:26.386	1090513450	NOTIFICACION	\N	\N
40f2ad31-ec3e-41eb-8677-983f1cf4a862	d7c75373-0bf0-4f34-85ec-c5ffa1081f84	2026-03-19 12:15:15	ASUNTO: Notificación Resolución Coactiva Levantamiento de Embargo N° 1630070814197	http://panel.oracon.com/uploads/1068646788.pdf	NO_LEIDO	2026-08-09 22:02:26.386	1068646788	NOTIFICACION	\N	\N
b17b6883-7e3d-40e4-a8b5-de6c725d328b	d7c75373-0bf0-4f34-85ec-c5ffa1081f84	2026-02-26 12:02:25	ASUNTO: Notificación Resolución Coactiva FL N° 1630070809726	http://panel.oracon.com/uploads/1062292530.pdf	NO_LEIDO	2026-08-09 22:02:26.386	1062292530	NOTIFICACION	\N	\N
39c8307b-8580-4187-89d3-5a96c11f49e1	d7c75373-0bf0-4f34-85ec-c5ffa1081f84	2026-02-20 16:49:05	ASUNTO: Notificación de Orden de Pago N° 163-001-0720847 en Buzón Electrónico SOL	http://panel.oracon.com/uploads/1060329528.pdf	NO_LEIDO	2026-08-09 22:02:26.386	1060329528	NOTIFICACION	\N	\N
a8941799-71d0-426d-a676-2a32e30197eb	d7c75373-0bf0-4f34-85ec-c5ffa1081f84	2026-02-02 14:23:55	ASUNTO: Notificación de RCA - Liberación de Fondos Procedente N.° 1630240093397	http://panel.oracon.com/uploads/1055342697.pdf	NO_LEIDO	2026-08-09 22:02:26.386	1055342697	NOTIFICACION	\N	\N
8104e7b8-1110-4aba-aac2-55b8f548d527	d7c75373-0bf0-4f34-85ec-c5ffa1081f84	2026-01-27 11:06:30	ASUNTO: Notificación Resolución Coactiva Retención a Terceros N° 1630070801436	http://panel.oracon.com/uploads/1052834224.pdf	NO_LEIDO	2026-08-09 22:02:26.386	1052834224	NOTIFICACION	\N	\N
d6e91ca2-408f-4563-8a54-400655e1ab08	55ad6ec1-7b7d-472d-b316-4e5642dc5783	2026-04-08 12:01:31	ASUNTO: Notificación de Resolución Coactiva de Conclusión con Numeral de Sustento N° 1630070826116 e	http://panel.oracon.com/uploads/1075348965.pdf	NO_LEIDO	2026-08-09 22:07:03.891	1075348965	NOTIFICACION	\N	\N
5a420873-747e-47e0-b20a-52bbed359e4b	e47f01be-9617-437e-b5f1-1c56ef8be3c8	2026-05-22 18:27:18	ASUNTO: Notificación Esquela N° 001214620267G0300	http://panel.oracon.com/uploads/1090490097.pdf	NO_LEIDO	2026-08-09 22:09:35.259	1090490097	NOTIFICACION	\N	\N
cfa0056c-bb86-4c50-aed8-81a9f1e49773	e47f01be-9617-437e-b5f1-1c56ef8be3c8	2026-03-25 14:27:26	ASUNTO: Notificación de RCA - Ingreso Recaudación Detracciones N.° 0630240183352	http://panel.oracon.com/uploads/1070811846.pdf	NO_LEIDO	2026-08-09 22:09:35.259	1070811846	NOTIFICACION	\N	\N
8ecfcb8b-2033-49e0-8c9f-8edbe3854948	e47f01be-9617-437e-b5f1-1c56ef8be3c8	2026-03-10 22:06:57	ASUNTO: Notificación de Comunicación de Ingreso como Recaudación N.° 0639500109648	http://panel.oracon.com/uploads/1066206845.pdf	NO_LEIDO	2026-08-09 22:09:35.259	1066206845	NOTIFICACION	\N	\N
025e2390-fa9b-4770-8707-1229ae69d963	c7ea4920-6ebf-41a1-b2f5-fcd53c3b3ee6	2026-06-17 14:46:06	ASUNTO: Notificación RC Requerimiento de Pago N° 0300070876019	http://panel.oracon.com/uploads/1099920404.pdf	NO_LEIDO	2026-08-09 22:10:45.119	1099920404	NOTIFICACION	\N	\N
bb0aa998-30c8-4dcf-b91f-f28910b7a9e5	c7ea4920-6ebf-41a1-b2f5-fcd53c3b3ee6	2026-06-11 00:00:01	ASUNTO: NOTIFICACION DE007301 No: 0300070813643	http://panel.oracon.com/uploads/1097644275.pdf	NO_LEIDO	2026-08-09 22:10:45.119	1097644275	NOTIFICACION	\N	\N
6f1b377c-3851-4738-b395-1347a86efcca	c7ea4920-6ebf-41a1-b2f5-fcd53c3b3ee6	2026-02-23 12:30:15	ASUNTO: Notificación de Resolución de Ejecución Coactiva N° 029-006-3881622 en Buzón Electrónico SOL	http://panel.oracon.com/uploads/1060754337.pdf	NO_LEIDO	2026-08-09 22:10:45.119	1060754337	NOTIFICACION	\N	\N
37e6565a-89f9-4d7d-854d-842fb856c307	c7ea4920-6ebf-41a1-b2f5-fcd53c3b3ee6	2026-02-19 17:40:53	ASUNTO: Notificación de Orden de Pago N° 030-001-3829212 en Buzón Electrónico SOL	http://panel.oracon.com/uploads/1059963722.pdf	NO_LEIDO	2026-08-09 22:10:45.119	1059963722	NOTIFICACION	\N	\N
d9b6bde4-cdc5-438f-b78c-4f0ef19ac36e	c7ea4920-6ebf-41a1-b2f5-fcd53c3b3ee6	2026-02-19 17:40:53	ASUNTO: Notificación de Orden de Pago N° 030-001-3829213 en Buzón Electrónico SOL	http://panel.oracon.com/uploads/1059958497.pdf	NO_LEIDO	2026-08-09 22:10:45.119	1059958497	NOTIFICACION	\N	\N
\.


--
-- Data for Name: NotificacionLectura; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."NotificacionLectura" (id, "notificacionId", "usuarioId", "creadoAt") FROM stdin;
7e4b51c1-273e-429c-9b5f-2c1de169be82	5db3e680-242c-402f-b6b7-9f199a5f4a29	2cc16576-af38-4be8-b765-8f46040c5b1b	2026-08-09 18:28:42.301
75dda919-5535-4c07-8d58-c72842085567	fbaefea0-0bbd-4a1a-9ebe-ca8ce56e2f9f	2cc16576-af38-4be8-b765-8f46040c5b1b	2026-08-09 18:28:42.301
f05dbf82-c776-4d5e-a783-16ecdb1ab48c	3f370399-6bfe-4ad9-81e9-805a08c40ee3	2cc16576-af38-4be8-b765-8f46040c5b1b	2026-08-09 18:28:42.301
a3ff0bde-6790-4276-acb0-1f1d126e6ad5	ee53878c-f26a-41f9-b05a-a3c1fe89a1f2	2cc16576-af38-4be8-b765-8f46040c5b1b	2026-08-09 18:28:42.301
2aab6729-66eb-49ed-9e01-a3cfe3b0fe55	0089d6d7-1575-4db2-8066-3495bcf155a7	2cc16576-af38-4be8-b765-8f46040c5b1b	2026-08-09 18:28:42.301
739a5bdb-9935-43d8-a050-76f358e0b564	4f3188dc-f0a4-40f7-a590-9aa833cec810	2cc16576-af38-4be8-b765-8f46040c5b1b	2026-08-09 18:28:42.301
d5061b34-a6a7-479d-b573-324ee21af6b1	58a3cf5d-05c4-4c5e-b5de-30f39b65c5a1	2cc16576-af38-4be8-b765-8f46040c5b1b	2026-08-09 18:28:42.301
81be8688-1f54-4e47-98d5-2f201c93aef8	4f64b4ab-fbe5-4485-a688-71974e598158	2cc16576-af38-4be8-b765-8f46040c5b1b	2026-08-09 18:28:42.301
6bec59c9-d94c-41bc-a2c0-4430dace3fa8	2a06eb48-bcba-4c49-8eb2-89bd81066ec5	2cc16576-af38-4be8-b765-8f46040c5b1b	2026-08-09 18:28:42.301
eb978728-ff53-430d-a5f1-183cd321fec2	57cb5e61-eefd-4cae-beb2-d596a705c525	2cc16576-af38-4be8-b765-8f46040c5b1b	2026-08-09 18:28:42.301
807b051c-2331-43c1-b316-aa28371ea0c6	4df43ecc-c86c-4662-9c2e-56d4f8ba48ae	2cc16576-af38-4be8-b765-8f46040c5b1b	2026-08-09 18:28:42.301
f2fa396c-9508-4e88-9ba4-10c6cf4e2731	e14b4aae-4b03-40ba-97f3-89f299eaac94	2cc16576-af38-4be8-b765-8f46040c5b1b	2026-08-09 18:28:42.301
bf5381d3-9f44-4708-a289-8cb4d105e751	b4f87de8-d99a-411e-a08f-c8c53ec4f16b	f021382c-cf29-4908-ba2f-8fdf702379e5	2026-08-09 18:59:34.629
a81d7ca1-4716-48cc-bec2-af18ef478686	ea144226-5522-4fbc-b9ed-6f98d50de103	f021382c-cf29-4908-ba2f-8fdf702379e5	2026-08-09 18:59:37.485
f63c1e1b-feba-478e-8451-1b9ef04de635	6c5f3f84-a9de-49fa-9b1a-c47f0daf4427	f021382c-cf29-4908-ba2f-8fdf702379e5	2026-08-09 18:59:41.954
\.


--
-- Data for Name: Usuario; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Usuario" (id, email, password, rol, "createdAt", "updatedAt", "telegramChatId", nombres, apellidos, dni) FROM stdin;
e76f2d2b-d59a-44d6-9047-824224918b3b	admin@oracon.com	$2b$10$/omg2h8AnY/j.s2UfB/oQ.bwykzHFoBRf/jea7HL.Ag7EhrKMtsPG	SUPER_ADMIN	2026-07-31 18:55:10.952	2026-08-08 19:17:02.238	\N	Super Admin BES	ORACON	e76f2d2b-d59a-44d6-9047-824224918b3b
2cc16576-af38-4be8-b765-8f46040c5b1b	da74838577@bes.com	$2b$10$fs/HGhE/SCqjtiDTD8yKLOpLKASDoaE8MSMEDWP4JHceJFTBWkotC	USUARIO_LOCAL	2026-08-09 17:46:25.982	2026-08-09 17:46:25.982	5592424356	Dante	Arce	74838577
da86d7ec-76ff-421c-ace1-df7e856eea70	sz12345678@bes.com	$2b$10$5bdqVSs1AvG.8ycCRilGY.QQLw783KHHpT5.HaDWVQN8sKvRJ9MFS	USUARIO_LOCAL	2026-08-09 18:42:27.115	2026-08-09 18:42:27.115	7220775813	Sven	Zapata	12345678
f021382c-cf29-4908-ba2f-8fdf702379e5	az23456789@bes.com	$2b$10$4iH7T1OTHSjhhk1gDEMBcuHFCT4k2HcmpVfuBd0xWcaoOqjEFhm/i	USUARIO_LOCAL	2026-08-09 18:52:04.811	2026-08-09 18:52:04.811	6002843579	Aicry	ZZZ	23456789
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
046cc4fc-67a9-4f54-947d-d670f4445ed3	7768cbebb1f309e964784bc14986431bc40b59f8f5a05eba4752549eb92df5c1	2026-07-31 18:55:05.429466+00	20260505031702_init_postgres_auth	\N	\N	2026-07-31 18:55:05.337101+00	1
bd460916-7ea6-4166-b2d2-36fcc1c47cb4	c8a7ae5b1eeca55e4609f7d5c3a6b75bc78e5168fae93d1cbb8b63dd6bc2110b	2026-07-31 18:55:05.450183+00	20260505035451_add_estado_conexion	\N	\N	2026-07-31 18:55:05.4346+00	1
832ebf7f-9c12-49e4-9e16-d770ab1880d9	7bd5119193714832ddffe8f52413e368ca9791a504af4a74ea10635f372fc742	2026-07-31 18:55:05.480153+00	20260507032806_add_file_id_to_notificacion	\N	\N	2026-07-31 18:55:05.455221+00	1
5b4038ad-8fac-4e54-b75f-107235cbe5a6	1b573e3fc43e5b4aacbebc5977b9e15db718325d724bf9d32a45c7ef46494e83	2026-07-31 18:55:05.529992+00	20260507160044_add_empresa_asignacion	\N	\N	2026-07-31 18:55:05.485775+00	1
76ce11b5-374e-4ccd-8273-94ce18c28e71	15a5dc77fc4fb566dbec5b42f58966f84d384d3f237c9972a42482ba7751e9cb	2026-07-31 18:55:05.581626+00	20260514000836_add_notificacion_lectura_per_user	\N	\N	2026-07-31 18:55:05.535107+00	1
adbd17ac-68bb-4b5c-aecb-be40560e5bb2	772aa7d8569311bcd37a0dc0ef06ad7e1ed1a33af4bdbbea7d15ff0687854c04	2026-07-31 18:55:06.760249+00	20260731185506_add_audit_log	\N	\N	2026-07-31 18:55:06.720152+00	1
dbb35ce9-b8b0-4f8d-b6c7-0992defef42e	598ebc0115fcee29078f16342266c3995c919a2c4dc35e7d5a329f391b14ccaf	2026-08-04 22:24:37.481016+00	20260804222400_add_telegram_chat_id		\N	2026-08-04 22:24:37.481016+00	0
a1ca36ef-d5dc-4e36-a8ed-c5d4ea8918d1	878a94b6ed2c1bec834f29eaa4766375182c04d683aa05b8c73ed22504504230	2026-08-05 23:40:12.436818+00	20260804224700_restructure_usuario_nombres_apellidos_dni	\N	\N	2026-08-05 23:40:12.310128+00	1
8b6d4eda-85da-46e8-9e4f-bd8f43541d80	6da50ab448f982597c2a9d16665eb1489c3b29d94dcf652fbedb0b71c74fc152	2026-08-06 00:59:59.249251+00	20260806010000_add_monto_exigible_expediente		\N	2026-08-06 00:59:59.249251+00	0
\.


--
-- Name: AuditLog AuditLog_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_pkey" PRIMARY KEY (id);


--
-- Name: EmpresaAsignacion EmpresaAsignacion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EmpresaAsignacion"
    ADD CONSTRAINT "EmpresaAsignacion_pkey" PRIMARY KEY (id);


--
-- Name: Empresa Empresa_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Empresa"
    ADD CONSTRAINT "Empresa_pkey" PRIMARY KEY (id);


--
-- Name: NotificacionLectura NotificacionLectura_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."NotificacionLectura"
    ADD CONSTRAINT "NotificacionLectura_pkey" PRIMARY KEY (id);


--
-- Name: Notificacion Notificacion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notificacion"
    ADD CONSTRAINT "Notificacion_pkey" PRIMARY KEY (id);


--
-- Name: Usuario Usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Usuario"
    ADD CONSTRAINT "Usuario_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: EmpresaAsignacion_usuarioId_empresaId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "EmpresaAsignacion_usuarioId_empresaId_key" ON public."EmpresaAsignacion" USING btree ("usuarioId", "empresaId");


--
-- Name: Empresa_ruc_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Empresa_ruc_key" ON public."Empresa" USING btree (ruc);


--
-- Name: NotificacionLectura_notificacionId_usuarioId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "NotificacionLectura_notificacionId_usuarioId_key" ON public."NotificacionLectura" USING btree ("notificacionId", "usuarioId");


--
-- Name: Notificacion_fileId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Notificacion_fileId_key" ON public."Notificacion" USING btree ("fileId");


--
-- Name: Usuario_dni_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Usuario_dni_key" ON public."Usuario" USING btree (dni);


--
-- Name: Usuario_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Usuario_email_key" ON public."Usuario" USING btree (email);


--
-- Name: AuditLog AuditLog_usuarioId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES public."Usuario"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: EmpresaAsignacion EmpresaAsignacion_empresaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EmpresaAsignacion"
    ADD CONSTRAINT "EmpresaAsignacion_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES public."Empresa"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: EmpresaAsignacion EmpresaAsignacion_usuarioId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EmpresaAsignacion"
    ADD CONSTRAINT "EmpresaAsignacion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES public."Usuario"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Empresa Empresa_usuarioId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Empresa"
    ADD CONSTRAINT "Empresa_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES public."Usuario"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: NotificacionLectura NotificacionLectura_notificacionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."NotificacionLectura"
    ADD CONSTRAINT "NotificacionLectura_notificacionId_fkey" FOREIGN KEY ("notificacionId") REFERENCES public."Notificacion"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: NotificacionLectura NotificacionLectura_usuarioId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."NotificacionLectura"
    ADD CONSTRAINT "NotificacionLectura_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES public."Usuario"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Notificacion Notificacion_empresaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notificacion"
    ADD CONSTRAINT "Notificacion_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES public."Empresa"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict pqLZ65WMzItNek3IdbkETq9ANq0mqfgWve2jyUpLGSp0TMbizG8s5xAWFatNV7z

