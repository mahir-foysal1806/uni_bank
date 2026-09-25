--
-- PostgreSQL database dump
--

\restrict TrgSApXqWwXGHDVEjPwkuAihk1KVoElYAGf8vzwBKiq2XSGWJ5QetSrra9GSmGp

-- Dumped from database version 18.6 (Debian 18.6-1.pgdg12+2)
-- Dumped by pg_dump version 18.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: uniqbank_user
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO uniqbank_user;

--
-- Name: pg_trgm; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;


--
-- Name: EXTENSION pg_trgm; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_trgm IS 'text similarity measurement and index searching based on trigrams';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: questions; Type: TABLE; Schema: public; Owner: uniqbank_user
--

CREATE TABLE public.questions (
    id integer NOT NULL,
    department character varying(100) NOT NULL,
    semester character varying(50) NOT NULL,
    course_code character varying(50) NOT NULL,
    course_title character varying(255) NOT NULL,
    exam_type character varying(50) NOT NULL,
    session_year character varying(20) NOT NULL,
    file_name character varying(255) NOT NULL,
    original_name character varying(255) NOT NULL,
    file_path character varying(500),
    file_size integer,
    download_count integer DEFAULT 0 NOT NULL,
    uploaded_at timestamp without time zone DEFAULT now() NOT NULL,
    storage_key text
);


ALTER TABLE public.questions OWNER TO uniqbank_user;

--
-- Name: questions_id_seq; Type: SEQUENCE; Schema: public; Owner: uniqbank_user
--

CREATE SEQUENCE public.questions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.questions_id_seq OWNER TO uniqbank_user;

--
-- Name: questions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: uniqbank_user
--

ALTER SEQUENCE public.questions_id_seq OWNED BY public.questions.id;


--
-- Name: questions id; Type: DEFAULT; Schema: public; Owner: uniqbank_user
--

ALTER TABLE ONLY public.questions ALTER COLUMN id SET DEFAULT nextval('public.questions_id_seq'::regclass);


--
-- Data for Name: questions; Type: TABLE DATA; Schema: public; Owner: uniqbank_user
--

COPY public.questions (id, department, semester, course_code, course_title, exam_type, session_year, file_name, original_name, file_path, file_size, download_count, uploaded_at, storage_key) FROM stdin;
7	CSE	3rd	CSE1111	DSA	Midterm	2024-2025	1789843055725-188550337.pdf	reasume(12405026).pdf	\N	63232	9	2026-09-19 18:37:38.683214	questions/1789843055771-1789843055725-188550337.pdf
1	Computer Science & Engineering	1st Semester	CSE 1221	Cse	Midterm	2023-2024	1789374147024-1daf5ac8c341d4c9.jpg	inbound8826093235957674016.jpg	/public/uploads/1789374147024-1daf5ac8c341d4c9.jpg	3786125	2	2026-09-14 08:22:28.24745	\N
2	CSE	1st Semester	CSE1212	jfne	Midterm	dnwdf ee	1789492846219-974272519eb85a27.pdf	reasume(12405026).pdf	/public/uploads/1789492846219-974272519eb85a27.pdf	63232	1	2026-09-15 17:20:46.264028	\N
16	computer science and engneering	2nd semester	CSE1201	Data structure and algorithm	Final	2024-2025	1790018617343-586729294.pdf	IMG_20260922_011523 (2).pdf	\N	279063	10	2026-09-21 19:23:40.858465	questions/1790018617640-1790018617343-586729294.pdf
14	DSM	2nd semester	DSM1206	Meteology(lab)	Midterm	2024-2025	1790017277212-338676486.png	dsm6.png	\N	304619	3	2026-09-21 19:01:19.422126	questions/1790017277536-1790017277212-338676486.png
13	DSM	2nd semester	DSM1204	BIological Environment(practical)	Midterm	2024-2025	1790017012022-209823073.png	dsm5.png	\N	195520	1	2026-09-21 18:56:55.122958	questions/1790017012451-1790017012022-209823073.png
15	DSM	2nd semester	DSM1209	Basic computer	Midterm	2024-2025	1790017931661-803329430.jpeg	WhatsApp Image 2026-09-22 at 1.10.34 AM.jpeg	\N	88005	6	2026-09-21 19:12:14.239586	questions/1790017931886-1790017931661-803329430.jpeg
11	DSM	2nd semester	DSM1210	Lab(basic computer)	Midterm	2024-2025	1790016782413-624101496.png	dsm3.png	\N	831042	1	2026-09-21 18:53:07.367252	questions/1790016783734-1790016782413-624101496.png
17	CSE	2nd Semester	CSE1201	Data structure and algorithm	Final	2024-2025	1790100461073-405798184.jpeg	WhatsApp Image 2026-09-19 at 10.51.42 PM.jpeg	\N	152400	2	2026-09-22 18:07:44.609671	questions/1790100461615-1790100461073-405798184.jpeg
10	DSM	2nd semester	DSM1203	BIological Environment	Midterm	2024-2025	1790016508739-187089639.png	dsm2.png	\N	406069	1	2026-09-21 18:48:31.976316	questions/1790016509078-1790016508739-187089639.png
6	adfje	dfjw ef	ajfw	wqjef	Midterm	ajdf	1789842935630-819103241.pdf	reasume(12405026).pdf	\N	63232	3	2026-09-19 18:35:38.656931	questions/1789842935815-1789842935630-819103241.pdf
8	Cse	1 st	Cse 1221	Cse	Final	2023	1789844301206-751453367.jpg	17898442824261710985564533100791.jpg	\N	3244091	6	2026-09-19 18:58:26.759792	questions/1789844302715-1789844301206-751453367.jpg
12	DSM	2nd semester	DSM1208	Lab(chemistry)	Midterm	2024-2025	1790016882593-168660474.png	dsm4.png	\N	541815	1	2026-09-21 18:54:45.295134	questions/1790016883139-1790016882593-168660474.png
9	DSM	2nd semester	DSM1205	Meteology	Midterm	2024-2025	1790016374146-492879848.png	dsm.png	\N	496918	1	2026-09-21 18:46:18.244776	questions/1790016374241-1790016374146-492879848.png
\.


