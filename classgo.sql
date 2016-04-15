create database classgo CHARACTER SET 'utf8' COLLATE 'utf8_general_ci';

use classgo;

create table user (
    id BIGINT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    username  varchar(32) NOT NULL,
    CONSTRAINT SYS_CT_66 UNIQUE(username),
    password  varchar(64),
    email     varchar(64),
    emailVerified BOOLEAN,
    gender        boolean,
    photo       varchar(256),
    fullname  varchar(32),
    studentNo  varchar(32),
    mobile     varchar(32),
    region     varchar(64),
    school     varchar(64),
    brief     varchar(256),
    openID    varchar(64),
    createAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updateAt TIMESTAMP NOT NULL 
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TRIGGER `update_user_trigger` BEFORE UPDATE ON `user`
 FOR EACH ROW SET NEW.`updateAt` = NOW();


create table accessToken (
    id BIGINT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    userId  BIGINT NOT NULL,
    ttl            int,
    ipAddr        varchar(32),
    token       varchar(128) NOT NULL,
    createAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updateAt TIMESTAMP NOT NULL
)ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TRIGGER `update_accessToken_trigger` BEFORE UPDATE ON `accessToken`
 FOR EACH ROW SET NEW.`updateAt` = NOW();


create table post (
    id BIGINT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    title          varchar(128) NOT NULL,
    body        text,
    address     varchar(64),
    time        varchar(64),
    authorId    BIGINT NOT NULL,
    createAt     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updateAt     TIMESTAMP NOT NULL 
)ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TRIGGER `update_post_trigger` BEFORE UPDATE ON `post`
 FOR EACH ROW SET NEW.`updateAt` = NOW();

create table assistant (
    id BIGINT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    postId          BIGINT NOT NULL,
    assistantId    BIGINT NOT NULL,
    createAt     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updateAt     TIMESTAMP NOT NULL 
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TRIGGER `update_assistant_trigger` BEFORE UPDATE ON `assistant`
 FOR EACH ROW SET NEW.`updateAt` = NOW();

create table tag (
    id BIGINT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    title          varchar(32) NOT NULL,
    createAt     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updateAt     TIMESTAMP NOT NULL 
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TRIGGER `update_tag_trigger` BEFORE UPDATE ON `tag`
 FOR EACH ROW SET NEW.`updateAt` = NOW();

create table postTag (
    id BIGINT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    postId          BIGINT NOT NULL,
    tagId    BIGINT NOT NULL,
    createAt     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updateAt     TIMESTAMP NOT NULL 
)ENGINE=InnoDB DEFAULT CHARSET=utf8;
CREATE TRIGGER `update_postTag_trigger` BEFORE UPDATE ON `postTag`
 FOR EACH ROW SET NEW.`updateAt` = NOW();

create table comment (
    id BIGINT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    postId          BIGINT NOT NULL,
    authorId    BIGINT NOT NULL,
    body        text,
    createAt     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updateAt     TIMESTAMP NOT NULL 
)ENGINE=InnoDB DEFAULT CHARSET=utf8;
CREATE TRIGGER `update_comment_trigger` BEFORE UPDATE ON `comment`
 FOR EACH ROW SET NEW.`updateAt` = NOW();

create table lesson (
    id BIGINT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    postId          BIGINT NOT NULL,
    status            numeric,
    starttime      DATETIME NOT NULL,
    timeout           numeric,
    lng             decimal(10, 7),
    lat             decimal(10, 7),
    createAt       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updateAt       TIMESTAMP NOT NULL 
)ENGINE=InnoDB DEFAULT CHARSET=utf8;
CREATE TRIGGER `update_lesson_trigger` BEFORE UPDATE ON `lesson`
 FOR EACH ROW SET NEW.`updateAt` = NOW();

create table sign (
    id BIGINT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    lessonId          BIGINT NOT NULL,
    userId            BIGINT NOT NULL,
    lng                decimal(10, 7),
    lat             decimal(10, 7),
    createAt         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updateAt         TIMESTAMP NOT NULL 
)ENGINE=InnoDB DEFAULT CHARSET=utf8;
CREATE TRIGGER `update_sign_trigger` BEFORE UPDATE ON `sign`
 FOR EACH ROW SET NEW.`updateAt` = NOW();


create table game (
    id BIGINT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    postId          BIGINT,
    userId          BIGINT NOT NULL,         
    status          numeric,
    code            varchar(8) NOT NULL,
    type            numeric,

    createAt       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updateAt       TIMESTAMP NOT NULL 
)ENGINE=InnoDB DEFAULT CHARSET=utf8;
CREATE TRIGGER `update_game_trigger` BEFORE UPDATE ON `game`
FOR EACH ROW SET NEW.`updateAt` = NOW();

create table userGame (
    id BIGINT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    gameId          BIGINT NOT NULL,
    userId          BIGINT NOT NULL,
    status          numeric,
    var1            numeric,
    var2            numeric,

    createAt       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updateAt       TIMESTAMP NOT NULL 
)ENGINE=InnoDB DEFAULT CHARSET=utf8;
CREATE TRIGGER `update_userGame_trigger` BEFORE UPDATE ON `userGame`
FOR EACH ROW SET NEW.`updateAt` = NOW();


