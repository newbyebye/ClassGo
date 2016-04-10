create database classgo;

use classgo;

create table user (
    id BIGINT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    username  varchar(32) NOT NULL,
    CONSTRAINT SYS_CT_66 UNIQUE(username),
    password  varchar(32),
    email     varchar(64),
    emailVerified BOOLEAN,
    gender        boolean,
    photo       varchar(256),
    fullname  varchar(32),
    mobile     varchar(32),
    region     varchar(64),
    school     varchar(64),
    brief     varchar(256),    
    createAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updateAt TIMESTAMP NOT NULL ON UPDATE CURRENT_TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

create table accessToken (
    id BIGINT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    userId  BIGINT NOT NULL,
    ttl            int,
    ipAddr        varchar(32),
    token       varchar(128) NOT NULL,
    createAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updateAt TIMESTAMP NOT NULL ON UPDATE CURRENT_TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


create table post (
    id BIGINT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    title          varchar(128) NOT NULL,
    body        text,
    address     varchar(64),
    time        varchar(64),
    authorId    BIGINT NOT NULL,
    createAt     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updateAt     TIMESTAMP NOT NULL ON UPDATE CURRENT_TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

create table assistant (
    id BIGINT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    postId          BIGINT NOT NULL,
    assistantId    BIGINT NOT NULL,
    createAt     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updateAt     TIMESTAMP NOT NULL ON UPDATE CURRENT_TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

create table tag (
    id BIGINT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    title          varchar(32) NOT NULL,
    createAt     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updateAt     TIMESTAMP NOT NULL ON UPDATE CURRENT_TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

create table postTag (
    id BIGINT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    postId          BIGINT NOT NULL,
    tagId    BIGINT NOT NULL,
    createAt     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updateAt     TIMESTAMP NOT NULL ON UPDATE CURRENT_TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

create table comment (
    id BIGINT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    postId          BIGINT NOT NULL,
    authorId    BIGINT NOT NULL,
    body        text,
    createAt     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updateAt     TIMESTAMP NOT NULL ON UPDATE CURRENT_TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

create table lesson (
    id BIGINT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    postId          BIGINT NOT NULL,
    status            numeric,
    starttime      TIMESTAMP,
    timeout           numeric,
    lng             decimal(10, 7),
    lat             decimal(10, 7),
    createAt       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updateAt       TIMESTAMP NOT NULL ON UPDATE CURRENT_TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

create table sign (
    id BIGINT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    lessonId          BIGINT NOT NULL,
    userId            BIGINT NOT NULL,
    lng                decimal(10, 7),
    lat             decimal(10, 7),
    createAt         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updateAt         TIMESTAMP NOT NULL ON UPDATE CURRENT_TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);