--
-- Name: questions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: uniqbank_user
--

SELECT pg_catalog.setval('public.questions_id_seq', 17, true);


--
-- Name: questions questions_pkey; Type: CONSTRAINT; Schema: public; Owner: uniqbank_user
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_pkey PRIMARY KEY (id);


--
-- Name: idx_questions_course_code_trgm; Type: INDEX; Schema: public; Owner: uniqbank_user
--

CREATE INDEX idx_questions_course_code_trgm ON public.questions USING gin (course_code public.gin_trgm_ops);


--
-- Name: idx_questions_course_title_trgm; Type: INDEX; Schema: public; Owner: uniqbank_user
--

CREATE INDEX idx_questions_course_title_trgm ON public.questions USING gin (course_title public.gin_trgm_ops);


--
-- Name: idx_questions_department; Type: INDEX; Schema: public; Owner: uniqbank_user
--

CREATE INDEX idx_questions_department ON public.questions USING btree (department);


--
-- Name: idx_questions_dept_sem; Type: INDEX; Schema: public; Owner: uniqbank_user
--

CREATE INDEX idx_questions_dept_sem ON public.questions USING btree (department, semester);


--
-- Name: idx_questions_semester; Type: INDEX; Schema: public; Owner: uniqbank_user
--

CREATE INDEX idx_questions_semester ON public.questions USING btree (semester);


--
-- Name: idx_questions_uploaded_at; Type: INDEX; Schema: public; Owner: uniqbank_user
--

CREATE INDEX idx_questions_uploaded_at ON public.questions USING btree (uploaded_at DESC);


--
-- Name: FUNCTION gtrgm_in(cstring); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.gtrgm_in(cstring) TO uniqbank_user;


--
-- Name: FUNCTION gtrgm_out(public.gtrgm); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.gtrgm_out(public.gtrgm) TO uniqbank_user;


--
-- Name: TYPE gtrgm; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TYPE public.gtrgm TO uniqbank_user;


--
-- Name: FUNCTION gin_extract_query_trgm(text, internal, smallint, internal, internal, internal, internal); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.gin_extract_query_trgm(text, internal, smallint, internal, internal, internal, internal) TO uniqbank_user;


--
-- Name: FUNCTION gin_extract_value_trgm(text, internal); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.gin_extract_value_trgm(text, internal) TO uniqbank_user;


