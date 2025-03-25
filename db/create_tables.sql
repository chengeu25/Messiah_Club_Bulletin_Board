-- MySQL dump 10.13  Distrib 9.2.0, for macos15.2 (arm64)
--
-- Host: localhost    Database: sharc
-- ------------------------------------------------------
-- Server version	9.0.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `club`
--

DROP TABLE IF EXISTS `club`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `club` (
  `CLUB_ID` int NOT NULL AUTO_INCREMENT,
  `CLUB_NAME` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `IS_ACTIVE` tinyint DEFAULT NULL,
  `DESCRIPTION` text COLLATE utf8mb4_general_ci,
  `LAST_UPDATED` timestamp NULL DEFAULT NULL,
  `SCHOOL_ID` int DEFAULT NULL,
  `CLUB_LOGO` mediumblob,
  `LOGO_PREFIX` varchar(45) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `creation_date` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`CLUB_ID`),
  KEY `FK_SCHOOL_SCHOOL_ID_idx` (`SCHOOL_ID`),
  CONSTRAINT `FK_CLUB_SCHOOL_ID` FOREIGN KEY (`SCHOOL_ID`) REFERENCES `school` (`SCHOOL_ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `club_admin`
--

DROP TABLE IF EXISTS `club_admin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `club_admin` (
  `CLUB_ADMIN_ID` int NOT NULL AUTO_INCREMENT,
  `USER_ID` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `CLUB_ID` int NOT NULL,
  `IS_ACTIVE` tinyint DEFAULT NULL,
  PRIMARY KEY (`CLUB_ADMIN_ID`),
  KEY `FK_CLUB_ADMIN_CLUB_ID` (`CLUB_ID`),
  KEY `FK_CLUB_ADMIN_USER_ID` (`USER_ID`),
  CONSTRAINT `FK_CLUB_ADMIN_CLUB_ID` FOREIGN KEY (`CLUB_ID`) REFERENCES `club` (`CLUB_ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_CLUB_ADMIN_USER_ID` FOREIGN KEY (`USER_ID`) REFERENCES `users` (`EMAIL`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=50 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `club_officer`
--

DROP TABLE IF EXISTS `club_officer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `club_officer` (
  `OFFICER_ID` int NOT NULL,
  `USER_ID` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `CLUB_ID` int NOT NULL,
  PRIMARY KEY (`OFFICER_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `club_photo`
--

DROP TABLE IF EXISTS `club_photo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `club_photo` (
  `CLUB_PHOTO_ID` int NOT NULL AUTO_INCREMENT,
  `CLUB_ID` int NOT NULL,
  `IMAGE` mediumblob,
  `image_prefix` varchar(45) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`CLUB_PHOTO_ID`),
  KEY `FK_CLUB_PHOTO_CLUB_ID_idx` (`CLUB_ID`),
  CONSTRAINT `FK_CLUB_PHOTO_CLUB_ID` FOREIGN KEY (`CLUB_ID`) REFERENCES `club` (`CLUB_ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `club_tags`
--

DROP TABLE IF EXISTS `club_tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `club_tags` (
  `CLUB_TAG_ID` int NOT NULL AUTO_INCREMENT,
  `CLUB_ID` int NOT NULL,
  `TAG_ID` int DEFAULT NULL,
  PRIMARY KEY (`CLUB_TAG_ID`),
  KEY `FK_CLUB_TAGS_CLUB_ID_idx` (`CLUB_ID`),
  KEY `FK_CLUB_TAGS_TAG_ID_idx` (`TAG_ID`),
  CONSTRAINT `FK_CLUB_TAGS_CLUB_ID` FOREIGN KEY (`CLUB_ID`) REFERENCES `club` (`CLUB_ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_CLUB_TAGS_TAG_ID` FOREIGN KEY (`TAG_ID`) REFERENCES `tag` (`TAG_ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=82 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `comments`
--

DROP TABLE IF EXISTS `comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comments` (
  `comment_id` int NOT NULL AUTO_INCREMENT,
  `event_id` int NOT NULL,
  `user_id` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `is_flagged` tinyint DEFAULT '0',
  `is_deleted` tinyint DEFAULT '0',
  `content` mediumtext COLLATE utf8mb4_general_ci,
  `posted_timestamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `parent` int DEFAULT NULL,
  `indent_level` int DEFAULT NULL,
  PRIMARY KEY (`comment_id`),
  KEY `event_id` (`event_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `event` (`EVENT_ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`EMAIL`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `event`
--

DROP TABLE IF EXISTS `event`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `event` (
  `EVENT_ID` int NOT NULL AUTO_INCREMENT,
  `start_time` datetime DEFAULT NULL,
  `end_time` datetime DEFAULT NULL,
  `LOCATION` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `DESCRIPTION` text COLLATE utf8mb4_general_ci NOT NULL,
  `COST` float DEFAULT NULL,
  `IS_APPROVED` tinyint DEFAULT NULL,
  `IS_ACTIVE` tinyint DEFAULT NULL,
  `SCHOOL_ID` int NOT NULL,
  `EVENT_NAME` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `gender_restriction` enum('M','F') COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`EVENT_ID`),
  KEY `SCHOOL_ID_idx` (`SCHOOL_ID`),
  CONSTRAINT `FK_EVENT_SCHOOL_ID` FOREIGN KEY (`SCHOOL_ID`) REFERENCES `school` (`SCHOOL_ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=72 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `event_host`
--

DROP TABLE IF EXISTS `event_host`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `event_host` (
  `EVENT_HOST_ID` int NOT NULL AUTO_INCREMENT,
  `CLUB_ID` int NOT NULL,
  `EVENT_ID` int NOT NULL,
  `is_approved` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`EVENT_HOST_ID`),
  KEY `FK_EVENT_HOST_CLUB_ID_idx` (`CLUB_ID`),
  KEY `FK_EVENT_HOST_EVENT_ID_idx` (`EVENT_ID`),
  CONSTRAINT `FK_EVENT_HOST_CLUB_ID` FOREIGN KEY (`CLUB_ID`) REFERENCES `club` (`CLUB_ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_EVENT_HOST_EVENT_ID` FOREIGN KEY (`EVENT_ID`) REFERENCES `event` (`EVENT_ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=92 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `event_photo`
--

DROP TABLE IF EXISTS `event_photo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `event_photo` (
  `EVENT_PHOTO_ID` int NOT NULL AUTO_INCREMENT,
  `EVENT_ID` int NOT NULL,
  `IMAGE` mediumblob,
  `IMAGE_PREFIX` varchar(45) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`EVENT_PHOTO_ID`),
  KEY `FK_EVENT_PHOTO_EVENT_ID_idx` (`EVENT_ID`),
  CONSTRAINT `FK_EVENT_PHOTO_EVENT_ID` FOREIGN KEY (`EVENT_ID`) REFERENCES `event` (`EVENT_ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `event_tags`
--

DROP TABLE IF EXISTS `event_tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `event_tags` (
  `EVENT_TAG_ID` int NOT NULL AUTO_INCREMENT,
  `EVENT_ID` int NOT NULL,
  `TAG_ID` int DEFAULT NULL,
  PRIMARY KEY (`EVENT_TAG_ID`),
  KEY `FK_EVENT_TAGS_idx` (`TAG_ID`),
  KEY `FK_EVENT_TAGS_EVENT_ID_idx` (`EVENT_ID`),
  CONSTRAINT `FK_EVENT_TAGS_EVENT_ID` FOREIGN KEY (`EVENT_ID`) REFERENCES `event` (`EVENT_ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_EVENT_TAGS_TAG_ID` FOREIGN KEY (`TAG_ID`) REFERENCES `tag` (`TAG_ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=55 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `logos`
--

DROP TABLE IF EXISTS `logos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `logos` (
  `LOGO_ID` int NOT NULL AUTO_INCREMENT,
  `LOGO` mediumblob,
  PRIMARY KEY (`LOGO_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `rsvp`
--

DROP TABLE IF EXISTS `rsvp`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rsvp` (
  `RSVP_ID` int NOT NULL AUTO_INCREMENT,
  `USER_ID` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `EVENT_ID` int NOT NULL,
  `IS_ACTIVE` tinyint DEFAULT NULL,
  `IS_YES` tinyint DEFAULT NULL,
  PRIMARY KEY (`RSVP_ID`),
  UNIQUE KEY `unique_event_user` (`EVENT_ID`,`USER_ID`),
  KEY `FK_RSVP_USER_ID_idx` (`USER_ID`),
  KEY `FK_RSVP_EVENT_ID_idx` (`EVENT_ID`),
  CONSTRAINT `FK_RSVP_EVENT_ID` FOREIGN KEY (`EVENT_ID`) REFERENCES `event` (`EVENT_ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_RSVP_USER_ID` FOREIGN KEY (`USER_ID`) REFERENCES `users` (`EMAIL`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=59 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `school`
--

DROP TABLE IF EXISTS `school`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `school` (
  `SCHOOL_ID` int NOT NULL AUTO_INCREMENT,
  `SCHOOL_NAME` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `SCHOOL_COLOR` varchar(6) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `SCHOOL_LOGO` mediumblob,
  `EMAIL_DOMAIN` varchar(30) COLLATE utf8mb4_general_ci NOT NULL,
  `is_approved` tinyint(1) DEFAULT '0',
  `logo_prefix` varchar(45) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`SCHOOL_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `session_mapping`
--

DROP TABLE IF EXISTS `session_mapping`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `session_mapping` (
  `session_id` varchar(64) NOT NULL,
  `user_email` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `school_id` int NOT NULL,
  `created_at` datetime NOT NULL,
  `expires_at` datetime NOT NULL,
  PRIMARY KEY (`session_id`),
  KEY `user_email` (`user_email`),
  CONSTRAINT `session_mapping_ibfk_1` FOREIGN KEY (`user_email`) REFERENCES `users` (`EMAIL`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tag`
--

DROP TABLE IF EXISTS `tag`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tag` (
  `TAG_ID` int NOT NULL AUTO_INCREMENT,
  `TAG_NAME` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `school_id` int DEFAULT NULL,
  PRIMARY KEY (`TAG_ID`),
  KEY `school_id` (`school_id`),
  CONSTRAINT `tag_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `SCHOOL` (`SCHOOL_ID`),
  CONSTRAINT `tag_ibfk_2` FOREIGN KEY (`school_id`) REFERENCES `SCHOOL` (`SCHOOL_ID`),
  CONSTRAINT `tag_ibfk_3` FOREIGN KEY (`school_id`) REFERENCES `SCHOOL` (`SCHOOL_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_subscription`
--

DROP TABLE IF EXISTS `user_subscription`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_subscription` (
  `SUBSCRIPTION_ID` int NOT NULL AUTO_INCREMENT,
  `EMAIL` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `CLUB_ID` int NOT NULL,
  `IS_ACTIVE` tinyint DEFAULT NULL,
  `SUBSCRIBED_OR_BLOCKED` tinyint DEFAULT NULL,
  PRIMARY KEY (`SUBSCRIPTION_ID`),
  KEY `FK_USER_SUBSCRIPTION_USER_ID_idx` (`EMAIL`),
  KEY `FK_USER_SUBSCRIPTION_CLUB_ID_idx` (`CLUB_ID`),
  CONSTRAINT `FK_USER_SUBSCRIPTION_CLUB_ID` FOREIGN KEY (`CLUB_ID`) REFERENCES `club` (`CLUB_ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_USER_SUBSCRIPTION_USER_ID` FOREIGN KEY (`EMAIL`) REFERENCES `users` (`EMAIL`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_tags`
--

DROP TABLE IF EXISTS `user_tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_tags` (
  `USER_TAG_ID` int NOT NULL AUTO_INCREMENT,
  `TAG_ID` int DEFAULT NULL,
  `USER_ID` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`USER_TAG_ID`),
  KEY `FK_USER_TAGS_TAG_ID_idx` (`TAG_ID`),
  CONSTRAINT `FK_USER_TAGS_TAG_ID` FOREIGN KEY (`TAG_ID`) REFERENCES `tag` (`TAG_ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=80 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `EMAIL` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `EMAIL_VERIFIED` tinyint NOT NULL,
  `PWD1` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `PWD2` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `PWD3` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `gender` enum('M','F','O') COLLATE utf8mb4_general_ci DEFAULT NULL,
  `IS_FACULTY` tinyint NOT NULL,
  `CAN_DELETE_FACULTY` tinyint NOT NULL,
  `IS_ACTIVE` tinyint NOT NULL,
  `SCHOOL_ID` int NOT NULL,
  `NAME` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `RESET_TOKEN` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `is_banned` tinyint(1) DEFAULT '0',
  `EMAIL_FREQUENCY` enum('Weekly','Daily','Never') COLLATE utf8mb4_general_ci DEFAULT 'Weekly',
  `email_event_type` enum('Suggested','Attending','Hosted by Subscribed Clubs','All Events') COLLATE utf8mb4_general_ci DEFAULT NULL,
  `home_filter` enum('All Events','Suggested','Hosted by Subscribed Clubs','Attending') COLLATE utf8mb4_general_ci DEFAULT 'Suggested',
  `calendar_filter` enum('All Events','Suggested','Hosted by Subscribed Clubs','Attending') COLLATE utf8mb4_general_ci DEFAULT 'Attending',
  `clubs_filter` enum('All Clubs','Suggested','Subscribed') COLLATE utf8mb4_general_ci DEFAULT 'Suggested',
  PRIMARY KEY (`EMAIL`),
  KEY `FK_USERS_SCHOOL_ID_idx` (`SCHOOL_ID`),
  CONSTRAINT `FK_USERS_SCHOOL_ID` FOREIGN KEY (`SCHOOL_ID`) REFERENCES `school` (`SCHOOL_ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-03-25 19:35:40