--
-- Name: FUNCTION gin_trgm_consistent(internal, smallint, text, integer, internal, internal, internal, internal); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.gin_trgm_consistent(internal, smallint, text, integer, internal, internal, internal, internal) TO uniqbank_user;


--
-- Name: FUNCTION gin_trgm_triconsistent(internal, smallint, text, integer, internal, internal, internal); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.gin_trgm_triconsistent(internal, smallint, text, integer, internal, internal, internal) TO uniqbank_user;


--
-- Name: FUNCTION gtrgm_compress(internal); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.gtrgm_compress(internal) TO uniqbank_user;


--
-- Name: FUNCTION gtrgm_consistent(internal, text, smallint, oid, internal); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.gtrgm_consistent(internal, text, smallint, oid, internal) TO uniqbank_user;


--
-- Name: FUNCTION gtrgm_decompress(internal); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.gtrgm_decompress(internal) TO uniqbank_user;


--
-- Name: FUNCTION gtrgm_distance(internal, text, smallint, oid, internal); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.gtrgm_distance(internal, text, smallint, oid, internal) TO uniqbank_user;


--
-- Name: FUNCTION gtrgm_options(internal); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.gtrgm_options(internal) TO uniqbank_user;


--
-- Name: FUNCTION gtrgm_penalty(internal, internal, internal); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.gtrgm_penalty(internal, internal, internal) TO uniqbank_user;


--
-- Name: FUNCTION gtrgm_picksplit(internal, internal); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.gtrgm_picksplit(internal, internal) TO uniqbank_user;


--
-- Name: FUNCTION gtrgm_same(public.gtrgm, public.gtrgm, internal); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.gtrgm_same(public.gtrgm, public.gtrgm, internal) TO uniqbank_user;


--
-- Name: FUNCTION gtrgm_union(internal, internal); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.gtrgm_union(internal, internal) TO uniqbank_user;


--
-- Name: FUNCTION set_limit(real); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.set_limit(real) TO uniqbank_user;


--
-- Name: FUNCTION show_limit(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.show_limit() TO uniqbank_user;


--
-- Name: FUNCTION show_trgm(text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.show_trgm(text) TO uniqbank_user;


--
-- Name: FUNCTION similarity(text, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.similarity(text, text) TO uniqbank_user;


--
-- Name: FUNCTION similarity_dist(text, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.similarity_dist(text, text) TO uniqbank_user;


--
-- Name: FUNCTION similarity_op(text, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.similarity_op(text, text) TO uniqbank_user;


--
-- Name: FUNCTION strict_word_similarity(text, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.strict_word_similarity(text, text) TO uniqbank_user;


--
-- Name: FUNCTION strict_word_similarity_commutator_op(text, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.strict_word_similarity_commutator_op(text, text) TO uniqbank_user;


--
-- Name: FUNCTION strict_word_similarity_dist_commutator_op(text, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.strict_word_similarity_dist_commutator_op(text, text) TO uniqbank_user;


--
-- Name: FUNCTION strict_word_similarity_dist_op(text, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.strict_word_similarity_dist_op(text, text) TO uniqbank_user;


--
-- Name: FUNCTION strict_word_similarity_op(text, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.strict_word_similarity_op(text, text) TO uniqbank_user;


--
-- Name: FUNCTION word_similarity(text, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.word_similarity(text, text) TO uniqbank_user;


--
-- Name: FUNCTION word_similarity_commutator_op(text, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.word_similarity_commutator_op(text, text) TO uniqbank_user;


--
-- Name: FUNCTION word_similarity_dist_commutator_op(text, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.word_similarity_dist_commutator_op(text, text) TO uniqbank_user;


--
-- Name: FUNCTION word_similarity_dist_op(text, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.word_similarity_dist_op(text, text) TO uniqbank_user;


--
-- Name: FUNCTION word_similarity_op(text, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.word_similarity_op(text, text) TO uniqbank_user;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON SEQUENCES TO uniqbank_user;


--
-- Name: DEFAULT PRIVILEGES FOR TYPES; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON TYPES TO uniqbank_user;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON FUNCTIONS TO uniqbank_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON TABLES TO uniqbank_user;


--
-- PostgreSQL database dump complete
--

\unrestrict TrgSApXqWwXGHDVEjPwkuAihk1KVoElYAGf8vzwBKiq2XSGWJ5QetSrra9GSmGp

